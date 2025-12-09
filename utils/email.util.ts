import * as dns from 'dns/promises';

const COMMON_DOMAINS = ['gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com'];

export async function validateEmailDomain(email: string): Promise<boolean> {
  const domain = email.split('@')[1].toLowerCase();

  // 1. Check if domain is in common domains list
  if (!COMMON_DOMAINS.includes(domain)) {
    return false; // likely typo or unsupported domain
  }

  // 2. Check if domain has MX records
  try {
    const records = await dns.resolveMx(domain);
    return records && records.length > 0;
  } catch {
    return false;
  }
}
