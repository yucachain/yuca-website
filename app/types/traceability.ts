export interface TimelineEvent {
  title: string;
  description?: string;
  eventType?: string;
  timestamp: string;
  location?: string;
  actor?: string;
  [key: string]: unknown;
}

export interface TraceabilityData {
  code: string;
  batchCode?: string;
  cropType?: string;
  farmerName?: string;
  originLocation?: string;
  harvestDate?: string;
  qualityGrade?: string;
  status?: string;
  timeline?: TimelineEvent[];
  [key: string]: unknown;
}