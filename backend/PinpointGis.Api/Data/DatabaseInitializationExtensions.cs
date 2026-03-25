using System.Data.Common;
using Microsoft.EntityFrameworkCore;

namespace PinpointGis.Api.Data;

public static class DatabaseInitializationExtensions
{
    internal const int DefaultMaxAttempts = 10;
    internal static readonly TimeSpan DefaultDelay = TimeSpan.FromSeconds(3);

    public static async Task InitializeDatabaseAsync(this WebApplication app, CancellationToken cancellationToken = default)
    {
        using var scope = app.Services.CreateScope();
        var dbContext = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        var databaseInitializer = scope.ServiceProvider.GetRequiredService<IDatabaseInitializer>();

        await InitializeDatabaseWithRetryAsync(
            dbContext,
            cancellationToken,
            DefaultMaxAttempts,
            DefaultDelay,
            databaseInitializer.InitializeAsync,
            Task.Delay);
    }

    internal static async Task InitializeDatabaseWithRetryAsync(
        AppDbContext dbContext,
        CancellationToken cancellationToken,
        int maxAttempts,
        TimeSpan delay,
        Func<AppDbContext, CancellationToken, Task> initializeAsync,
        Func<TimeSpan, CancellationToken, Task> delayAsync)
    {
        // In Docker, the API can start before PostgreSQL is ready.
        // We retry temporary database failures a few times to give Postgres time to come up.
        // On the last attempt we stop retrying and let startup fail with the real error.
        for (var attempt = 1; attempt <= maxAttempts; attempt++)
        {
            try
            {
                await initializeAsync(dbContext, cancellationToken);
                return;
            }
            catch (Exception ex) when (attempt < maxAttempts && IsTransient(ex))
            {
                await delayAsync(delay, cancellationToken);
            }
        }
    }

    internal static bool IsTransient(Exception exception)
    {
        // Only treat likely temporary failures as retryable.
        // Non-transient errors should fail immediately so we don't hide real issues.
        return exception switch
        {
            TimeoutException => true,
            DbException dbException when dbException.IsTransient => true,
            DbUpdateException { InnerException: DbException innerDbException } when innerDbException.IsTransient => true,
            _ => false
        };
    }
}
