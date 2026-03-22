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

        await InitializeDatabaseWithRetryAsync(
            dbContext,
            cancellationToken,
            DefaultMaxAttempts,
            DefaultDelay,
            SeedDataInitializer.InitializeAsync,
            Task.Delay);
    }

    internal static async Task InitializeDatabaseWithRetryAsync(
        AppDbContext dbContext,
        CancellationToken cancellationToken,
        int maxAttempts,
        TimeSpan delay,
        Func<AppDbContext, Task> initializeAsync,
        Func<TimeSpan, CancellationToken, Task> delayAsync)
    {
        for (var attempt = 1; attempt <= maxAttempts; attempt++)
        {
            try
            {
                await initializeAsync(dbContext);
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
        return exception switch
        {
            TimeoutException => true,
            DbException dbException when dbException.IsTransient => true,
            DbUpdateException { InnerException: DbException innerDbException } when innerDbException.IsTransient => true,
            _ => false
        };
    }
}
