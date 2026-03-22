namespace PinpointGis.Api.Models;

public sealed class FavoriteLocation
{
    public int Id { get; set; }

    public string UserId { get; set; } = string.Empty;

    public int LocationId { get; set; }

    public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;
}
