export function getApiBaseUrl(): string {
  return (
    import.meta.env.VITE_API_BASE_URL ??
    "https://backend-pinpoint-gis-a6bscjg8dfa6ahfr.southindia-01.azurewebsites.net/api"
  );
}
