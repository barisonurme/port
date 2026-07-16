const ENDPOINT = 'https://contact.barisonurme.com/api/submit';

export type ContactPayload = {
  name: string;
  email: string;
  message: string;
  /** Honeypot field — humans leave it empty, bots fill it in. */
  website: string;
};

export type ContactResult = { ok: true } | { ok: false; message: string };

const GENERIC_ERROR = 'Something went wrong. Try again or email me directly.';
const RATE_LIMIT_ERROR = 'Too many attempts — please wait a minute and try again.';

export async function submitContact(payload: ContactPayload): Promise<ContactResult> {
  let res: Response;
  try {
    res = await fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ site: 'portfolio', ...payload }),
    });
  } catch {
    return { ok: false, message: GENERIC_ERROR };
  }

  if (res.ok) return { ok: true };
  if (res.status === 429) return { ok: false, message: RATE_LIMIT_ERROR };

  try {
    const data = await res.json();
    if (typeof data?.error === 'string' && data.error) {
      return { ok: false, message: data.error };
    }
  } catch {
    // non-JSON error body — fall through to the generic message
  }
  return { ok: false, message: GENERIC_ERROR };
}
