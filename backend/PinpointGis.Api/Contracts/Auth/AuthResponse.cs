namespace PinpointGis.Api.Contracts.Auth;

public sealed class AuthResponse
{
    public string Token { get; set; } = string.Empty;

    public DateTime ExpiresAtUtc { get; set; }

    public string Email { get; set; } = string.Empty;
}
