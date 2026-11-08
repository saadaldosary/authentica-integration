// Server-only reference adapter. Node.js 20+. Not a complete auth service.
const BASE = 'https://api.authentica.sa/api/v2';
const object = x => x !== null && typeof x === 'object' && !Array.isArray(x);
const text = x => typeof x === 'string' && x.length > 0;
const phone = x => typeof x === 'string' && /^\+[1-9]\d{1,14}$/.test(x);
// Basic guard only; production email validation belongs in the application.
const email = x => typeof x === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(x);

export class AuthenticaError extends Error {
  constructor(kind, status) {
    super(`Authentica ${kind}`);
    this.name = 'AuthenticaError';
    this.kind = kind;
    if (status !== undefined) this.status = status;
  }
}
function requireValue(ok) {
  if (!ok) throw new AuthenticaError('invalid_input');
}
function requireContract(ok) {
  if (!ok) throw new AuthenticaError('invalid_response');
}
function destination(input) {
  requireValue(object(input));
  const hasPhone = input.phone !== undefined;
  const hasEmail = input.email !== undefined;
  requireValue(hasPhone !== hasEmail);
  if (hasPhone) {
    requireValue(phone(input.phone));
    return {phone: input.phone};
  }
  requireValue(email(input.email));
  return {email: input.email};
}
function base64(value) {
  return text(value) && value.length % 4 === 0 &&
    /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(value);
}

export function createAuthenticaClient({apiKey, fetchImpl = globalThis.fetch, timeoutMs = 10000} = {}) {
  if (typeof window !== 'undefined') throw new AuthenticaError('server_only');
  requireValue(text(apiKey) && apiKey.trim() === apiKey && !/[\r\n]/.test(apiKey));
  requireValue(typeof fetchImpl === 'function' && Number.isSafeInteger(timeoutMs) && timeoutMs > 0);

  async function request(path, payload) {
    let response;
    try {
      response = await fetchImpl(BASE + path, {
        method: payload === undefined ? 'GET' : 'POST',
        headers: {
          'X-Authorization': apiKey,
          Accept: 'application/json',
          ...(payload === undefined ? {} : {'Content-Type': 'application/json'})
        },
        ...(payload === undefined ? {} : {body: JSON.stringify(payload)}),
        redirect: 'error',
        signal: AbortSignal.timeout(timeoutMs)
      });
    } catch {
      // No raw exception/cause: fetch errors can contain request secrets.
      throw new AuthenticaError('transport_unknown');
    }
    if (!response.ok) throw new AuthenticaError('http_error', response.status);
    let body;
    try { body = await response.json(); }
    catch { throw new AuthenticaError('invalid_response'); }
    requireContract(object(body));
    return body;
  }

  async function biometric(kind, input) {
    requireValue(object(input) && text(input.user_id));
    const keys = kind === 'face'
      ? ['registered_face_image', 'query_face_image']
      : ['registered_audio', 'query_audio'];
    requireValue(keys.every(key => base64(input[key])));
    // Application MUST enforce media byte limits, formats, consent and ownership.
    const body = await request(`/verify-by-${kind}`, {
      user_id: input.user_id,
      [keys[0]]: input[keys[0]], [keys[1]]: input[keys[1]]
    });
    requireContract(typeof body.success === 'boolean');
    if (!body.success) return false;
    requireContract(object(body.data) && body.data.user_id === input.user_id &&
      typeof body.data.result === 'boolean');
    return body.data.result === true;
  }

  return Object.freeze({
    async balance() {
      const body = await request('/balance');
      requireContract(body.success === true && object(body.data) &&
        typeof body.data.balance === 'number' && Number.isFinite(body.data.balance));
      return body.data.balance;
    },
    async sendOtp(input) {
      requireValue(object(input) && ['sms', 'whatsapp', 'email'].includes(input.method));
      requireValue(Number.isSafeInteger(input.template_id));
      const dest = destination(input);
      requireValue(input.method === 'email' ? 'email' in dest : 'phone' in dest);
      // Guide-only extensions are deliberately unsupported until confirmed.
      requireValue(input.otp === undefined && input.fallback_email === undefined);
      const body = await request('/send-otp', {
        method: input.method, ...dest, template_id: input.template_id
      });
      requireContract(typeof body.success === 'boolean');
      return body.success === true;
    },
    async verifyOtp(input) {
      const dest = destination(input);
      requireValue(text(input.otp));
      const body = await request('/verify-otp', {...dest, otp: input.otp});
      requireContract(typeof body.status === 'boolean');
      return body.status === true;
    },
    verifyFace: input => biometric('face', input),
    verifyVoice: input => biometric('voice', input)
  });
}
