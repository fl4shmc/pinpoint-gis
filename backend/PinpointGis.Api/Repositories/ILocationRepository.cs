using PinpointGis.Api.Models;

namespace PinpointGis.Api.Repositories;

public interface ILocationRepository
{
    Task<IReadOnlyList<Location>> GetAllAsync(CancellationToken cancellationToken);

    Task<Location?> GetByIdAsync(int id, CancellationToken cancellationToken);

    Task<Location> AddAsync(Location location, CancellationToken cancellationToken);
}
