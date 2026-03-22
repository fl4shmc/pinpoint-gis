namespace PinpointGis.Api.Repositories;

public interface IFavoriteRepository
{
    Task<HashSet<int>> GetFavoriteLocationIdsAsync(string userId, CancellationToken cancellationToken);

    Task SetFavoriteAsync(string userId, int locationId, bool isFavorite, CancellationToken cancellationToken);
}
