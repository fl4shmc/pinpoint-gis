using PinpointGis.Api.Models;

namespace PinpointGis.Api.Repositories;

public interface IUserRepository
{
    Task<UserAccount?> GetByEmailAsync(string email, CancellationToken cancellationToken);

    Task<UserAccount?> GetByUsernameAsync(string username, CancellationToken cancellationToken);

    Task<UserAccount> AddAsync(UserAccount user, CancellationToken cancellationToken);
}
