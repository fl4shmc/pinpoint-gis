using Microsoft.AspNetCore.Identity;
using PinpointGis.Api.Contracts.Auth;
using PinpointGis.Api.Models;
using PinpointGis.Api.Repositories;
using PinpointGis.Api.Services;

namespace PinpointGis.Tests;

public sealed class AuthServiceTests
{
    [Fact]
    public async Task LoginAsync_ReturnsNull_WhenUserDoesNotExist()
    {
        var userRepository = new StubUserRepository();
        var hasher = new StubPasswordHasher();
        var jwt = new StubJwtTokenService();
        var sut = new AuthService(userRepository, hasher, jwt);

        var result = await sut.LoginAsync(new LoginRequest { Email = "missing@test.com", Password = "secret" }, CancellationToken.None);

        Assert.Null(result);
        Assert.Equal(0, hasher.VerifyCallCount);
        Assert.Equal(0, jwt.GenerateCallCount);
    }

    [Fact]
    public async Task LoginAsync_ReturnsNull_WhenUserIsInactive()
    {
        var userRepository = new StubUserRepository
        {
            UserByEmail = new UserAccount { Email = "user@test.com", PasswordHash = "hash", IsActive = false }
        };
        var hasher = new StubPasswordHasher { VerifyResult = PasswordVerificationResult.Success };
        var jwt = new StubJwtTokenService();
        var sut = new AuthService(userRepository, hasher, jwt);

        var result = await sut.LoginAsync(new LoginRequest { Email = "user@test.com", Password = "secret" }, CancellationToken.None);

        Assert.Null(result);
        Assert.Equal(0, hasher.VerifyCallCount);
        Assert.Equal(0, jwt.GenerateCallCount);
    }

    [Fact]
    public async Task LoginAsync_ReturnsNull_WhenPasswordVerificationFails()
    {
        var userRepository = new StubUserRepository
        {
            UserByEmail = new UserAccount { Id = "u1", Email = "user@test.com", PasswordHash = "hash", IsActive = true }
        };
        var hasher = new StubPasswordHasher { VerifyResult = PasswordVerificationResult.Failed };
        var jwt = new StubJwtTokenService();
        var sut = new AuthService(userRepository, hasher, jwt);

        var result = await sut.LoginAsync(new LoginRequest { Email = "USER@TEST.COM ", Password = "bad" }, CancellationToken.None);

        Assert.Null(result);
        Assert.Equal("user@test.com", userRepository.LastEmailQuery);
        Assert.Equal(1, hasher.VerifyCallCount);
        Assert.Equal(0, jwt.GenerateCallCount);
    }

    [Fact]
    public async Task LoginAsync_ReturnsAuthResponse_WhenCredentialsAreValid()
    {
        var userRepository = new StubUserRepository
        {
            UserByEmail = new UserAccount { Id = "u1", Email = "user@test.com", PasswordHash = "hash", IsActive = true }
        };
        var hasher = new StubPasswordHasher { VerifyResult = PasswordVerificationResult.Success };
        var jwt = new StubJwtTokenService();
        var sut = new AuthService(userRepository, hasher, jwt);

        var result = await sut.LoginAsync(new LoginRequest { Email = "user@test.com", Password = "secret" }, CancellationToken.None);

        Assert.NotNull(result);
        Assert.Equal("stub-token", result.Token);
        Assert.Equal("user@test.com", result.Email);
        Assert.Equal(jwt.ExpiresAtUtc, result.ExpiresAtUtc);
        Assert.Equal(1, jwt.GenerateCallCount);
        Assert.Equal("u1", jwt.LastUserId);
        Assert.Equal("user@test.com", jwt.LastEmail);
    }

    [Fact]
    public async Task RegisterAsync_ReturnsNull_WhenEmailAlreadyExists()
    {
        var userRepository = new StubUserRepository
        {
            UserByEmail = new UserAccount { Email = "existing@test.com" }
        };
        var hasher = new StubPasswordHasher();
        var jwt = new StubJwtTokenService();
        var sut = new AuthService(userRepository, hasher, jwt);

        var result = await sut.RegisterAsync(
            new RegisterRequest { Username = "newuser", Email = "EXISTING@TEST.COM ", Password = "secret123" },
            CancellationToken.None);

        Assert.Null(result);
        Assert.Equal("existing@test.com", userRepository.LastEmailQuery);
        Assert.Equal(0, userRepository.AddCallCount);
        Assert.Equal(0, jwt.GenerateCallCount);
    }

