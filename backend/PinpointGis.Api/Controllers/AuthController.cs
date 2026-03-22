using Microsoft.AspNetCore.Mvc;
using PinpointGis.Api.Contracts.Auth;
using PinpointGis.Api.Services;

namespace PinpointGis.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public sealed class AuthController(IAuthService authService) : ControllerBase
{
    [HttpPost("login")]
    [ProducesResponseType<AuthResponse>(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> Login([FromBody] LoginRequest request, CancellationToken cancellationToken)
    {
        var authResponse = await authService.LoginAsync(request, cancellationToken);
        if (authResponse is null)
        {
            return Unauthorized(new { message = "Invalid credentials." });
        }

        return Ok(authResponse);
    }

    [HttpPost("register")]
    [ProducesResponseType<AuthResponse>(StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    public async Task<IActionResult> Register([FromBody] RegisterRequest request, CancellationToken cancellationToken)
    {
        var authResponse = await authService.RegisterAsync(request, cancellationToken);
        if (authResponse is null)
        {
            return Conflict(new { message = "Email or username already exists." });
        }

        return StatusCode(StatusCodes.Status201Created, authResponse);
    }
}
