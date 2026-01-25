using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Noltrion.FleetX.Application.DTOs.Web;
using Noltrion.FleetX.Application.Interfaces;
using Noltrion.FleetX.Domain.Entities;
using Noltrion.Framework.Application.Models;
using Noltrion.Framework.Domain.Entities;
using Noltrion.Framework.Domain.Entities;
using Noltrion.FleetX.Infrastructure.Persistence;

namespace Noltrion.FleetX.Infrastructure.Services.Web
{
    public class JobRequestService : IJobRequestService
    {
        private readonly FleetXDbContext _context;

        public JobRequestService(FleetXDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<JobRequest>> GetByCustomerAsync(Guid customerId)
        {
            return await _context.Set<JobRequest>()
                .Where(x => x.CustomerId == customerId && x.IsActive)
                .Include(x => x.Trip)
                .OrderByDescending(x => x.CreatedOn)
                .ToListAsync();
        }

        public async Task<IEnumerable<JobRequest>> GetPendingAsync()
        {
            return await _context.Set<JobRequest>()
                .Where(x => x.RequestStatus == "Submitted" && x.IsActive)
                .OrderByDescending(x => x.CreatedOn)
                .ToListAsync();
        }

        public async Task<IEnumerable<JobRequest>> GetByUserAsync(Guid userId)
        {
            var user = await _context.Set<User>().FindAsync(userId);
            if (user == null || user.CustomerId == null) return new List<JobRequest>();
            
            return await GetByCustomerAsync(user.CustomerId.Value);
        }

        public async Task<ApiResult<JobRequest>> CreateForUserAsync(Guid userId, CreateJobRequestDto dto)
        {
            var user = await _context.Set<User>().FindAsync(userId);
            if (user == null) return ApiResult<JobRequest>.Failure("User not found");
            
            // SELF-HEALING: If user has no CustomerId, try to link to Default Customer
            if (user.CustomerId == null)
            {
                var defaultCustomer = await _context.Set<Customer>().FirstOrDefaultAsync(c => c.Name == "MegaCorp Logistics");
                if (defaultCustomer != null)
                {
                    user.CustomerId = defaultCustomer.Id;
                    await _context.SaveChangesAsync();
                }
                else
                {
                    return ApiResult<JobRequest>.Failure("User is not linked to a Customer account and Default Customer not found.");
                }
            }

            return await CreateAsync(user.CustomerId.Value, dto);
        }

        // Internal implementation
        public async Task<ApiResult<JobRequest>> CreateAsync(Guid customerId, CreateJobRequestDto dto)
        {
            var request = new JobRequest
            {
                Id = Guid.NewGuid(),
                CustomerId = customerId,
                PreferredDate = dto.PreferredDate,
                PickupLocation = dto.PickupLocation,
                DropLocation = dto.DropLocation,
                CargoDescription = dto.CargoDescription,
                Volume = dto.Volume,
                Weight = dto.Weight,
                RequestStatus = "Submitted",
                CreatedOn = DateTime.UtcNow,
                IsActive = true
            };

            _context.Set<JobRequest>().Add(request);
            await _context.SaveChangesAsync();
            return ApiResult<JobRequest>.Ok(request);
        }

        public async Task<ApiResult<Guid>> ConvertToManifestAsync(Guid requestId, Guid userId)
        {
            var request = await _context.Set<JobRequest>().FindAsync(requestId);
            if (request == null) return ApiResult<Guid>.Failure("Request not found");
            if (request.RequestStatus != "Submitted") return ApiResult<Guid>.Failure("Request already processed");

            // Create Manifest (Trip)
            var trip = new Trip
            {
                Id = Guid.NewGuid(),
                TripDate = request.PreferredDate,
                TripStatus = "Planned",
                TripNumber = "TRIP-" + DateTime.Now.ToString("yyyyMMdd") + "-" + new Random().Next(1000, 9999),
                VehicleId = Guid.Empty, // Placeholder, requires assignment
                DriverId = Guid.Empty, // Placeholder
                NumberOfTrips = 1,
                PickupLocation = request.PickupLocation,
                DropLocation = request.DropLocation,
                JobRequestId = request.Id,
                CreatedOn = DateTime.UtcNow,
                CreatedBy = userId.ToString(),
                IsActive = true,
                Remarks = $"Converted from Request: {request.CargoDescription}"
            };
            
            // Link back
            request.TripId = trip.Id;
            request.RequestStatus = "Converted";
            request.ModifiedOn = DateTime.UtcNow;
            request.ModifiedBy = userId.ToString();

            _context.Set<Trip>().Add(trip);
            await _context.SaveChangesAsync();

            return ApiResult<Guid>.Ok(trip.Id);
        }
    }
}
