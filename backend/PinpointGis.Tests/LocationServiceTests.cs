using PinpointGis.Api.Contracts.Locations;
using PinpointGis.Api.Models;
using PinpointGis.Api.Repositories;
using PinpointGis.Api.Services;

namespace PinpointGis.Tests;

public sealed class LocationServiceTests
{
    [Fact]
    public async Task GetAllAsync_MapsFavoritesCorrectly()
    {
        var locationRepository = new StubLocationRepository
        {
            AllLocations =
            [
                new Location { Id = 1, Name = "A", Description = "desc", Category = "Commercial", Status = "Active", Latitude = 1, Longitude = 2, CreatedByUserId = "u" },
                new Location { Id = 2, Name = "B", Description = "desc", Category = "Residential", Status = "Pending", Latitude = 3, Longitude = 4, CreatedByUserId = "u" }
            ]
        };
        var favoriteRepository = new StubFavoriteRepository { FavoriteIds = [2] };
        var sut = new LocationService(locationRepository, favoriteRepository);

        var result = await sut.GetAllAsync("u1", CancellationToken.None);

        Assert.Collection(
            result,
            first => Assert.False(first.IsFavorite),
            second => Assert.True(second.IsFavorite));
    }

    [Fact]
    public async Task CreateAsync_SetsCreatedByUserId_AndReturnsMappedResponse()
    {
        var locationRepository = new StubLocationRepository();
        var favoriteRepository = new StubFavoriteRepository();
        var sut = new LocationService(locationRepository, favoriteRepository);

        var request = new CreateLocationRequest
        {
            Name = "Place",
            Description = "Description",
            Latitude = 6.9,
            Longitude = 79.8,
            Category = "Commercial",
            Status = "Active"
        };

        var result = await sut.CreateAsync("user-123", request, CancellationToken.None);

        Assert.Equal("user-123", locationRepository.LastAddedLocation?.CreatedByUserId);
        Assert.Equal("Place", result.Name);
        Assert.False(result.IsFavorite);
    }

    [Fact]
    public async Task SetFavoriteAsync_ReturnsFalse_WhenLocationNotFound()
    {
        var locationRepository = new StubLocationRepository { SingleLocation = null };
        var favoriteRepository = new StubFavoriteRepository();
        var sut = new LocationService(locationRepository, favoriteRepository);

        var result = await sut.SetFavoriteAsync("u1", 99, true, CancellationToken.None);

        Assert.False(result);
        Assert.Equal(0, favoriteRepository.SetFavoriteCallCount);
    }

    [Fact]
    public async Task SetFavoriteAsync_CallsRepository_WhenLocationExists()
    {
        var locationRepository = new StubLocationRepository { SingleLocation = new Location { Id = 7, Name = "X", Description = "D", Category = "Commercial", Status = "Active", CreatedByUserId = "u" } };
        var favoriteRepository = new StubFavoriteRepository();
        var sut = new LocationService(locationRepository, favoriteRepository);

        var result = await sut.SetFavoriteAsync("u1", 7, true, CancellationToken.None);

        Assert.True(result);
        Assert.Equal(1, favoriteRepository.SetFavoriteCallCount);
        Assert.Equal("u1", favoriteRepository.LastUserId);
        Assert.Equal(7, favoriteRepository.LastLocationId);
        Assert.True(favoriteRepository.LastIsFavorite);
    }

    private sealed class StubLocationRepository : ILocationRepository
    {
        public IReadOnlyList<Location> AllLocations { get; set; } = [];
        public Location? SingleLocation { get; set; } = new();
        public Location? LastAddedLocation { get; private set; }

        public Task<IReadOnlyList<Location>> GetAllAsync(CancellationToken cancellationToken) =>
            Task.FromResult(AllLocations);

        public Task<Location?> GetByIdAsync(int id, CancellationToken cancellationToken) =>
            Task.FromResult(SingleLocation);

        public Task<Location> AddAsync(Location location, CancellationToken cancellationToken)
        {
            LastAddedLocation = location;
            location.Id = 101;
            return Task.FromResult(location);
        }
    }

    private sealed class StubFavoriteRepository : IFavoriteRepository
    {
        public HashSet<int> FavoriteIds { get; set; } = [];
        public int SetFavoriteCallCount { get; private set; }
        public string? LastUserId { get; private set; }
        public int LastLocationId { get; private set; }
        public bool LastIsFavorite { get; private set; }

        public Task<HashSet<int>> GetFavoriteLocationIdsAsync(string userId, CancellationToken cancellationToken) =>
            Task.FromResult(FavoriteIds);

        public Task SetFavoriteAsync(string userId, int locationId, bool isFavorite, CancellationToken cancellationToken)
        {
            SetFavoriteCallCount++;
            LastUserId = userId;
            LastLocationId = locationId;
            LastIsFavorite = isFavorite;
            return Task.CompletedTask;
        }
    }
}
