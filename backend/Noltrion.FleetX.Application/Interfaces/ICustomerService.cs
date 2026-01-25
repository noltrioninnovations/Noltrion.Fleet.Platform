using Noltrion.FleetX.Domain.Entities;
using Noltrion.Framework.Application.Models;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Noltrion.FleetX.Application.Interfaces
{
    public interface ICustomerService
    {
        Task<IEnumerable<Customer>> GetAllAsync();
        Task<Customer?> GetByIdAsync(Guid id);
        Task<ApiResult<Customer>> CreateAsync(Customer customer);
        Task<ApiResult<Customer>> UpdateAsync(Customer customer);
        Task<ApiResult<bool>> DeleteAsync(Guid id);
    }
}
