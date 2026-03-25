using Microsoft.EntityFrameworkCore;

namespace PinpointGis.Api.Data;

public sealed class SeedDataInitializer(
    IMigrationBaselineService migrationBaselineService,
    ILocationSeedService locationSeedService) : IDatabaseInitializer
{
    public async Task InitializeAsync(AppDbContext dbContext, CancellationToken cancellationToken)
    {
        // Step 1: mark legacy databases so EF knows where migration history should start.
        await migrationBaselineService.EnsureMigrationBaselineForLegacyDatabaseAsync(dbContext, cancellationToken);
        // Step 2: bring schema to the latest version.
        await dbContext.Database.MigrateAsync(cancellationToken);
        // Step 3: seed data only after schema is current.
        await locationSeedService.SeedLocationsIfEmptyAsync(dbContext, cancellationToken);
    }
}
