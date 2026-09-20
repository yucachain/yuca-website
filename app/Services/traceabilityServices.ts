import { TraceabilityData } from '@/app/types/traceability';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/backend-api/api/v1';

async function fetcher<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'ngrok-skip-browser-warning': 'true',
      ...(options?.headers || {}),
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `API Error: ${response.statusText}`);
  }

  return response.json();
}

export const TraceabilityApi = {
  /**
   * GET /api/v1/traceability/{code}
   * Retrieve supply chain provenance and tracking info by batch code/QR code
   */
  getTraceabilityByCode: (code: string): Promise<TraceabilityData> => {
    return fetcher<TraceabilityData>(`/traceability/${encodeURIComponent(code)}`, {
      method: 'GET',
    });
  },
};