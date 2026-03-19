import { Configuration } from "@/api/generated/configuration";

export function getApiConfig(token: string | null) {
  const basePath = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080/api';
  return new Configuration({
    basePath,
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