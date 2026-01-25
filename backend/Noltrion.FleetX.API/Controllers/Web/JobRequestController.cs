using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Noltrion.FleetX.Application.DTOs.Web;
using Noltrion.FleetX.Application.Interfaces;
using Noltrion.Framework.Application.Interfaces;

namespace Noltrion.FleetX.API.Controllers.Web
{
    [Route("api/job-requests")]
    [ApiController]
    [Authorize]
    public class JobRequestController : ControllerBase
    {
        private readonly IJobRequestService _service;
        private readonly ICurrentUserService _currentUser;

        public JobRequestController(IJobRequestService service, ICurrentUserService currentUser)
        {
            _service = service;
            _currentUser = currentUser;
        }

        [HttpGet("my-requests")]
        public async Task<IActionResult> GetMyRequests()
        {
            if (!_currentUser.UserId.HasValue) return Unauthorized();

            var data = await _service.GetByUserAsync(_currentUser.UserId.Value);
            return Ok(data);
        }

        [HttpPost("create")]
        public async Task<IActionResult> Create([FromBody] CreateJobRequestDto dto)
        {
            if (!_currentUser.UserId.HasValue) return Unauthorized();

            var result = await _service.CreateForUserAsync(_currentUser.UserId.Value, dto);
            if (result.Success)
                return Ok(result.Data);
            
            return BadRequest(result.Errors);
        }

        [HttpGet("pending")]
        // [Authorize(Roles = "Admin,Office")] // Uncomment when roles are set up
        public async Task<IActionResult> GetPending()
        {
            var data = await _service.GetPendingAsync();
            return Ok(data);
        }

        [HttpPost("{id}/convert")]
        // [Authorize(Roles = "Admin,Office")]
        public async Task<IActionResult> ConvertToManifest(Guid id)
        {
            if (!_currentUser.UserId.HasValue) return Unauthorized();

            var result = await _service.ConvertToManifestAsync(id, _currentUser.UserId.Value);
             if (result.Success)
                return Ok(new { TripId = result.Data });
            
            return BadRequest(result.Errors);
        }
    }
}
