using Microsoft.EntityFrameworkCore;
using Noltrion.FleetX.Application.DTOs.Web;
using Noltrion.FleetX.Application.Interfaces;
using Noltrion.FleetX.Domain.Entities;
using Noltrion.FleetX.Infrastructure.Persistence;
using Noltrion.Framework.Application.Models;
using Noltrion.Framework.Shared.Enums;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Noltrion.FleetX.Infrastructure.Services.Web
{
    public class JobService : IJobService
    {
        private readonly FleetXDbContext _context;

        public JobService(FleetXDbContext context)
        {
            _context = context;
        }

        public async Task<List<JobWebDto>> GetAllAsync()
        {
            return await _context.Jobs
                .Where(j => j.IsActive)
                .OrderByDescending(j => j.CreatedOn)
                .Select(j => new JobWebDto
                {
                    Id = j.Id,
                    CustomerName = j.CustomerName ?? "",
                    EmailReference = j.EmailReference ?? "",
                    PickupAddress = j.PickupAddress ?? "",
                    DeliveryAddress = j.DeliveryAddress ?? "",
                    Status = j.Status.ToString(),
                    Source = j.Source.ToString(),
                    WeightKg = j.WeightKg,
                    VolumeCbm = j.VolumeCbm,
                    RequiredVehicleType = j.RequiredVehicleType,
                    SpecialInstructions = j.SpecialInstructions,
                    RequestedPickupTime = j.RequestedPickupTime,
                    RequestedDeliveryTime = j.RequestedDeliveryTime,
                    CreatedOn = j.CreatedOn
                })
                .ToListAsync();
        }

        public async Task<JobWebDto> GetByIdAsync(Guid id)
        {
            var j = await _context.Jobs.FindAsync(id);
            if (j == null || !j.IsActive) return null;

            return new JobWebDto
            {
                Id = j.Id,
                CustomerName = j.CustomerName,
                EmailReference = j.EmailReference,
                PickupAddress = j.PickupAddress,
                DeliveryAddress = j.DeliveryAddress,
                Status = j.Status.ToString(),
                Source = j.Source.ToString(),
                WeightKg = j.WeightKg,
                VolumeCbm = j.VolumeCbm,
                RequiredVehicleType = j.RequiredVehicleType,
                SpecialInstructions = j.SpecialInstructions,
                RequestedPickupTime = j.RequestedPickupTime,
                RequestedDeliveryTime = j.RequestedDeliveryTime,
                CreatedOn = j.CreatedOn
            };
        }

        public async Task<ApiResult<Guid>> CreateAsync(CreateJobDto dto)
        {
            var job = new Job
            {
                Id = Guid.NewGuid(),
                CustomerName = dto.CustomerName,
                EmailReference = dto.EmailReference,
                PickupAddress = dto.PickupAddress,
                DeliveryAddress = dto.DeliveryAddress,
                RequestedPickupTime = dto.RequestedPickupTime,
                RequestedDeliveryTime = dto.RequestedDeliveryTime,
                WeightKg = dto.WeightKg,
                VolumeCbm = dto.VolumeCbm,
                RequiredVehicleType = dto.RequiredVehicleType,
                SpecialInstructions = dto.SpecialInstructions,
                Status = JobStatus.Received,
                Source = JobSource.Manual,
                CreatedOn = DateTime.UtcNow,
                IsActive = true
            };

            _context.Jobs.Add(job);
            await _context.SaveChangesAsync();

            return ApiResult<Guid>.Ok(job.Id);
        }

        public async Task<ApiResult<Guid>> UpdateAsync(Guid id, CreateJobDto dto)
        {
            var job = await _context.Jobs.FindAsync(id);
            if (job == null) return ApiResult<Guid>.Failure("Job not found");

            job.CustomerName = dto.CustomerName;
            job.EmailReference = dto.EmailReference;
            job.PickupAddress = dto.PickupAddress;
            job.DeliveryAddress = dto.DeliveryAddress;
            job.RequestedPickupTime = dto.RequestedPickupTime;
            job.RequestedDeliveryTime = dto.RequestedDeliveryTime;
            job.WeightKg = dto.WeightKg;
            job.VolumeCbm = dto.VolumeCbm;
            job.RequiredVehicleType = dto.RequiredVehicleType;
            job.SpecialInstructions = dto.SpecialInstructions;

            await _context.SaveChangesAsync();
            return ApiResult<Guid>.Ok(job.Id);
        }

        public async Task<ApiResult<bool>> CancelAsync(Guid id)
        {
            var job = await _context.Jobs.FindAsync(id);
            if (job == null) return ApiResult<bool>.Failure("Job not found");

            job.Status = JobStatus.Cancelled;
            await _context.SaveChangesAsync();
            return ApiResult<bool>.Ok(true);
        }

        public async Task<List<JobWebDto>> GetDeliveredJobsAsync()
        {
             return await _context.Jobs
                .Where(j => j.IsActive && j.Status == JobStatus.Delivered)
                .OrderByDescending(j => j.CreatedOn)
                 .Select(j => new JobWebDto
                {
                    Id = j.Id,
                    CustomerName = j.CustomerName,
                    EmailReference = j.EmailReference,
                    PickupAddress = j.PickupAddress,
                    DeliveryAddress = j.DeliveryAddress,
                    Status = j.Status.ToString(),
                    Source = j.Source.ToString(),
                    WeightKg = j.WeightKg,
                    VolumeCbm = j.VolumeCbm,
                    RequiredVehicleType = j.RequiredVehicleType,
                    SpecialInstructions = j.SpecialInstructions,
                    RequestedPickupTime = j.RequestedPickupTime,
                    RequestedDeliveryTime = j.RequestedDeliveryTime,
                    CreatedOn = j.CreatedOn
                })
                .ToListAsync();
        }
    }
}
