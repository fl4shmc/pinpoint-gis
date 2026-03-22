using PinpointGis.Api.Contracts.Locations;

namespace PinpointGis.Api.Services;

public interface ILocationService
{
    Task<IReadOnlyList<LocationResponse>> GetAllAsync(string userId, CancellationToken cancellationToken);

    Task<LocationResponse> CreateAsync(string userId, CreateLocationRequest request, CancellationToken cancellationToken);

    Task<bool> SetFavoriteAsync(string userId, int locationId, bool isFavorite, CancellationToken cancellationToken);
}
