using System.Threading.Tasks;
using Noltrion.Framework.Application.Models;
using Noltrion.Framework.Domain.Entities;

namespace Noltrion.Framework.Application.Interfaces
{
    public interface ITokenService
    {
        Task<ApiResult<AuthResponse>> GenerateTokensAsync(User user);
        Task<ApiResult<AuthResponse>> RefreshTokenAsync(string token, string refreshToken);
    }
}
