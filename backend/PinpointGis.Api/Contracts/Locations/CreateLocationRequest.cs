using System.ComponentModel.DataAnnotations;

namespace PinpointGis.Api.Contracts.Locations;

public sealed class CreateLocationRequest
{
    [Required, MaxLength(120)]
    public string Name { get; set; } = string.Empty;

    [Required, MaxLength(500)]
    public string Description { get; set; } = string.Empty;

    [Range(-90, 90)]
    public double Latitude { get; set; }

    [Range(-180, 180)]
    public double Longitude { get; set; }

    [Required, MaxLength(40)]
    public string Category { get; set; } = "Commercial";

    [Required, MaxLength(40)]
    public string Status { get; set; } = "Active";
}
