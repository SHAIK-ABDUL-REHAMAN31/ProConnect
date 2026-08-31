export const errorHandler = (err, req, res, _next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";

  console.error(`[Error] [${req.method} ${req.originalUrl}] - ${statusCode}: ${message}`);
  if (err.stack && process.env.NODE_ENV !== "production") {
    console.error(err.stack);
  }

  res.status(statusCode).json({
    success: false,
    message,
    errors: err.errors || null,
    ...(process.env.NODE_ENV !== "production" ? { stack: err.stack } : {}),
  });
};
