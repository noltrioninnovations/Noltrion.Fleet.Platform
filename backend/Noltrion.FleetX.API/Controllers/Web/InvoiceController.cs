using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Noltrion.FleetX.Application.Interfaces;
using Noltrion.FleetX.Application.DTOs.Web;
using Noltrion.Framework.API.Controllers; // Inherit BaseApiController

namespace Noltrion.FleetX.API.Controllers.Web
{
    [ApiController]
    [Route("api/v1/web/invoices")]
    public class InvoiceController : BaseApiController
    {
        private readonly IInvoiceService _invoiceService;

        public InvoiceController(IInvoiceService invoiceService)
        {
            _invoiceService = invoiceService;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            return Ok(await _invoiceService.GetAllAsync());
        }

        [HttpGet("trip/{tripId}")]
        public async Task<IActionResult> GetByTripId(string tripId)
        {
            return HandleResult(await _invoiceService.GetByTripIdAsync(tripId));
        }

        [HttpPost("generate/{tripId}")]
        public async Task<IActionResult> GenerateForTrip(string tripId)
        {
            return HandleResult(await _invoiceService.GenerateForTripAsync(tripId));
        }

        [HttpPatch("{id}/status")]
        public async Task<IActionResult> UpdateStatus(string id, [FromBody] StatusUpdateDto dto)
        {
            return HandleResult(await _invoiceService.UpdateStatusAsync(id, dto.Status));
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(string id, [FromBody] InvoiceDto dto)
        {
            if (id != dto.Id) return BadRequest("ID Mismatch");
            return HandleResult(await _invoiceService.UpdateAsync(dto));
        }
    }

    public class StatusUpdateDto
    {
        public string Status { get; set; }
    }
}
