using Microsoft.AspNetCore.Identity;
using PinpointGis.Api.Contracts.Auth;
using PinpointGis.Api.Models;
using PinpointGis.Api.Repositories;

namespace PinpointGis.Api.Services;

public sealed class AuthService(
    IUserRepository userRepository,
    IPasswordHasher<UserAccount> passwordHasher,
    IJwtTokenService jwtTokenService) : IAuthService
{
    public async Task<AuthResponse?> LoginAsync(LoginRequest request, CancellationToken cancellationToken)
    {
        var user = await userRepository.GetByEmailAsync(request.Email.Trim().ToLowerInvariant(), cancellationToken);
        if (user is null || !user.IsActive)
        {
            return null;
        }

        var verification = passwordHasher.VerifyHashedPassword(user, user.PasswordHash, request.Password);
        if (verification == PasswordVerificationResult.Failed)
        {
            return null;
        }

        var tokenResult = jwtTokenService.GenerateToken(user.Id, user.Email);
        return new AuthResponse
        {
            Token = tokenResult.Token,
            ExpiresAtUtc = tokenResult.ExpiresAtUtc,
            Email = user.Email
        };
    }

    public async Task<AuthResponse?> RegisterAsync(RegisterRequest request, CancellationToken cancellationToken)
    {
        var normalizedEmail = request.Email.Trim().ToLowerInvariant();
        var normalizedUsername = request.Username.Trim().ToLowerInvariant();

        var existingByEmail = await userRepository.GetByEmailAsync(normalizedEmail, cancellationToken);
        if (existingByEmail is not null)
        {
            return null;
        }

        var existingByUsername = await userRepository.GetByUsernameAsync(normalizedUsername, cancellationToken);
        if (existingByUsername is not null)
        {
            return null;
        }

        var user = new UserAccount
        {
            Username = normalizedUsername,
            Email = normalizedEmail,
            IsActive = true
        };

        user.PasswordHash = passwordHasher.HashPassword(user, request.Password);
        var created = await userRepository.AddAsync(user, cancellationToken);

        var tokenResult = jwtTokenService.GenerateToken(created.Id, created.Email);
        return new AuthResponse
        {
            Token = tokenResult.Token,
            ExpiresAtUtc = tokenResult.ExpiresAtUtc,
            Email = created.Email
        };
    }
}
