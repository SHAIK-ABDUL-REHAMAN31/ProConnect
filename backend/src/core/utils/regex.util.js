/**
 * Regular Expression Security Utility
 * Escapes special regex characters in user-provided search inputs to prevent
 * ReDoS (Regular Expression Denial of Service) and unhandled SyntaxError crashes.
 */
export const escapeRegex = (str) => {
  if (!str || typeof str !== "string") return "";
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};

export default {
  escapeRegex,
};
