using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;

namespace PinpointGis.Api.Extensions;

public static class ClaimsPrincipalExtensions
{
    public static bool TryGetUserId(this ClaimsPrincipal principal, out string userId)
    {
        // Try NameIdentifier first (common in ASP.NET), then fall back to JWT "sub".
        userId = principal.FindFirstValue(ClaimTypes.NameIdentifier)
                 ?? principal.FindFirstValue(JwtRegisteredClaimNames.Sub)
                 ?? string.Empty;

        return !string.IsNullOrWhiteSpace(userId);
    }
}
