import { apiClient } from "../../services/apiClient";
import type { CreateLocationPayload, LocationItem } from "./locationTypes";

export async function fetchLocations(): Promise<LocationItem[]> {
  const { data } = await apiClient.get<LocationItem[]>("/locations");
  return data;
}

export async function createLocation(
  payload: CreateLocationPayload,
): Promise<LocationItem> {
  const { data } = await apiClient.post<LocationItem>("/locations", payload);
  return data;
}

export async function setFavorite(
  locationId: number,
  isFavorite: boolean,
): Promise<void> {
  await apiClient.post(`/locations/${locationId}/favorite`, { isFavorite });
}
