namespace PinpointGis.Api.Services;

public interface IJwtTokenService
{
    (string Token, DateTime ExpiresAtUtc) GenerateToken(string userId, string email);
}
