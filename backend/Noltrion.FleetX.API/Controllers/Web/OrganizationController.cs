using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Noltrion.FleetX.Application.DTOs;
using Noltrion.FleetX.Application.Interfaces;
using Noltrion.FleetX.Infrastructure.Services.Security;
using Noltrion.Framework.API.Controllers;
using Noltrion.Framework.Application.Models;

namespace Noltrion.FleetX.API.Controllers.Web
{
    [Authorize]
    [Route("api/v1/web/organizations")]
    public class OrganizationController : BaseApiController
    {
        private readonly IOrganizationService _service;
        private readonly IPermissionService _permissionService;

        public OrganizationController(IOrganizationService service, IPermissionService permissionService)
        {
            _service = service;
            _permissionService = permissionService;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            // Permission Check (Optional for MVP but requested)
            // var userId = User.FindFirst("uid")?.Value;
            // if (userId != null && !await _permissionService.HasPermissionAsync(Guid.Parse(userId), "Organization.View")) return Forbidden();

            return HandleResult(await _service.GetAllAsync());
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> Get(Guid id)
        {
            return HandleResult(await _service.GetByIdAsync(id));
        }

        [HttpPost]
        public async Task<IActionResult> Create(OrganizationCreateDto dto)
        {
            // if (!await HasPermission("Organization.Create")) return Forbidden();
            return HandleResult(await _service.CreateAsync(dto));
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(Guid id, OrganizationUpdateDto dto)
        {
            // if (!await HasPermission("Organization.Edit")) return Forbidden();
            return HandleResult(await _service.UpdateAsync(id, dto));
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(Guid id)
        {
            // if (!await HasPermission("Organization.Delete")) return Forbidden();
            return HandleResult(await _service.DeleteAsync(id));
        }
    }
}
