using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;

namespace PinpointGis.Api.Extensions;

public static class ClaimsPrincipalExtensions
{
    public static bool TryGetUserId(this ClaimsPrincipal principal, out string userId)
    {
        userId = principal.FindFirstValue(ClaimTypes.NameIdentifier)
                 ?? principal.FindFirstValue(JwtRegisteredClaimNames.Sub)
                 ?? string.Empty;

        return !string.IsNullOrWhiteSpace(userId);
    }
}
