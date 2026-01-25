using Noltrion.FleetX.Application.DTOs.Web;
using Noltrion.Framework.Application.Models;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Noltrion.FleetX.Application.Interfaces
{
    public interface IDriverService
    {
        Task<ApiResult<IEnumerable<DriverWebDto>>> GetAllAsync();
        Task<ApiResult<DriverWebDto>> GetByIdAsync(Guid id);
        Task<ApiResult<DriverWebDto>> CreateAsync(CreateDriverDto dto);
        Task<ApiResult<string>> UpdateAsync(Guid id, CreateDriverDto dto);
        Task<ApiResult<string>> DeleteAsync(Guid id);
    }
}
