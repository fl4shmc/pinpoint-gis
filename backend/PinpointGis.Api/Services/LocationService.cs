using PinpointGis.Api.Contracts.Locations;
using PinpointGis.Api.Mappers;
using PinpointGis.Api.Models;
using PinpointGis.Api.Repositories;

namespace PinpointGis.Api.Services;

public sealed class LocationService(
    ILocationRepository locationRepository,
    IFavoriteRepository favoriteRepository) : ILocationService
{
    public async Task<IReadOnlyList<LocationResponse>> GetAllAsync(string userId, CancellationToken cancellationToken)
    {
        var locations = await locationRepository.GetAllAsync(cancellationToken);
        var favoriteLocationIds = await favoriteRepository.GetFavoriteLocationIdsAsync(userId, cancellationToken);

        return locations
            .Select(location => location.ToLocationResponse(favoriteLocationIds.Contains(location.Id)))
            .ToList();
    }

    public async Task<LocationResponse> CreateAsync(string userId, CreateLocationRequest request, CancellationToken cancellationToken)
    {
        var entity = new Location
        {
            Name = request.Name,
            Description = request.Description,
            Latitude = request.Latitude,
            Longitude = request.Longitude,
            Category = request.Category,
            Status = request.Status,
            CreatedByUserId = userId
        };

        var created = await locationRepository.AddAsync(entity, cancellationToken);

        return created.ToLocationResponse(false);
    }

    public async Task<bool> SetFavoriteAsync(string userId, int locationId, bool isFavorite, CancellationToken cancellationToken)
    {
        var location = await locationRepository.GetByIdAsync(locationId, cancellationToken);
        if (location is null)
        {
            return false;
        }

        await favoriteRepository.SetFavoriteAsync(userId, locationId, isFavorite, cancellationToken);
        return true;
    }
}
