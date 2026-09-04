import dns from "dns";

// Common temporary and disposable email domains to prevent spam and fake registrations
const DISPOSABLE_DOMAINS = new Set([
  "mailinator.com",
  "guerrillamail.com",
  "guerrillamailblock.com",
  "sharklasers.com",
  "tempmail.com",
  "temp-mail.org",
  "10minutemail.com",
  "yopmail.com",
  "trashmail.com",
  "throwawaymail.com",
  "dispostable.com",
  "getairmail.com",
  "fakeinbox.com",
  "maildrop.cc",
  "inboxkitten.com",
  "nada.ltd",
  "crazymailing.com",
  "mytemp.email",
]);

/**
 * Validates whether an email format is structurally sound according to RFC standards.
 */
export const isValidEmailFormat = (email) => {
  if (!email || typeof email !== "string") return false;
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
  return emailRegex.test(email.trim());
};

/**
 * Checks whether an email's domain exists in the real world and possesses active Mail Exchange (MX) records.
 * 
 * @param {string} email - The target email address to verify
 * @returns {Promise<{ isValid: boolean, email: string, domain: string, mxFound: boolean, primaryMx?: string, mxCount: number, reason?: string }>}
 */
export const verifyEmailRealWorldDns = async (email) => {
  if (!isValidEmailFormat(email)) {
    return {
      isValid: false,
      email: email || "",
      domain: "",
      mxFound: false,
      mxCount: 0,
      reason: "Invalid email address format.",
    };
  }

  const cleanEmail = email.trim().toLowerCase();
  const domain = cleanEmail.split("@")[1];

  if (!domain) {
    return {
      isValid: false,
      email: cleanEmail,
      domain: "",
      mxFound: false,
      mxCount: 0,
      reason: "Missing email domain.",
    };
  }

  // Reject disposable email domains
  if (DISPOSABLE_DOMAINS.has(domain)) {
    return {
      isValid: false,
      email: cleanEmail,
      domain,
      mxFound: false,
      mxCount: 0,
      reason: `Disposable or temporary email domains (@${domain}) are not permitted.`,
    };
  }

  try {
    // 1. Check DNS MX (Mail Exchange) records
    const mxRecords = await dns.promises.resolveMx(domain);

    if (mxRecords && mxRecords.length > 0) {
      // Sort by priority (lower number = higher priority)
      const sorted = mxRecords.sort((a, b) => a.priority - b.priority);
      const primaryMx = sorted[0].exchange;

      // Null MX check (RFC 7505: exchange === "." or empty means domain does NOT accept mail)
      if (primaryMx === "." || primaryMx === "") {
        return {
          isValid: false,
          email: cleanEmail,
          domain,
          mxFound: false,
          mxCount: 0,
          reason: `The domain @${domain} explicitly rejects incoming mail (Null MX record).`,
        };
      }

      return {
        isValid: true,
        email: cleanEmail,
        domain,
        mxFound: true,
        primaryMx,
        mxCount: mxRecords.length,
      };
    }
  } catch (mxError) {
    // MX lookup failed, check A record fallback (RFC 5321 Section 5.1 fallback)
    try {
      const aRecords = await dns.promises.resolve4(domain);
      if (aRecords && aRecords.length > 0) {
        return {
          isValid: true,
          email: cleanEmail,
          domain,
          mxFound: false,
          primaryMx: aRecords[0],
          mxCount: 0,
        };
      }
    } catch (aError) {
      // Both MX and A record lookups failed
      return {
        isValid: false,
        email: cleanEmail,
        domain,
        mxFound: false,
        mxCount: 0,
        reason: `Domain @${domain} does not exist in DNS or has no active mail servers.`,
      };
    }
  }

  return {
    isValid: false,
    email: cleanEmail,
    domain,
    mxFound: false,
    mxCount: 0,
    reason: `Unable to verify mail servers for @${domain}.`,
  };
};

export default {
  isValidEmailFormat,
  verifyEmailRealWorldDns,
};
