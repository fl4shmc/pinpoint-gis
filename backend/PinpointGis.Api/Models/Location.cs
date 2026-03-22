namespace PinpointGis.Api.Models;

public sealed class Location
{
    public int Id { get; set; }

    public string Name { get; set; } = string.Empty;

    public string Description { get; set; } = string.Empty;

    public string Category { get; set; } = "Commercial";

    public string Status { get; set; } = "Active";

    public double Latitude { get; set; }

    public double Longitude { get; set; }

    public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;

    public string CreatedByUserId { get; set; } = string.Empty;
}
