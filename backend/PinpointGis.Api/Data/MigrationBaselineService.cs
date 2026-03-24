using Microsoft.EntityFrameworkCore;

namespace PinpointGis.Api.Data;

public sealed class MigrationBaselineService : IMigrationBaselineService
{
    public async Task EnsureMigrationBaselineForLegacyDatabaseAsync(AppDbContext dbContext, CancellationToken cancellationToken)
    {
        var appliedMigrations = await dbContext.Database.GetAppliedMigrationsAsync(cancellationToken);
        if (appliedMigrations.Any())
        {
            return;
        }

        var allMigrations = dbContext.Database.GetMigrations();
        var initialMigrationId = allMigrations.FirstOrDefault();
        if (string.IsNullOrWhiteSpace(initialMigrationId))
        {
            return;
        }

        var locationsExists = await TableExistsAsync(dbContext, "Locations", cancellationToken);
        var favoritesExists = await TableExistsAsync(dbContext, "FavoriteLocations", cancellationToken);
        var usersExists = await TableExistsAsync(dbContext, "Users", cancellationToken);
        if (!locationsExists || !favoritesExists || !usersExists)
        {
            return;
        }

        var productVersion = dbContext.Model.GetProductVersion();
        await dbContext.Database.ExecuteSqlInterpolatedAsync($@"
            CREATE TABLE IF NOT EXISTS ""__EFMigrationsHistory"" (
                ""MigrationId"" character varying(150) NOT NULL,
                ""ProductVersion"" character varying(32) NOT NULL,
                CONSTRAINT ""PK___EFMigrationsHistory"" PRIMARY KEY (""MigrationId"")
            );
            INSERT INTO ""__EFMigrationsHistory"" (""MigrationId"", ""ProductVersion"")
            SELECT {initialMigrationId}, {productVersion}
            WHERE NOT EXISTS (
                SELECT 1 FROM ""__EFMigrationsHistory"" WHERE ""MigrationId"" = {initialMigrationId}
            );", cancellationToken);
    }

    private static async Task<bool> TableExistsAsync(AppDbContext dbContext, string tableName, CancellationToken cancellationToken)
    {
        var connection = dbContext.Database.GetDbConnection();
        var openedHere = connection.State != System.Data.ConnectionState.Open;
        if (openedHere)
        {
            await connection.OpenAsync(cancellationToken);
        }

        try
        {
            var tableMetadata = connection.GetSchema("Tables", [null, "public", tableName, null]);
            return tableMetadata.Rows.Count > 0;
        }
        finally
        {
            if (openedHere)
            {
                await connection.CloseAsync();
            }
        }
    }
}
