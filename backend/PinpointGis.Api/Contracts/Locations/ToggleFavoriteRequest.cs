using System.ComponentModel.DataAnnotations;

namespace PinpointGis.Api.Contracts.Locations;

public sealed class ToggleFavoriteRequest
{
    [Required]
    public bool IsFavorite { get; set; }
}
