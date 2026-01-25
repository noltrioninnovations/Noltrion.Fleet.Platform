using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Noltrion.FleetX.Application.DTOs.Common;
using Noltrion.FleetX.Application.DTOs.Web;
using Noltrion.FleetX.Application.Interfaces;
using Noltrion.Framework.API.Controllers;
using Noltrion.Framework.Application.Models;

namespace Noltrion.FleetX.API.Controllers.Web
{
    [Route("api/v1/web/vehicles")]
    public class VehicleWebController : BaseApiController
    {
        private readonly IVehicleService _service;

        public VehicleWebController(IVehicleService service)
        {
            _service = service;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            return HandleResult(await _service.GetAllWebAsync());
        }

        [HttpPost]
        public async Task<IActionResult> Create(CreateVehicleDto dto)
        {
            return HandleResult(await _service.CreateAsync(dto));
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(System.Guid id, CreateVehicleDto dto)
        {
            return HandleResult(await _service.UpdateAsync(id, dto));
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(System.Guid id)
        {
            return HandleResult(await _service.DeleteAsync(id));
        }
    }
}
