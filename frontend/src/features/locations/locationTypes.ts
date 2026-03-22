export const LOCATION_CATEGORIES = ["Commercial", "Residential"] as const;
export const LOCATION_STATUSES = ["Active", "Pending", "Archived"] as const;

export type LocationCategory = (typeof LOCATION_CATEGORIES)[number];
export type LocationStatus = (typeof LOCATION_STATUSES)[number];
export type LocationCategoryFilter = "all" | LocationCategory;

export interface LocationItem {
  id: number;
  name: string;
  description: string;
  category: LocationCategory;
  status: LocationStatus;
  latitude: number;
  longitude: number;
  isFavorite: boolean;
}

export interface CreateLocationPayload {
  name: string;
  description: string;
  latitude: number;
  longitude: number;
  category: LocationCategory;
  status: LocationStatus;
}
