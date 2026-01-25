using System.Collections.Generic;
using System.Threading.Tasks;
using Noltrion.FleetX.Application.DTOs.Common;
using Noltrion.FleetX.Application.DTOs.Mobile;
using Noltrion.FleetX.Application.DTOs.Web;
using Noltrion.Framework.Application.Models;

namespace Noltrion.FleetX.Application.Interfaces
{
    public interface IVehicleService
    {
        Task<ApiResult<IEnumerable<VehicleWebDto>>> GetAllWebAsync();
        Task<ApiResult<IEnumerable<VehicleMobileDto>>> GetAllMobileAsync();
        Task<ApiResult<VehicleWebDto>> GetByIdAsync(Guid id);
        Task<ApiResult<VehicleWebDto>> CreateAsync(CreateVehicleDto dto);
        Task<ApiResult<string>> UpdateAsync(Guid id, CreateVehicleDto dto);
        Task<ApiResult<string>> DeleteAsync(Guid id);
    }
}
