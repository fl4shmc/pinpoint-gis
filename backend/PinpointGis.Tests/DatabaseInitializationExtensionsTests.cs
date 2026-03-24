using System.Data.Common;
using Microsoft.EntityFrameworkCore;
using PinpointGis.Api.Data;

namespace PinpointGis.Tests;

public sealed class DatabaseInitializationExtensionsTests
{
    [Fact]
    public async Task InitializeDatabaseWithRetryAsync_RetriesTransientFailures_ThenSucceeds()
    {
        using var dbContext = CreateDbContext();
        var attempts = 0;
        var delayCalls = 0;

        await DatabaseInitializationExtensions.InitializeDatabaseWithRetryAsync(
            dbContext,
            CancellationToken.None,
            maxAttempts: 5,
            delay: TimeSpan.Zero,
            initializeAsync: (_, _) =>
            {
                attempts++;
                if (attempts < 3)
                {
                    throw new TimeoutException("Transient");
                }

                return Task.CompletedTask;
            },
            delayAsync: (_, _) =>
            {
                delayCalls++;
                return Task.CompletedTask;
            });

        Assert.Equal(3, attempts);
        Assert.Equal(2, delayCalls);
    }

    [Fact]
    public async Task InitializeDatabaseWithRetryAsync_DoesNotRetryNonTransientFailures()
    {
        using var dbContext = CreateDbContext();
        var attempts = 0;
        var delayCalls = 0;

        await Assert.ThrowsAsync<InvalidOperationException>(() =>
            DatabaseInitializationExtensions.InitializeDatabaseWithRetryAsync(
                dbContext,
                CancellationToken.None,
                maxAttempts: 5,
                delay: TimeSpan.Zero,
                initializeAsync: (_, _) =>
                {
                    attempts++;
                    throw new InvalidOperationException("Non transient");
                },
                delayAsync: (_, _) =>
                {
                    delayCalls++;
                    return Task.CompletedTask;
                }));

        Assert.Equal(1, attempts);
        Assert.Equal(0, delayCalls);
    }

    [Fact]
    public async Task InitializeDatabaseWithRetryAsync_ThrowsAfterMaxTransientAttempts()
    {
        using var dbContext = CreateDbContext();
        var attempts = 0;
        var delayCalls = 0;

        await Assert.ThrowsAsync<TimeoutException>(() =>
            DatabaseInitializationExtensions.InitializeDatabaseWithRetryAsync(
                dbContext,
                CancellationToken.None,
                maxAttempts: 3,
                delay: TimeSpan.Zero,
                initializeAsync: (_, _) =>
                {
                    attempts++;
                    throw new TimeoutException("Transient");
                },
                delayAsync: (_, _) =>
                {
                    delayCalls++;
                    return Task.CompletedTask;
                }));

        Assert.Equal(3, attempts);
        Assert.Equal(2, delayCalls);
    }

    [Fact]
    public void IsTransient_ReturnsTrue_ForTransientExceptions()
    {
        Assert.True(DatabaseInitializationExtensions.IsTransient(new TimeoutException()));
        Assert.True(DatabaseInitializationExtensions.IsTransient(
            new DbUpdateException("db error", new TransientDbException())));
    }

    [Fact]
    public void IsTransient_ReturnsFalse_ForNonTransientExceptions()
    {
        Assert.False(DatabaseInitializationExtensions.IsTransient(new InvalidOperationException()));
        Assert.False(DatabaseInitializationExtensions.IsTransient(new DbUpdateException("db error", new NonTransientDbException())));
    }

    private static AppDbContext CreateDbContext()
    {
        var options = new DbContextOptionsBuilder<AppDbContext>().Options;
        return new AppDbContext(options);
    }

    private sealed class TransientDbException : DbException
    {
        public override bool IsTransient => true;
    }

    private sealed class NonTransientDbException : DbException
    {
        public override bool IsTransient => false;
    }
}
