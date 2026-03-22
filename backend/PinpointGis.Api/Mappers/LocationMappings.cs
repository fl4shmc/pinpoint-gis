using PinpointGis.Api.Contracts.Locations;
using PinpointGis.Api.Models;

namespace PinpointGis.Api.Mappers;

public static class LocationMappings
{
    public static LocationResponse ToLocationResponse(this Location location, bool isFavorite)
    {
        return new LocationResponse
        {
            Id = location.Id,
            Name = location.Name,
            Description = location.Description,
            Latitude = location.Latitude,
            Longitude = location.Longitude,
            Category = location.Category,
            Status = location.Status,
            IsFavorite = isFavorite
        };
    }
}
