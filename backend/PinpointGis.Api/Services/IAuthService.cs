using PinpointGis.Api.Contracts.Auth;

namespace PinpointGis.Api.Services;

public interface IAuthService
{
    Task<AuthResponse?> LoginAsync(LoginRequest request, CancellationToken cancellationToken);

    Task<AuthResponse?> RegisterAsync(RegisterRequest request, CancellationToken cancellationToken);
}
