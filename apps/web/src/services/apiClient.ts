import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

function generateRequestId(): string {
  // Prefer crypto.randomUUID when available; otherwise fallback to a time-based id
  try {
    if (typeof crypto !== 'undefined' && typeof (crypto as any).randomUUID === 'function') {
      return (crypto as any).randomUUID();
    }
  } catch {
    // ignore and use fallback
  }
  const random = Math.random().toString(16).slice(2);
  return `req-${Date.now()}-${random}`;
}

// Single shared Axios client for the web app
export const apiClient: AxiosInstance = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

// Attach X-Request-Id to every outbound request for end-to-end tracing
apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const requestIdHeaderName = 'X-Request-Id';
  const hasSet = typeof (config.headers as any)?.set === 'function';
  const existing = (config.headers as any)?.[requestIdHeaderName] ?? (config.headers as any)?.[requestIdHeaderName.toLowerCase()];
  if (!existing) {
    const value = generateRequestId();
    if (hasSet) {
      (config.headers as any).set(requestIdHeaderName, value);
    } else {
      (config.headers as any)[requestIdHeaderName] = value;
    }
  }
  return config;
});

// Optionally surface the server's request id in dev builds for easier debugging
apiClient.interceptors.response.use((response) => {
  const requestId = (response.headers?.['x-request-id'] as string | undefined) ?? undefined;
  if (import.meta.env.DEV && requestId) {
    // eslint-disable-next-line no-console
    console.debug('[api] request completed', {
      url: response.config?.url,
      status: response.status,
      requestId,
    });
  }
  return response;
});

export default apiClient;


