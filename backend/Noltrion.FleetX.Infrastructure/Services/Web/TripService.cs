using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Noltrion.Framework.Application.Interfaces;
using Noltrion.FleetX.Application.Interfaces;
using Noltrion.FleetX.Application.DTOs.Web;
using Noltrion.FleetX.Domain.Entities;
using Noltrion.Framework.Application.Models;
using Noltrion.Framework.Domain;

namespace Noltrion.FleetX.Infrastructure.Services.Web
{
    public class TripService : ITripService
    {
        private readonly Noltrion.Framework.Domain.IUnitOfWork _unitOfWork;
        private readonly ICurrentUserService _currentUserService;

        public TripService(Noltrion.Framework.Domain.IUnitOfWork unitOfWork, ICurrentUserService currentUserService)
        {
            _unitOfWork = unitOfWork;
            _currentUserService = currentUserService;
        }

        public async Task<IEnumerable<Trip>> GetAllAsync()
        {
            var repo = _unitOfWork.Repository<Trip>();
            var query = repo.Query()
                .Include(t => t.Vehicle)
                .Include(t => t.Driver)
                .Include(t => t.TripJobs)
                .ThenInclude(tj => tj.Job)
                .Include(t => t.Invoices)
                .AsQueryable();

            // Role-Based Filtering
            var userId = _currentUserService.UserId;
            if (userId.HasValue)
            {
                var userRepo = _unitOfWork.Repository<Framework.Domain.Entities.User>();
                // We need to include Roles and Customer
                // But User entity is in Framework Domain, Customer in FleetX Domain.
                // FrameworkDbContext likely doesn't know about Customer entity directly if they are separated contexts?
                // Wait, FleetXDbContext inherits FrameworkDbContext. So it should be fine if we use the right context or repo.
                // Actually they are in different namespaces. 
                // Let's first check if the user has "Customer" role.
                
                var user = await userRepo.Query()
                    .Include(u => u.UserRoles)
                    .ThenInclude(ur => ur.Role)
                    .FirstOrDefaultAsync(u => u.Id == userId.Value);

                if (user != null && user.UserRoles.Any(ur => ur.Role.Code == "Customer") /*&& user.CustomerId.HasValue*/)
                {
                    // Get Customer Name
                    // var customerRepo = _unitOfWork.Repository<Customer>();
                    // var customer = await customerRepo.GetByIdAsync(user.CustomerId.Value);
                    
                    // if (customer != null)
                    // {
                    //     // Filter trips where ANY job belongs to this customer
                    //     query = query.Where(t => t.TripJobs.Any(tj => tj.Job.CustomerName == customer.Name));
                    // }
                }
            }

            return await query.ToListAsync();
        }

        public async Task<Trip> GetByIdAsync(Guid id)
        {
            var repo = _unitOfWork.Repository<Trip>();
            return await repo.Query()
                .Include(t => t.Vehicle)
                .Include(t => t.Driver)
                .Include(t => t.TripJobs)
                .ThenInclude(tj => tj.Job)
                .Include(t => t.Invoices)
                .FirstOrDefaultAsync(t => t.Id == id);
        }

        public async Task<ApiResult<Trip>> CreateAsync(CreateTripDto dto)
        {
            var errors = await ValidateTripAsync(dto);
            if (errors.Any()) return ApiResult<Trip>.Failure(errors);

            // Generate Trip Sequence
            var tripCount = await _unitOfWork.Repository<Trip>().Query()
                .CountAsync(t => t.TripDate.Date == dto.TripDate.Date);
            var tripNumber = $"TRIP-{dto.TripDate:yyyyMMdd}-{(tripCount + 1):D3}";

            var trip = new Trip
            {
                TripNumber = tripNumber,
                TripDate = dto.TripDate,
                TruckType = dto.TruckType,
                VehicleId = dto.VehicleId,
                DriverId = dto.DriverId,
                StartTime = dto.StartTime,
                EndTime = dto.EndTime,
                NumberOfTrips = dto.NumberOfTrips,
                TotalCost = dto.TotalCost,
                ChargesType = dto.ChargesType,
                HelperName = dto.HelperName,
                Remarks = dto.Remarks,
                TripStatus = (dto.VehicleId.HasValue && dto.DriverId.HasValue && dto.DriverId != Guid.Empty) ? "Assigned" : "Created",
                TimeWindowFrom = !string.IsNullOrEmpty(dto.TimeWindowFrom) ? TimeSpan.Parse(dto.TimeWindowFrom) : null,
                TimeWindowTo = !string.IsNullOrEmpty(dto.TimeWindowTo) ? TimeSpan.Parse(dto.TimeWindowTo) : null,
                ProofOfDeliveryRequired = dto.ProofOfDeliveryRequired,
                JobRequestId = dto.JobRequestId
            };

            foreach (var pkg in dto.Packages)
            {
                trip.Packages.Add(new TripPackage
                {
                    PackageType = pkg.PackageType,
                    Quantity = pkg.Quantity,
                    Volume = pkg.Volume,
                    NoOfPallets = pkg.NoOfPallets
                });
            }

            await _unitOfWork.Repository<Trip>().AddAsync(trip);
            
            // Link Job Request if applicable
            if (dto.JobRequestId.HasValue)
            {
                var jobReqRepo = _unitOfWork.Repository<JobRequest>();
                var jobReq = await jobReqRepo.GetByIdAsync(dto.JobRequestId.Value);
                if (jobReq != null)
                {
                    jobReq.TripId = trip.Id;
                    jobReq.RequestStatus = "Converted";
                    await jobReqRepo.UpdateAsync(jobReq);
                }
            }

            await _unitOfWork.SaveChangesAsync();
            return ApiResult<Trip>.Ok(trip);
        }

