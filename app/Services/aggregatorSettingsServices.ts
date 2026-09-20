import {
  AggregatorSettings,
  UpdateAggregatorSettingsPayload,
} from '@/app/types/aggregator-settings';

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

export const AggregatorSettingsApi = {
  /**
   * GET /api/v1/aggregator/settings
   * Retrieve settings for the current aggregator account
   */
  getSettings: (): Promise<AggregatorSettings> => {
    return fetcher<AggregatorSettings>('/aggregator/settings', {
      method: 'GET',
    });
  },

  /**
   * PUT /api/v1/aggregator/settings
   * Update settings for the current aggregator account
   */
  updateSettings: (
    payload: UpdateAggregatorSettingsPayload
  ): Promise<AggregatorSettings> => {
    return fetcher<AggregatorSettings>('/aggregator/settings', {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  },
};