using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Noltrion.FleetX.Application.DTOs.Web;
using Noltrion.Framework.Application.Models;

namespace Noltrion.FleetX.Application.Interfaces
{
    public interface IJobService
    {
        Task<List<JobWebDto>> GetAllAsync();
        Task<JobWebDto> GetByIdAsync(Guid id);
        Task<ApiResult<Guid>> CreateAsync(CreateJobDto dto);
        Task<ApiResult<Guid>> UpdateAsync(Guid id, CreateJobDto dto);
        Task<ApiResult<bool>> CancelAsync(Guid id);
        Task<List<JobWebDto>> GetDeliveredJobsAsync();
    }
}
