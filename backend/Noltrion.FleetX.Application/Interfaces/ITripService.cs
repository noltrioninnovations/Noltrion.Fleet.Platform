using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Noltrion.FleetX.Domain.Entities;
using Noltrion.Framework.Application.Models;
using Noltrion.FleetX.Application.DTOs.Web;

namespace Noltrion.FleetX.Application.Interfaces
{
    public interface ITripService
    {
        Task<IEnumerable<Trip>> GetAllAsync();
        Task<Trip> GetByIdAsync(Guid id);
        Task<ApiResult<Trip>> CreateAsync(CreateTripDto dto);
        Task<ApiResult<string>> UpdateAsync(Guid id, CreateTripDto dto);
        Task<ApiResult<string>> UpdateTripStatusAsync(Guid tripId, string status);
        Task<ApiResult<string>> UpdateTripJobStatusAsync(Guid tripJobId, string status); // e.g. PickedUp, Delivered
        Task<ApiResult<string>> UpdatePodUrlAsync(Guid tripId, string podUrl);
    }
}
