using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Noltrion.FleetX.Application.DTOs.Mobile;
using Noltrion.FleetX.Domain.Entities;
using Noltrion.Framework.Application.Models;
using Noltrion.Framework.Domain;
using Noltrion.Framework.Shared.Enums;
using System;
using System.IO;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Noltrion.FleetX.API.Controllers.Mobile
{
    [ApiController]
    [Route("api/mobile/driver")]
    public class MobileDriverController : ControllerBase
    {
        private readonly IUnitOfWork _unitOfWork;

        public MobileDriverController(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        [HttpGet("trips")]
        public async Task<IActionResult> GetMyTrips([FromQuery] Guid driverId)
        {
            if (driverId == Guid.Empty) return BadRequest("DriverId is required");

            var tripRepo = _unitOfWork.Repository<Trip>();
            
            // Should add Include(t => t.Vehicle).Include(t => t.TripJobs).ThenInclude(tj => tj.Job)
            // But Generic Repo might not support complex includes easily without specification pattern.
            // Using DbSet directly or IQueryable if exposed, or FindAsync with constraints.
            // Assuming IRepository exposes basic IQueryable or we fetch and filter.
            
            // Allow repository to return IQueryable if possible, otherwise list and filter.
            // For MVP, we'll fetch all trips for the driver.
            var trips = await tripRepo.FindAsync(t => t.DriverId == driverId && t.TripStatus != "Completed");

            // Needed to fetch related data. MVP: N+1 lazy loading if enabled or manual fetch.
            // The standard generic repository usually needs 'Includes'.
            // If FindAsync(Expression<Func<T, bool>> predicate, params Expression<Func<T, object>>[] includes) exists.
            
            // Let's assume lazy loading is NOT enabled and we need to be careful.
            // For now, I will construct DTOs with available data.
            // If I need related data (Jobs), it's better to verify if IRepository supports includes.
            // Assuming it doesn't support advanced includes yet, I might need to act directly on DbSet if I cast repo?
            // Or just multiple queries.
            
            var tripDtos = new List<MobileTripDto>();
            var tripJobRepo = _unitOfWork.Repository<TripJob>();
            var jobRepo = _unitOfWork.Repository<Job>();
            var vehicleRepo = _unitOfWork.Repository<Vehicle>();

            foreach (var trip in trips)
            {
                if (trip.VehicleId == null) continue;
                var vehicle = await vehicleRepo.GetByIdAsync(trip.VehicleId.Value);
                var tripJobs = (await tripJobRepo.FindAsync(tj => tj.TripId == trip.Id)).OrderBy(tj => tj.SequenceOrder).ToList();
                
                var mobileJobs = new List<MobileJobDto>();
                foreach (var tj in tripJobs)
                {
                    var job = await jobRepo.GetByIdAsync(tj.JobId);
                    if (job != null)
                    {
                        mobileJobs.Add(new MobileJobDto
                        {
                            Id = job.Id,
                            Sequence = tj.SequenceOrder,
                            CustomerName = job.CustomerName,
                            Address = job.DeliveryAddress, // Simplification
                            WeightKg = job.WeightKg,
                            Status = tj.Status
                        });
                    }
                }

                tripDtos.Add(new MobileTripDto
                {
                    Id = trip.Id,
                    Status = trip.TripStatus,
                    VehicleReg = vehicle?.RegistrationNumber ?? "Unknown",
                    JobCount = tripJobs.Count,
                    TotalWeightKg = mobileJobs.Sum(j => j.WeightKg),
                    StartTime = trip.StartTime,
                    Jobs = mobileJobs
                });
            }

            return Ok(ApiResult<List<MobileTripDto>>.Ok(tripDtos));
        }

        [HttpPost("trip/{id}/start")]
        public async Task<IActionResult> StartTrip(Guid id, [FromBody] DriverActionRequest request)
        {
            var tripRepo = _unitOfWork.Repository<Trip>();
            var trip = await tripRepo.GetByIdAsync(id);
            if (trip == null) return NotFound("Trip not found");

            trip.TripStatus = "InProgress";
            trip.StartTime = request.Timestamp; // Update start time to actual

            // Update Jobs to InTransit
            var tripJobRepo = _unitOfWork.Repository<TripJob>();
            var jobRepo = _unitOfWork.Repository<Job>();
            var tripJobs = await tripJobRepo.FindAsync(tj => tj.TripId == trip.Id);
            
            foreach (var tj in tripJobs)
            {
                var job = await jobRepo.GetByIdAsync(tj.JobId);
                if (job != null && job.Status == JobStatus.Planned)
                {
                    job.Status = JobStatus.InTransit;
                    await jobRepo.UpdateAsync(job);
                }
            }

            await tripRepo.UpdateAsync(trip);
            await _unitOfWork.SaveChangesAsync();

            return Ok(ApiResult<string>.Ok("Trip started"));
        }

        [HttpPost("trip/{id}/complete")]
        public async Task<IActionResult> CompleteTrip(Guid id, [FromBody] DriverActionRequest request)
        {
            var tripRepo = _unitOfWork.Repository<Trip>();
            var trip = await tripRepo.GetByIdAsync(id);
            if (trip == null) return NotFound("Trip not found");

            trip.TripStatus = "Completed";
            trip.EndTime = request.Timestamp;

            await tripRepo.UpdateAsync(trip);
            await _unitOfWork.SaveChangesAsync();

            return Ok(ApiResult<string>.Ok("Trip completed"));
        }

        [HttpPost("job/{id}/pod")]
        public async Task<IActionResult> UploadPod(Guid id, [FromForm] IFormFile? image, [FromForm] IFormFile? signature, [FromForm] double latitude, [FromForm] double longitude)
        {
            var jobRepo = _unitOfWork.Repository<Job>();
            var job = await jobRepo.GetByIdAsync(id);
            if (job == null) return NotFound("Job not found");

            // Basic file saving logic (MVP: Save to local disk)
            if (image != null)
            {
                var path = Path.Combine("wwwroot", "uploads", $"pod_{id}_{DateTime.UtcNow.Ticks}.jpg");
                // Ensure directory exists
                Directory.CreateDirectory(Path.GetDirectoryName(path)!);
                using var stream = new FileStream(path, FileMode.Create);
                await image.CopyToAsync(stream);
            }

            // Update status
            job.Status = JobStatus.Delivered;
            job.DeliveryLatitude = latitude;
            job.DeliveryLongitude = longitude;
            // job.PodImagePath = path; // Ideally store path in entity

            await jobRepo.UpdateAsync(job);
            await _unitOfWork.SaveChangesAsync();

            return Ok(ApiResult<string>.Ok("POD uploaded and Job delivered"));
        }

        [HttpPost("location")]
        public async Task<IActionResult> UpdateLocation([FromQuery] Guid driverId, [FromBody] DriverActionRequest request)
        {
            if (driverId == Guid.Empty) return BadRequest("DriverId required");
            
            var tripRepo = _unitOfWork.Repository<Trip>();
            // Find active trip for driver
            var activeTrip = (await tripRepo.FindAsync(t => t.DriverId == driverId && t.TripStatus == "InProgress")).FirstOrDefault();
            
            if (activeTrip != null)
            {
                // Update vehicle location
                var vehicleRepo = _unitOfWork.Repository<Vehicle>();
                if (activeTrip.VehicleId.HasValue)
                {
                    var vehicle = await vehicleRepo.GetByIdAsync(activeTrip.VehicleId.Value);
                    if (vehicle != null)
                {
                    vehicle.Latitude = request.Latitude;
                    vehicle.Longitude = request.Longitude;
                    vehicle.LastLocationUpdate = DateTime.UtcNow;
                    await vehicleRepo.UpdateAsync(vehicle);
                    await _unitOfWork.SaveChangesAsync();
                }
                }
            }
            
            return Ok(ApiResult<string>.Ok("Location updated"));
        }
    }
}
