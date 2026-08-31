/**
 * NoSQL Injection & Input Sanitization Middleware
 * Recursively neutralizes MongoDB query selectors ($gt, $ne, $where) and malicious script injections.
 */

const sanitizeObject = (obj) => {
  if (!obj || typeof obj !== "object") return obj;

  if (Array.isArray(obj)) {
    return obj.map(sanitizeObject);
  }

  const clean = {};
  for (const [key, value] of Object.entries(obj)) {
    // Strip leading dollar signs or dots to block MongoDB operator injection
    const cleanKey = key.replace(/^\$|\./g, "_");

    if (typeof value === "string") {
      // Neutralize potential script tags and javascript: URIs in input
      clean[cleanKey] = value
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
        .replace(/javascript:/gi, "");
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
        req.query[key] = req.query[key]
          .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
          .replace(/javascript:/gi, "");
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
          req.params[key] = req.params[key]
            .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
            .replace(/javascript:/gi, "");
        }
      }
    }
  }

  next();
};
