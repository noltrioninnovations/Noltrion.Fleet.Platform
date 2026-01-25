using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Noltrion.FleetX.Application.Interfaces;
using Noltrion.FleetX.Application.DTOs.Web;
using Noltrion.Framework.Application.Models;
using System;
using System.Threading.Tasks;

namespace Noltrion.FleetX.API.Controllers.Web
{
    [ApiController]
    [Route("api/v1/web/trips")]
    [Authorize]
    public class TripController : ControllerBase
    {
        private readonly ITripService _tripService;

        public TripController(ITripService tripService)
        {
            _tripService = tripService;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var result = await _tripService.GetAllAsync();
            return Ok(ApiResult<object>.Ok(result));
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(Guid id)
        {
            var result = await _tripService.GetByIdAsync(id);
            if (result == null) return NotFound(ApiResult<object>.Failure("Trip not found"));
            return Ok(ApiResult<object>.Ok(result));
        }

        [HttpPost]
        public async Task<IActionResult> Create(CreateTripDto dto)
        {
            var result = await _tripService.CreateAsync(dto);
            if (!result.Success) return BadRequest(result);
            return Ok(result);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(Guid id, CreateTripDto dto)
        {
            var result = await _tripService.UpdateAsync(id, dto);
            if (!result.Success) return BadRequest(result);
            return Ok(result);
        }

        [HttpPatch("{id}/status")]
        public async Task<IActionResult> UpdateStatus(Guid id, [FromBody] UpdateStatusDto dto)
        {
            var result = await _tripService.UpdateTripStatusAsync(id, dto.Status);
            if (!result.Success) return BadRequest(result);
            return Ok(result);
        }

        [HttpPatch("jobs/{tripJobId}/status")]
        public async Task<IActionResult> UpdateJobStatus(Guid tripJobId, [FromBody] UpdateStatusDto dto)
        {
            var result = await _tripService.UpdateTripJobStatusAsync(tripJobId, dto.Status);
            if (!result.Success) return BadRequest(result);
            return Ok(result);
        }

        [HttpPost("{id}/pod")]
        public async Task<IActionResult> UploadPod(Guid id, IFormFile file)
        {
            if (file == null || file.Length == 0)
                return BadRequest(ApiResult<string>.Failure("No file uploaded"));

            try 
            {
                // Ensure uploads directory exists
                var uploadsFolder = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads", "pods");
                if (!Directory.Exists(uploadsFolder)) 
                    Directory.CreateDirectory(uploadsFolder);

                // Generate secure filename
                var uniqueFileName = $"{id}_{DateTime.UtcNow.Ticks}{Path.GetExtension(file.FileName)}";
                var filePath = Path.Combine(uploadsFolder, uniqueFileName);

                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await file.CopyToAsync(stream);
                }

                var fileUrl = $"/uploads/pods/{uniqueFileName}";
                var result = await _tripService.UpdatePodUrlAsync(id, fileUrl);
                
                if (!result.Success) return BadRequest(result);
                return Ok(ApiResult<string>.Ok(fileUrl)); // Return the URL
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResult<string>.Failure($"Internal server error: {ex.Message}"));
            }
        }
    }

    public class UpdateStatusDto
    {
        public string Status { get; set; }
    }
}
