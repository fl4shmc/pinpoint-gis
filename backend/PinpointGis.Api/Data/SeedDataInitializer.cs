using Microsoft.EntityFrameworkCore;

namespace PinpointGis.Api.Data;

public sealed class SeedDataInitializer(
    IMigrationBaselineService migrationBaselineService,
    ILocationSeedService locationSeedService) : IDatabaseInitializer
{
    public async Task InitializeAsync(AppDbContext dbContext, CancellationToken cancellationToken)
    {
        await migrationBaselineService.EnsureMigrationBaselineForLegacyDatabaseAsync(dbContext, cancellationToken);
        await dbContext.Database.MigrateAsync(cancellationToken);
        await locationSeedService.SeedLocationsIfEmptyAsync(dbContext, cancellationToken);
    }
}