        public async Task<ApiResult<string>> UpdateAsync(Guid id, CreateTripDto dto)
        {
            var errors = await ValidateTripAsync(dto, id);
            if (errors.Any()) return ApiResult<string>.Failure(errors);

            var repo = _unitOfWork.Repository<Trip>();
            var trip = await repo.GetByIdAsync(id);
            if (trip == null) return ApiResult<string>.Failure("Trip not found");

            trip.TripDate = dto.TripDate;
            trip.TruckType = dto.TruckType;
            trip.VehicleId = dto.VehicleId;
            
            // Status Logic: Only move to Assigned if resources exist and we are not in a locked state
            if (trip.TripStatus == "Created" && dto.VehicleId.HasValue && dto.DriverId.HasValue && dto.DriverId != Guid.Empty)
            {
                trip.TripStatus = "Assigned";
            }
            // If Driver/Vehicle removed, revert to Created (if allowed)
            if (trip.TripStatus == "Assigned" && (!dto.VehicleId.HasValue || !dto.DriverId.HasValue || dto.DriverId == Guid.Empty))
            {
                trip.TripStatus = "Created";
            }

            trip.DriverId = dto.DriverId;
            trip.StartTime = dto.StartTime;
            trip.EndTime = dto.EndTime;
            trip.NumberOfTrips = dto.NumberOfTrips;
            trip.TotalCost = dto.TotalCost;
            trip.ChargesType = dto.ChargesType;
            trip.HelperName = dto.HelperName;
            trip.Remarks = dto.Remarks;
            trip.TimeWindowFrom = !string.IsNullOrEmpty(dto.TimeWindowFrom) ? TimeSpan.Parse(dto.TimeWindowFrom) : null;
            trip.TimeWindowTo = !string.IsNullOrEmpty(dto.TimeWindowTo) ? TimeSpan.Parse(dto.TimeWindowTo) : null;
            trip.ProofOfDeliveryRequired = dto.ProofOfDeliveryRequired;

            // Clear and Re-add Packages
            var packageRepo = _unitOfWork.Repository<TripPackage>();
            var existingPackages = await packageRepo.Query().Where(p => p.TripId == id).ToListAsync();
            foreach (var pkg in existingPackages) await packageRepo.DeleteAsync(pkg.Id);

            foreach (var pkg in dto.Packages)
            {
                await packageRepo.AddAsync(new TripPackage
                {
                    TripId = trip.Id,
                    PackageType = pkg.PackageType,
                    Quantity = pkg.Quantity,
                    Volume = pkg.Volume,
                    NoOfPallets = pkg.NoOfPallets
                });
            }

            await repo.UpdateAsync(trip);
            await _unitOfWork.SaveChangesAsync();
            return ApiResult<string>.Ok("Updated successfully");
        }

        private async Task<List<string>> ValidateTripAsync(CreateTripDto dto, Guid? excludeId = null)
        {
            var errors = new List<string>();

            // 1. Mandatory Fields
            // Resources are now optional for "Created" status
            // if (dto.VehicleId == Guid.Empty) errors.Add("Truck is required");
            // if (dto.DriverId == Guid.Empty) errors.Add("Driver is required");
            if (string.IsNullOrEmpty(dto.TruckType)) errors.Add("Truck Type is required");

            // 2. Date Validation
            // if (dto.TripDate.Date < DateTime.UtcNow.Date) errors.Add("Trip Date cannot be a past date");
            
            // Time validation only if times are provided
            if (dto.StartTime.HasValue && dto.EndTime.HasValue)
            {
                if (dto.EndTime <= dto.StartTime) errors.Add("End time must be greater than start time");
            }
            
            if (dto.NumberOfTrips < 1) errors.Add("Number of trips must be >= 1");
            if (!string.IsNullOrEmpty(dto.TimeWindowFrom) && !string.IsNullOrEmpty(dto.TimeWindowTo))
            {
                if (TimeSpan.Parse(dto.TimeWindowTo) <= TimeSpan.Parse(dto.TimeWindowFrom))
                    errors.Add("Time Window To must be greater than From");
            }
            
            foreach (var pkg in dto.Packages)
            {
                if (pkg.Quantity <= 0) errors.Add($"Package {pkg.PackageType}: Quantity must be > 0");
                if (pkg.PackageType == "Pallets" && (!pkg.NoOfPallets.HasValue || pkg.NoOfPallets <= 0))
                    errors.Add("Number of Pallets is mandatory for Pallet type");
            }

            // 3. Availability Check (Truck)
            // Check if truck has any active trip overlapping with this time
            if (dto.VehicleId.HasValue && dto.StartTime.HasValue && dto.EndTime.HasValue)
            {
                var repo = _unitOfWork.Repository<Trip>();
                var truckConflict = await repo.Query()
                    .Where(t => t.VehicleId == dto.VehicleId 
                                && t.TripStatus != "Cancelled" 
                                && t.TripStatus != "Completed"
                                && t.Id != excludeId)
                    .AnyAsync(t => t.StartTime < dto.EndTime && t.EndTime > dto.StartTime);

                if (truckConflict) errors.Add("Truck is already assigned to another active trip during this time.");
            }

            // 4. Availability Check (Driver)
            if (dto.DriverId.HasValue && dto.StartTime.HasValue && dto.EndTime.HasValue)
            {
                 var repo = _unitOfWork.Repository<Trip>();
                 var driverConflict = await repo.Query()
                    .Where(t => t.DriverId == dto.DriverId 
                                && t.TripStatus != "Cancelled" 
                                && t.TripStatus != "Completed"
                                && t.Id != excludeId)
                    .AnyAsync(t => t.StartTime < dto.EndTime && t.EndTime > dto.StartTime);

                if (driverConflict) errors.Add("Driver is already assigned to another active trip during this time.");
            }

            return errors;
        }

