import { EventEmitter } from "events";
import { getRedisClient, isRedisReady } from "../redis/redisClient.js";
import emailService from "../email/emailService.js";

/**
 * Lean, Zero-Idle-Polling Redis Email Queue
 * 
 * Ponytail Principles:
 * - Zero Quota Burn: Only issues Redis commands when jobs actually exist (0 commands when idle).
 * - Instant API Responses: Offloads slow SMTP network calls to the background.
 * - Resilient Fallback: If Redis is disconnected, directly sends the email without dropping it.
 * - Automatic Retries: Failed SMTP connections are retried up to 3 times before moving to DLQ.
 */

class EmailQueueManager extends EventEmitter {
  constructor() {
    super();
    this.QUEUE_KEY = "queue:email";
    this.DLQ_KEY = "queue:email:dlq";
    this.isProcessing = false;
    this.isWorkerRunning = false;
    this.sweepInterval = null;

    // Listen for immediate job notifications to wake up worker
    this.on("new_job", () => {
      this.processJobs().catch((err) => {
        console.error("[EmailQueue] Worker processing error:", err.message);
      });
    });
  }

  /**
   * Enqueue an email job into Redis, or execute directly if Redis is unavailable
   */
  async enqueue({ type = "verification_otp", to, name, otp, payload = {} }) {
    const redis = getRedisClient();

    // Fallback: If Redis is offline, send directly so the user is not blocked
    if (!redis || !isRedisReady()) {
      console.log(`[EmailQueue] Redis offline. Sending email directly to ${to} via fallback.`);
      return await this.executeJobDirectly({ type, to, name, otp, payload });
    }

    const job = {
      id: "job-" + Math.random().toString(36).substring(2, 10),
      type,
      to,
      name,
      otp,
      payload,
      attempts: 0,
      createdAt: Date.now(),
    };

    try {
      await redis.lPush(this.QUEUE_KEY, JSON.stringify(job));
      console.log(`[EmailQueue] Enqueued ${type} job (${job.id}) for ${to} in Redis`);

      // Wake worker immediately
      this.emit("new_job");
      return { enqueued: true, jobId: job.id, status: "queued" };
    } catch (err) {
      console.warn(`[EmailQueue] Redis push failed (${err.message}). Falling back to direct send.`);
      return await this.executeJobDirectly(job);
    }
  }

  /**
   * Process pending jobs in the queue until empty
   */
  async processJobs() {
    if (this.isProcessing) return;
    this.isProcessing = true;

    try {
      const redis = getRedisClient();
      if (!redis || !isRedisReady()) {
        this.isProcessing = false;
        return;
      }

      let rawJob = await redis.rPop(this.QUEUE_KEY);

      while (rawJob) {
        let job = null;
        try {
          job = JSON.parse(rawJob);
        } catch {
          console.error("[EmailQueue] Malformed job JSON popped, discarding:", rawJob);
          rawJob = await redis.rPop(this.QUEUE_KEY);
          continue;
        }

        try {
          console.log(`[EmailQueue] Processing job ${job.id} (${job.type}) for ${job.to}...`);
          await this.executeJobDirectly(job);
          console.log(`[EmailQueue] Successfully completed job ${job.id}`);
        } catch (jobError) {
          job.attempts = (job.attempts || 0) + 1;
          console.error(`[EmailQueue] Job ${job.id} failed (attempt ${job.attempts}/3):`, jobError.message);

          if (job.attempts < 3) {
            // Re-queue for retry
            await redis.lPush(this.QUEUE_KEY, JSON.stringify(job));
          } else {
            console.error(`[EmailQueue] Job ${job.id} exceeded max retries. Moving to Dead Letter Queue.`);
            await redis.lPush(this.DLQ_KEY, JSON.stringify({ ...job, failedAt: Date.now(), error: jobError.message }));
          }
        }

        // Fetch next job in line
        rawJob = await redis.rPop(this.QUEUE_KEY);
      }
    } catch (err) {
      console.error("[EmailQueue] Error in worker queue cycle:", err.message);
    } finally {
      this.isProcessing = false;
    }
  }

  /**
   * Direct execution of email jobs
   */
  async executeJobDirectly(job) {
    const { type, to, name, otp } = job;
    if (type === "verification_otp") {
      return await emailService.sendVerificationOtpEmail(to, name, otp);
    }
    console.warn(`[EmailQueue] Unknown job type: ${type}`);
    return { success: false, reason: "unknown_job_type" };
  }

  /**
   * Start worker listener on server startup
   */
  startWorker() {
    if (this.isWorkerRunning) return;
    this.isWorkerRunning = true;
    console.log("[EmailQueue] Background Email Worker started (Event-Driven, Zero Idle Quota).");

    // Process any jobs that were queued prior to server reboot
    setTimeout(() => {
      this.processJobs().catch(() => {});
    }, 2000);

    // Light passive sweep every 5 minutes only to catch any stranded jobs during restarts
    this.sweepInterval = setInterval(() => {
      if (isRedisReady()) {
        this.processJobs().catch(() => {});
      }
    }, 5 * 60 * 1000).unref();
  }

  stopWorker() {
    this.isWorkerRunning = false;
    if (this.sweepInterval) {
      clearInterval(this.sweepInterval);
    }
  }
}

export const emailQueue = new EmailQueueManager();
export const enqueueEmail = (data) => emailQueue.enqueue(data);
export const startEmailWorker = () => emailQueue.startWorker();
