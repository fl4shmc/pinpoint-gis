namespace PinpointGis.Api.Data;

public interface ILocationSeedService
{
    Task SeedLocationsIfEmptyAsync(AppDbContext dbContext, CancellationToken cancellationToken);
}
