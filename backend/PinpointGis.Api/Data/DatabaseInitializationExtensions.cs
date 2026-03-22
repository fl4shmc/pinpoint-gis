using System.Data.Common;
using Microsoft.EntityFrameworkCore;

namespace PinpointGis.Api.Data;

public static class DatabaseInitializationExtensions
{
    public static async Task InitializeDatabaseAsync(this WebApplication app, CancellationToken cancellationToken = default)
    {
        using var scope = app.Services.CreateScope();
        var dbContext = scope.ServiceProvider.GetRequiredService<AppDbContext>();

        await InitializeDatabaseWithRetryAsync(dbContext, cancellationToken);
    }

    private static async Task InitializeDatabaseWithRetryAsync(AppDbContext dbContext, CancellationToken cancellationToken)
    {
        const int maxAttempts = 10;
        var delay = TimeSpan.FromSeconds(3);

        for (var attempt = 1; attempt <= maxAttempts; attempt++)
        {
            try
            {
                await SeedDataInitializer.InitializeAsync(dbContext);
                return;
            }
            catch (Exception ex) when (attempt < maxAttempts && IsTransient(ex))
            {
                await Task.Delay(delay, cancellationToken);
            }
        }
    }

    private static bool IsTransient(Exception exception)
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