    [Fact]
    public async Task RegisterAsync_ReturnsNull_WhenUsernameAlreadyExists()
    {
        var userRepository = new StubUserRepository
        {
            UserByUsername = new UserAccount { Username = "taken" }
        };
        var hasher = new StubPasswordHasher();
        var jwt = new StubJwtTokenService();
        var sut = new AuthService(userRepository, hasher, jwt);

        var result = await sut.RegisterAsync(
            new RegisterRequest { Username = "TAKEN ", Email = "new@test.com", Password = "secret123" },
            CancellationToken.None);

        Assert.Null(result);
        Assert.Equal("taken", userRepository.LastUsernameQuery);
        Assert.Equal(0, userRepository.AddCallCount);
        Assert.Equal(0, jwt.GenerateCallCount);
    }

    [Fact]
    public async Task RegisterAsync_NormalizesFields_HashesPassword_AndReturnsToken()
    {
        var userRepository = new StubUserRepository();
        var hasher = new StubPasswordHasher();
        var jwt = new StubJwtTokenService();
        var sut = new AuthService(userRepository, hasher, jwt);

        var result = await sut.RegisterAsync(
            new RegisterRequest { Username = "  NewUser  ", Email = "  NEW@TEST.COM ", Password = "secret123" },
            CancellationToken.None);

        Assert.NotNull(result);
        Assert.Equal(1, userRepository.AddCallCount);
        Assert.NotNull(userRepository.LastAddedUser);
        Assert.Equal("newuser", userRepository.LastAddedUser!.Username);
        Assert.Equal("new@test.com", userRepository.LastAddedUser.Email);
        Assert.Equal("hashed-secret123", userRepository.LastAddedUser.PasswordHash);
        Assert.Equal("new@test.com", result.Email);
        Assert.Equal("created-id", jwt.LastUserId);
    }

    private sealed class StubUserRepository : IUserRepository
    {
        public UserAccount? UserByEmail { get; set; }
        public UserAccount? UserByUsername { get; set; }
        public string? LastEmailQuery { get; private set; }
        public string? LastUsernameQuery { get; private set; }
        public int AddCallCount { get; private set; }
        public UserAccount? LastAddedUser { get; private set; }

        public Task<UserAccount?> GetByEmailAsync(string email, CancellationToken cancellationToken)
        {
            LastEmailQuery = email;
            return Task.FromResult(UserByEmail);
        }

        public Task<UserAccount?> GetByUsernameAsync(string username, CancellationToken cancellationToken)
        {
            LastUsernameQuery = username;
            return Task.FromResult(UserByUsername);
        }

        public Task<UserAccount> AddAsync(UserAccount user, CancellationToken cancellationToken)
        {
            AddCallCount++;
            LastAddedUser = user;
            user.Id = "created-id";
            return Task.FromResult(user);
        }
    }

    private sealed class StubPasswordHasher : IPasswordHasher<UserAccount>
    {
        public PasswordVerificationResult VerifyResult { get; set; } = PasswordVerificationResult.Success;
        public int VerifyCallCount { get; private set; }

        public string HashPassword(UserAccount user, string password) => $"hashed-{password}";

        public PasswordVerificationResult VerifyHashedPassword(UserAccount user, string hashedPassword, string providedPassword)
        {
            VerifyCallCount++;
            return VerifyResult;
        }
    }

    private sealed class StubJwtTokenService : IJwtTokenService
    {
        public int GenerateCallCount { get; private set; }
        public string? LastUserId { get; private set; }
        public string? LastEmail { get; private set; }
        public DateTime ExpiresAtUtc { get; } = new(2030, 1, 1, 0, 0, 0, DateTimeKind.Utc);

        public (string Token, DateTime ExpiresAtUtc) GenerateToken(string userId, string email)
        {
            GenerateCallCount++;
            LastUserId = userId;
            LastEmail = email;
            return ("stub-token", ExpiresAtUtc);
        }
    }
}
