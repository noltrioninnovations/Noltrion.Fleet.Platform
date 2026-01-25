using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Noltrion.FleetX.Domain.Entities;
using Noltrion.Framework.Application.Models;
using Noltrion.FleetX.Application.DTOs.Web;

namespace Noltrion.FleetX.Application.Interfaces
{
    public interface IJobRequestService
    {
        Task<IEnumerable<JobRequest>> GetByCustomerAsync(Guid customerId); // Keep for admin/internal use if needed
        Task<IEnumerable<JobRequest>> GetByUserAsync(Guid userId); // For portal use
        Task<IEnumerable<JobRequest>> GetPendingAsync();
        Task<ApiResult<JobRequest>> CreateForUserAsync(Guid userId, CreateJobRequestDto dto);
        Task<ApiResult<Guid>> ConvertToManifestAsync(Guid requestId, Guid userId); // Returns TripId
    }
}
