using System.Collections.Generic;
using System.Threading.Tasks;
using Noltrion.Framework.Application.Models;
using Noltrion.Framework.Domain.Entities;

namespace Noltrion.Framework.Application.Interfaces
{
    public interface IUserService
    {
        Task<ApiResult<User>> GetByIdAsync(Guid id);
        Task<ApiResult<List<User>>> GetAllAsync();
        Task<ApiResult<User>> CreateAsync(User user, string password, string roleCode, Guid? customerId = null);
        Task<ApiResult<User>> UpdateAsync(User user, string roleCode);
        Task<ApiResult<bool>> DeleteAsync(Guid id);
        Task<ApiResult<bool>> ResetPasswordAsync(Guid id, string newPassword);
    }
}
