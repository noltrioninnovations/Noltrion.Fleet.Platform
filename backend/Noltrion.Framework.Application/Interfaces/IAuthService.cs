using System.Threading.Tasks;
using Noltrion.Framework.Application.Models;

namespace Noltrion.Framework.Application.Interfaces
{
    public interface IAuthService
    {
        Task<ApiResult<AuthResponse>> LoginAsync(string username, string password);
        Task<ApiResult<AuthResponse>> RefreshTokenAsync(string token, string refreshToken);
    }
}