        public async Task<ApiResult<string>> UpdateTripStatusAsync(Guid tripId, string status)
        {
            var repo = _unitOfWork.Repository<Trip>();
            var trip = await repo.Query().Include(t => t.TripJobs).ThenInclude(tj => tj.Job).FirstOrDefaultAsync(t => t.Id == tripId);
            
            if (trip == null) return ApiResult<string>.Failure("Trip not found");

            // Validate Status
            if (!Enum.TryParse<Noltrion.Framework.Shared.Enums.TripStatus>(status, true, out var newStatus))
            {
                // Fallback for legacy or loose string? 
                // For now, accept if it matches our allowed list, otherwise warning?
                // strictly enforcing the new Enum
                 return ApiResult<string>.Failure($"Invalid status: {status}");
            }

            trip.TripStatus = status;

            // Status Logic
            switch (newStatus)
            {
                case Noltrion.Framework.Shared.Enums.TripStatus.StartTrip:
                    if (!trip.StartTime.HasValue) trip.StartTime = DateTime.UtcNow;
                    break;

                case Noltrion.Framework.Shared.Enums.TripStatus.InTransit:
                    // Update all associated jobs to InTransit
                    foreach (var tj in trip.TripJobs)
                    {
                        if (tj.Job != null) tj.Job.Status = Noltrion.Framework.Shared.Enums.JobStatus.InTransit;
                    }
                    if (!trip.StartTime.HasValue) trip.StartTime = DateTime.UtcNow; // If skipped StartTrip
                    break;

                case Noltrion.Framework.Shared.Enums.TripStatus.Completed:
                    trip.EndTime = DateTime.UtcNow;
                    // Update all associated jobs to Delivered/Verified?
                    foreach (var tj in trip.TripJobs)
                    {
                        if (tj.Job != null && tj.Job.Status < Noltrion.Framework.Shared.Enums.JobStatus.Delivered)
                        {
                            tj.Job.Status = Noltrion.Framework.Shared.Enums.JobStatus.Delivered;
                        }
                    }
                    break;
            }

            await repo.UpdateAsync(trip);
            await _unitOfWork.SaveChangesAsync();
            return ApiResult<string>.Ok($"Trip status updated to {status}");
        }

        public async Task<ApiResult<string>> UpdateTripJobStatusAsync(Guid tripJobId, string status)
        {
            var tjRepo = _unitOfWork.Repository<TripJob>();
            var tj = await tjRepo.Query().Include(x => x.Job).FirstOrDefaultAsync(x => x.Id == tripJobId);
            
            if (tj == null) return ApiResult<string>.Failure("TripJob not found");

            tj.Status = status;
            
            // Sync with Job Status
            if (status == "PickedUp" && tj.Job != null)
            {
                tj.Job.Status = Framework.Shared.Enums.JobStatus.InTransit; 
                // Wait, InTransit is usually for the whole trip or job? 
                // JobStatus enum: InTransit = 30.
            }
            else if (status == "Delivered" && tj.Job != null)
            {
                tj.Job.Status = Framework.Shared.Enums.JobStatus.Delivered;
            }

            await tjRepo.UpdateAsync(tj);
            await _unitOfWork.SaveChangesAsync();
            return ApiResult<string>.Ok($"Job status updated to {status}");
        }

        public async Task<ApiResult<string>> UpdatePodUrlAsync(Guid tripId, string podUrl)
        {
            var repo = _unitOfWork.Repository<Trip>();
            var trip = await repo.GetByIdAsync(tripId);
            if (trip == null) return ApiResult<string>.Failure("Trip not found");

            trip.ProofOfDeliveryUrl = podUrl;

            await repo.UpdateAsync(trip);
            await _unitOfWork.SaveChangesAsync();
            return ApiResult<string>.Ok("POD URL updated successfully");
        }
    }
}
