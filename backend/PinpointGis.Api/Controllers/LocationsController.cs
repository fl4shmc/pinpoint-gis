using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PinpointGis.Api.Contracts.Locations;
using PinpointGis.Api.Extensions;
using PinpointGis.Api.Services;

namespace PinpointGis.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/[controller]")]
public sealed class LocationsController(ILocationService locationService) : ControllerBase
{
    [HttpGet]
    [ProducesResponseType<IReadOnlyList<LocationResponse>>(StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAll(CancellationToken cancellationToken)
    {
        if (!User.TryGetUserId(out var userId))
        {
            return Unauthorized(new { message = "User identifier claim is missing." });
        }

        var result = await locationService.GetAllAsync(userId, cancellationToken);
        return Ok(result);
    }

    [HttpPost]
    [ProducesResponseType<LocationResponse>(StatusCodes.Status201Created)]
    public async Task<IActionResult> Create([FromBody] CreateLocationRequest request, CancellationToken cancellationToken)
    {
        if (!User.TryGetUserId(out var userId))
        {
            return Unauthorized(new { message = "User identifier claim is missing." });
        }

        var created = await locationService.CreateAsync(userId, request, cancellationToken);
        return StatusCode(StatusCodes.Status201Created, created);
    }

    [HttpPost("{id:int}/favorite")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> ToggleFavorite(int id, [FromBody] ToggleFavoriteRequest request, CancellationToken cancellationToken)
    {
        if (!User.TryGetUserId(out var userId))
        {
            return Unauthorized(new { message = "User identifier claim is missing." });
        }

        var updated = await locationService.SetFavoriteAsync(userId, id, request.IsFavorite, cancellationToken);
        if (!updated)
        {
            return NotFound(new { message = "Location not found." });
        }

        return Ok(new { message = "Favorite updated." });
    }
}
