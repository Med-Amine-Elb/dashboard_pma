import { Configuration } from '@/api/generated';

export function getApiConfig(token: string | null) {
  return new Configuration({
    basePath: 'http://localhost:8080/api',
    baseOptions: {
      headers: token
        ? { Authorization: `Bearer ${token}` }
        : {},
    },
  });
}

export function getUserIdFromToken(token: string): string | null {
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.sub || payload.id || null;
  } catch {
    return null;
  }
} 