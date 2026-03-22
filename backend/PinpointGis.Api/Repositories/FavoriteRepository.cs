using Microsoft.EntityFrameworkCore;
using PinpointGis.Api.Data;
using PinpointGis.Api.Models;

namespace PinpointGis.Api.Repositories;

public sealed class FavoriteRepository(AppDbContext dbContext) : IFavoriteRepository
{
    public async Task<HashSet<int>> GetFavoriteLocationIdsAsync(string userId, CancellationToken cancellationToken)
    {
        var locationIds = await dbContext.FavoriteLocations
            .AsNoTracking()
            .Where(x => x.UserId == userId)
            .Select(x => x.LocationId)
            .ToListAsync(cancellationToken);

        return locationIds.ToHashSet();
    }

    public async Task SetFavoriteAsync(string userId, int locationId, bool isFavorite, CancellationToken cancellationToken)
    {
        var existing = await dbContext.FavoriteLocations
            .FirstOrDefaultAsync(x => x.UserId == userId && x.LocationId == locationId, cancellationToken);

        if (isFavorite && existing is null)
        {
            dbContext.FavoriteLocations.Add(new FavoriteLocation
            {
                UserId = userId,
                LocationId = locationId
            });
        }
        else if (!isFavorite && existing is not null)
        {
            dbContext.FavoriteLocations.Remove(existing);
        }

        await dbContext.SaveChangesAsync(cancellationToken);
    }
}
