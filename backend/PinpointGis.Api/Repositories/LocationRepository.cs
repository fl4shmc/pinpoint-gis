using Microsoft.EntityFrameworkCore;
using PinpointGis.Api.Data;
using PinpointGis.Api.Models;

namespace PinpointGis.Api.Repositories;

public sealed class LocationRepository(AppDbContext dbContext) : ILocationRepository
{
    public async Task<IReadOnlyList<Location>> GetAllAsync(CancellationToken cancellationToken)
    {
        return await dbContext.Locations
            .AsNoTracking()
            .OrderByDescending(x => x.CreatedAtUtc)
            .ToListAsync(cancellationToken);
    }

    public async Task<Location?> GetByIdAsync(int id, CancellationToken cancellationToken)
    {
        return await dbContext.Locations
            .AsNoTracking()
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);
    }

    public async Task<Location> AddAsync(Location location, CancellationToken cancellationToken)
    {
        dbContext.Locations.Add(location);
        await dbContext.SaveChangesAsync(cancellationToken);
        return location;
    }
}
