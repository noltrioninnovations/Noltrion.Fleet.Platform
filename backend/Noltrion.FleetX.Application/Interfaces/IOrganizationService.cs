using Noltrion.FleetX.Application.DTOs;
using Noltrion.Framework.Application.Models;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Noltrion.FleetX.Application.Interfaces
{
    public interface IOrganizationService
    {
        Task<ApiResult<IEnumerable<OrganizationListDto>>> GetAllAsync();
        Task<ApiResult<OrganizationDetailDto>> GetByIdAsync(Guid id);
        Task<ApiResult<Guid>> CreateAsync(OrganizationCreateDto dto);
        Task<ApiResult<string>> UpdateAsync(Guid id, OrganizationUpdateDto dto);
        Task<ApiResult<string>> DeleteAsync(Guid id);
    }
}
