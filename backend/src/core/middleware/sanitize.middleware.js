/**
 * NoSQL Injection & Input Sanitization Middleware
 * Recursively neutralizes MongoDB query selectors ($gt, $ne, $where),
 * script injections, inline event handlers, and dangerous URI schemes.
 */

const sanitizeString = (value) => {
  if (typeof value !== "string") return value;
  return value
    // Remove <script>...</script> blocks
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    // Remove inline event handlers: onerror=, onload=, onclick=, onfocus=, onmouseover=, etc.
    .replace(/\bon\w+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]*)/gi, "")
    // Remove javascript:, vbscript:, data:text/html URI schemes
    .replace(/(?:javascript|vbscript|data\s*:\s*text\/html)\s*:/gi, "")
    // Remove <iframe>, <object>, <embed>, <form>, <base> tags
    .replace(/<\s*\/?\s*(iframe|object|embed|form|base)\b[^>]*>/gi, "");
};

const sanitizeObject = (obj) => {
  if (!obj || typeof obj !== "object") return obj;

  if (Array.isArray(obj)) {
    return obj.map(sanitizeObject);
  }

  const clean = {};
  for (const [key, value] of Object.entries(obj)) {
    // Strip leading dollar signs or dots to block MongoDB operator injection ($gt, $ne, $where, etc.)
    const cleanKey = key.replace(/^\$|\./g, "_");

    if (typeof value === "string") {
      clean[cleanKey] = sanitizeString(value);
    } else if (typeof value === "object" && value !== null) {
      clean[cleanKey] = sanitizeObject(value);
    } else {
      clean[cleanKey] = value;
    }
  }
  return clean;
};

export const sanitizeInputs = (req, res, next) => {
  if (req.body) req.body = sanitizeObject(req.body);

  // Express 5: req.query is a read-only getter, so sanitize values in-place
  if (req.query && typeof req.query === "object") {
    for (const key of Object.keys(req.query)) {
      if (typeof req.query[key] === "string") {
        req.query[key] = sanitizeString(req.query[key]);
      }
    }
  }

  if (req.params && typeof req.params === "object") {
    try {
      req.params = sanitizeObject(req.params);
    } catch {
      // Express 5 may also make params read-only in some cases
      for (const key of Object.keys(req.params)) {
        if (typeof req.params[key] === "string") {
          req.params[key] = sanitizeString(req.params[key]);
        }
      }
    }
  }

  next();
};
