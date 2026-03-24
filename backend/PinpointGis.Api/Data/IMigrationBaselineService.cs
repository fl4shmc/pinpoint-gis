namespace PinpointGis.Api.Data;

public interface IMigrationBaselineService
{
    Task EnsureMigrationBaselineForLegacyDatabaseAsync(AppDbContext dbContext, CancellationToken cancellationToken);
}
