using Microsoft.AspNetCore.Mvc;
using Noltrion.FleetX.Application.DTOs.Web;
using Noltrion.FleetX.Application.Interfaces;
using Noltrion.Framework.API.Controllers;
using System;
using System.Threading.Tasks;

namespace Noltrion.FleetX.API.Controllers.Web
{
    [Route("api/v1/web/drivers")]
    public class DriverController : BaseApiController
    {
        private readonly IDriverService _service;

        public DriverController(IDriverService service)
        {
            _service = service;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            return HandleResult(await _service.GetAllAsync());
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(Guid id)
        {
            return HandleResult(await _service.GetByIdAsync(id));
        }

        [HttpPost]
        public async Task<IActionResult> Create(CreateDriverDto dto)
        {
            return HandleResult(await _service.CreateAsync(dto));
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(Guid id, CreateDriverDto dto)
        {
            return HandleResult(await _service.UpdateAsync(id, dto));
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(Guid id)
        {
            return HandleResult(await _service.DeleteAsync(id));
        }
    }
}
