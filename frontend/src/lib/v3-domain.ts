export interface VehicleRecord {
  id: string;
  workshop_id: string;
  vin: string;
  plate: string | null;
  manufacturer: string;
  model: string;
  nickname: string | null;
  created_at: string;
  updated_at: string;
}

export type Locale = "zh-TW" | "zh-CN";
