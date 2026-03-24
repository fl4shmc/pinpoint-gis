namespace PinpointGis.Api.Data;

public interface IDatabaseInitializer
{
    Task InitializeAsync(AppDbContext dbContext, CancellationToken cancellationToken);
}
