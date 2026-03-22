using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PinpointGis.Api.Contracts.Locations;
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
        var userId = GetUserId();
        var result = await locationService.GetAllAsync(userId, cancellationToken);
        return Ok(result);
    }

    [HttpPost]
    [ProducesResponseType<LocationResponse>(StatusCodes.Status201Created)]
    public async Task<IActionResult> Create([FromBody] CreateLocationRequest request, CancellationToken cancellationToken)
    {
        var userId = GetUserId();
        var created = await locationService.CreateAsync(userId, request, cancellationToken);
        return StatusCode(StatusCodes.Status201Created, created);
    }

    [HttpPost("{id:int}/favorite")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> ToggleFavorite(int id, [FromBody] ToggleFavoriteRequest request, CancellationToken cancellationToken)
    {
        var userId = GetUserId();
        var updated = await locationService.SetFavoriteAsync(userId, id, request.IsFavorite, cancellationToken);
        if (!updated)
        {
            return NotFound(new { message = "Location not found." });
        }

        return Ok(new { message = "Favorite updated." });
    }

    private string GetUserId()
    {
        return User.FindFirstValue(ClaimTypes.NameIdentifier)
               ?? User.FindFirstValue(JwtRegisteredClaimNames.Sub)
               ?? "demo-user";
    }
}
