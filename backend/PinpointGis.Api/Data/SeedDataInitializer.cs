using Microsoft.EntityFrameworkCore;
using PinpointGis.Api.Models;

namespace PinpointGis.Api.Data;

public static class SeedDataInitializer
{
    public static async Task InitializeAsync(AppDbContext dbContext)
    {
        await EnsureMigrationBaselineForLegacyDatabaseAsync(dbContext);
        await dbContext.Database.MigrateAsync();

        if (await dbContext.Locations.AnyAsync())
        {
            return;
        }

        var seedLocations = new List<Location>
        {
            new()
            {
                Name = "Nimbus Tower",
                Description = "Flagship commercial office building.",
                Category = "Commercial",
                Status = "Active",
                Latitude = 6.9271,
                Longitude = 79.8612,
                CreatedByUserId = "seed-user"
            },
            new()
            {
                Name = "Lake View Residency",
                Description = "High-demand residential apartment complex.",
                Category = "Residential",
                Status = "Pending",
                Latitude = 6.9150,
                Longitude = 79.8700,
                CreatedByUserId = "seed-user"
            },
            new()
            {
                Name = "Harbor Trade Center",
                Description = "Mixed-use retail and office location.",
                Category = "Commercial",
                Status = "Active",
                Latitude = 6.9400,
                Longitude = 79.8500,
                CreatedByUserId = "seed-user"
            }
        };

        dbContext.Locations.AddRange(seedLocations);
        await dbContext.SaveChangesAsync();
    }

    private static async Task EnsureMigrationBaselineForLegacyDatabaseAsync(AppDbContext dbContext)
    {
        var appliedMigrations = await dbContext.Database.GetAppliedMigrationsAsync();
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

        var locationsExists = await TableExistsAsync(dbContext, "Locations");
        var favoritesExists = await TableExistsAsync(dbContext, "FavoriteLocations");
        var usersExists = await TableExistsAsync(dbContext, "Users");
        if (!locationsExists || !favoritesExists || !usersExists)
        {
            return;
        }

        var productVersion = dbContext.Model.GetProductVersion();
        var sql = $@"
            CREATE TABLE IF NOT EXISTS ""__EFMigrationsHistory"" (
                ""MigrationId"" character varying(150) NOT NULL,
                ""ProductVersion"" character varying(32) NOT NULL,
                CONSTRAINT ""PK___EFMigrationsHistory"" PRIMARY KEY (""MigrationId"")
            );
            INSERT INTO ""__EFMigrationsHistory"" (""MigrationId"", ""ProductVersion"")
            SELECT '{initialMigrationId}', '{productVersion}'
            WHERE NOT EXISTS (
                SELECT 1 FROM ""__EFMigrationsHistory"" WHERE ""MigrationId"" = '{initialMigrationId}'
            );";
        await dbContext.Database.ExecuteSqlRawAsync(sql);
    }

    private static async Task<bool> TableExistsAsync(AppDbContext dbContext, string tableName)
    {
        var connection = dbContext.Database.GetDbConnection();
        var openedHere = connection.State != System.Data.ConnectionState.Open;
        if (openedHere)
        {
            await connection.OpenAsync();
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
