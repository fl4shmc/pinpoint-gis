import { AddLocationForm } from "../../features/locations/AddLocationForm";
import { LocationDetailsPanel } from "../../features/locations/LocationDetailsPanel";
import { LocationSidebar } from "../../features/locations/LocationSidebar";
import { MapView } from "../../features/locations/MapView";
import {
  useLocationSelection,
  useLocations,
} from "../../features/locations/hooks";
import { useAuth } from "../../features/auth/AuthContext";
import "./MapPage.css";

export function MapPage() {
  const { email, logout } = useAuth();
  const {
    allLocations,
    selectedLocationId,
    setSelectedLocationId,
    loading,
    saving,
    error,
    handleCreate,
    handleToggleFavorite,
  } = useLocations();
  const {
    categoryFilter,
    setCategoryFilter,
    filteredLocations,
    selectedLocation,
  } = useLocationSelection({
    allLocations,
    selectedLocationId,
  });

  return (
    <main className="map-page">
      <header className="topbar">
        <div>
          <h1>Pinpoint GIS</h1>
          <p className="muted">Signed in as {email || "demo@nimbus.local"}</p>
        </div>
        <button type="button" onClick={logout}>
          Logout
        </button>
      </header>

      {error && <p className="error banner">{error}</p>}

      <section className="content-grid">
        <LocationSidebar
          locations={filteredLocations}
          selectedLocationId={selectedLocationId}
          filter={categoryFilter}
          onFilterChange={setCategoryFilter}
          onSelectLocation={(location) => setSelectedLocationId(location.id)}
        />

        <section className="map-content">
          <div className="map-form-row">
            <div className="map-column">
              {loading ? (
                <p>Loading map data...</p>
              ) : (
                <MapView
                  locations={filteredLocations}
                  selectedLocationId={selectedLocationId}
                  onSelectLocation={(location) =>
                    setSelectedLocationId(location.id)
                  }
                />
              )}
            </div>
            <div className="form-column">
              <AddLocationForm onCreate={handleCreate} />
            </div>
          </div>
        </section>

        <LocationDetailsPanel
          location={selectedLocation}
          loading={saving}
          onToggleFavorite={handleToggleFavorite}
        />
      </section>
    </main>
  );
}
