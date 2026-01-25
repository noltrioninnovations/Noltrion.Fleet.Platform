using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Noltrion.FleetX.Application.DTOs.Web;
using Noltrion.FleetX.Application.Interfaces;
using Noltrion.Framework.Application.Models;
using System;
using System.Threading.Tasks;

namespace Noltrion.FleetX.API.Controllers.Web
{
    [ApiController]
    [Route("api/v1/web/jobs")]
    [Authorize]
    public class JobController : ControllerBase
    {
        private readonly IJobService _jobService;

        public JobController(IJobService jobService)
        {
            _jobService = jobService;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var result = await _jobService.GetAllAsync();
            return Ok(ApiResult<object>.Ok(result));
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(Guid id)
        {
            var result = await _jobService.GetByIdAsync(id);
            if (result == null) return NotFound(ApiResult<object>.Failure("Job not found"));
            return Ok(ApiResult<object>.Ok(result));
        }

        [HttpPost]
        public async Task<IActionResult> Create(CreateJobDto dto)
        {
            var result = await _jobService.CreateAsync(dto);
            if (!result.Success) return BadRequest(result);
            return Ok(result);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(Guid id, CreateJobDto dto)
        {
            var result = await _jobService.UpdateAsync(id, dto);
            if (!result.Success) return BadRequest(result);
            return Ok(result);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Cancel(Guid id)
        {
            var result = await _jobService.CancelAsync(id);
            if (!result.Success) return BadRequest(result);
            return Ok(result);
        }

        [HttpGet("delivered")]
        public async Task<IActionResult> GetDelivered()
        {
            var result = await _jobService.GetDeliveredJobsAsync();
            return Ok(ApiResult<object>.Ok(result));
        }
    }
}
