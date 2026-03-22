using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using Microsoft.Extensions.Options;
using PinpointGis.Api.Configuration;
using PinpointGis.Api.Services;

namespace PinpointGis.Tests;

public sealed class JwtTokenServiceTests
{
    [Fact]
    public void GenerateToken_ContainsExpectedClaimsIssuerAudienceAndExpiry()
    {
        var options = Options.Create(new JwtOptions
        {
            Issuer = "pinpoint-api",
            Audience = "pinpoint-client",
            Key = "this_is_a_long_test_signing_key_12345",
            ExpirationMinutes = 30
        });
        var sut = new JwtTokenService(options);
        var before = DateTime.UtcNow;

        var (token, expiresAtUtc) = sut.GenerateToken("user-1", "user@test.com");

        var parsed = new JwtSecurityTokenHandler().ReadJwtToken(token);

        Assert.Equal("pinpoint-api", parsed.Issuer);
        Assert.Equal("pinpoint-client", parsed.Audiences.Single());
        Assert.Equal("user-1", parsed.Claims.Single(c => c.Type == JwtRegisteredClaimNames.Sub).Value);
        Assert.Equal("user@test.com", parsed.Claims.Single(c => c.Type == JwtRegisteredClaimNames.Email).Value);
        Assert.Equal("user-1", parsed.Claims.Single(c => c.Type == ClaimTypes.NameIdentifier).Value);
        Assert.Equal("user@test.com", parsed.Claims.Single(c => c.Type == ClaimTypes.Email).Value);
        Assert.InRange(parsed.ValidTo, expiresAtUtc.AddSeconds(-1), expiresAtUtc.AddSeconds(1));

        var minExpected = before.AddMinutes(30).AddSeconds(-2);
        var maxExpected = DateTime.UtcNow.AddMinutes(30).AddSeconds(2);
        Assert.InRange(expiresAtUtc, minExpected, maxExpected);
    }
}
