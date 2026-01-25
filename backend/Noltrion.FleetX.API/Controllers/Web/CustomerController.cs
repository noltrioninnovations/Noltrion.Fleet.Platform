using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Noltrion.FleetX.Application.Interfaces;
using Noltrion.FleetX.Domain.Entities;
using Noltrion.FleetX.Infrastructure.Services.Web;
using Noltrion.Framework.Application.Models;
using System;
using System.Threading.Tasks;

namespace Noltrion.FleetX.API.Controllers.Web
{
    [ApiController] // BaseApiController ?
    [Route("api/v1/web/customers")]
    [Authorize]
    public class CustomerController : ControllerBase
    {
        private readonly ICustomerService _customerService;

        public CustomerController(ICustomerService customerService)
        {
            _customerService = customerService;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var list = await _customerService.GetAllAsync();
            return Ok(ApiResult<object>.Ok(list));
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(Guid id)
        {
            var item = await _customerService.GetByIdAsync(id);
            if (item == null) return NotFound(ApiResult<object>.Failure("Not Found"));
            return Ok(ApiResult<object>.Ok(item));
        }

        [HttpPost]
        public async Task<IActionResult> Create(Customer customer)
        {
            var result = await _customerService.CreateAsync(customer);
            if (result.Success) return Ok(result);
            return BadRequest(result);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(Guid id, Customer customer)
         {
            if (id != customer.Id) return BadRequest(ApiResult<object>.Failure("ID Mismatch"));
            var result = await _customerService.UpdateAsync(customer);
            if (result.Success) return Ok(result);
            return BadRequest(result);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(Guid id)
        {
            var result = await _customerService.DeleteAsync(id);
             if (result.Success) return Ok(result);
            return BadRequest(result);
        }
    }
}
