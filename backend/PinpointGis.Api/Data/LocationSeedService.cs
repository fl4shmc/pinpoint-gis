using Microsoft.EntityFrameworkCore;
using PinpointGis.Api.Models;

namespace PinpointGis.Api.Data;

public sealed class LocationSeedService : ILocationSeedService
{
    public async Task SeedLocationsIfEmptyAsync(AppDbContext dbContext, CancellationToken cancellationToken)
    {
        if (await dbContext.Locations.AnyAsync(cancellationToken))
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
        await dbContext.SaveChangesAsync(cancellationToken);
    }
}
