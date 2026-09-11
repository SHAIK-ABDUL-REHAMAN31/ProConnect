import logger from "../../infrastructure/logger/logger.js";

export const errorHandler = (err, req, res, _next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";

  logger.error(message, {
    correlationId: req.correlationId,
    method: req.method,
    url: req.originalUrl,
    statusCode,
    userId: req.user?.id || null,
    stack: process.env.NODE_ENV !== "production" ? err.stack : undefined,
  });

  res.status(statusCode).json({
    success: false,
    message,
    errors: err.errors || null,
    ...(process.env.NODE_ENV !== "production" ? { stack: err.stack } : {}),
  });
};
