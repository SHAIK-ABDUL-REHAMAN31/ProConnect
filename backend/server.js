import http from "http";
import app from "./src/app.js";
import { connectDatabase } from "./src/config/database.js";
import { socketGateway } from "./src/infrastructure/websocket/socketGateway.js";
import { connectRedis } from "./src/infrastructure/redis/redisClient.js";
import { startEmailWorker } from "./src/infrastructure/queues/emailQueue.js";
import logger from "./src/infrastructure/logger/logger.js";
import { ENV } from "./src/config/env.js";

const server = http.createServer(app);

// Initialize Socket.IO Realtime Gateway
socketGateway.initialize(server);

const startServer = async () => {
  try {
    await connectDatabase();
    await connectRedis();
    startEmailWorker();

    server.listen(ENV.PORT, () => {
      logger.info(`Server running in ${ENV.NODE_ENV} mode on port ${ENV.PORT}`, {
        port: ENV.PORT,
        env: ENV.NODE_ENV,
        url: `http://localhost:${ENV.PORT}/api/v1`,
      });
    });
  } catch (error) {
    logger.error("Failed to start server", { error: error.message, stack: error.stack });
    process.exit(1);
  }
};

startServer();

