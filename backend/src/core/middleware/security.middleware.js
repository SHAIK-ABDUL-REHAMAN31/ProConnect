/**
 * Security Headers Middleware (Helmet Equivalent)
 * Protects against XSS, clickjacking, MIME sniffing, and protocol downgrades.
 */
export const securityHeaders = (req, res, next) => {
  // Prevent MIME type sniffing
  res.setHeader("X-Content-Type-Options", "nosniff");

  // Prevent Clickjacking (framing)
  res.setHeader("X-Frame-Options", "SAMEORIGIN");

  // Legacy XSS Protection for older browsers
  res.setHeader("X-XSS-Protection", "1; mode=block");

  // Force HTTPS in production (Strict Transport Security - 1 Year)
  if (process.env.NODE_ENV === "production") {
    res.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains; preload");
  }

  // Referrer Policy
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");

  // Permissions Policy
  res.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=()");

  // Content-Security-Policy: Defense-in-depth against XSS & data injection attacks
  res.setHeader(
    "Content-Security-Policy",
    [
      "default-src 'self'",
      "script-src 'self'",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data: blob: https://res.cloudinary.com https://*.cloudinary.com",
      "connect-src 'self' https://res.cloudinary.com https://api.cloudinary.com",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join("; ")
  );

  // Hide Express server fingerprinting
  res.removeHeader("X-Powered-By");

  next();
};
