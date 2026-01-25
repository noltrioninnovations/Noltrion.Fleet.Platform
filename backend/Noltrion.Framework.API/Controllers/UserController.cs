using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Noltrion.Framework.Application.Interfaces;
using Noltrion.Framework.Application.Models;
using Noltrion.Framework.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Noltrion.Framework.API.Controllers
{
    [Route("api/users")]
    [ApiController]
    [Authorize(Roles = "TenantAdmin")]
    public class UserController : BaseApiController
    {
        private readonly IUserService _userService;

        public UserController(IUserService userService)
        {
            _userService = userService;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var result = await _userService.GetAllAsync();
            return Ok(result);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(Guid id)
        {
            var result = await _userService.GetByIdAsync(id);
            return Ok(result);
        }

        [HttpPost]
        public async Task<IActionResult> Create(CreateUserRequest request)
        {
            var user = new User
            {
                Username = request.Username,
                Email = request.Email,
                FirstName = request.FirstName,
                LastName = request.LastName
            };

            var result = await _userService.CreateAsync(user, request.Password, request.RoleCode);
            return Ok(result);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(Guid id, UpdateUserRequest request)
        {
            if (id != request.Id) return BadRequest();

            var user = new User
            {
                Id = id,
                Email = request.Email,
                FirstName = request.FirstName,
                LastName = request.LastName,
                IsActive = request.IsActive
            };

            var result = await _userService.UpdateAsync(user, request.RoleCode);
            return Ok(result);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(Guid id)
        {
            var result = await _userService.DeleteAsync(id);
            return Ok(result);
        }

        [HttpPost("{id}/reset-password")]
        public async Task<IActionResult> ResetPassword(Guid id, [FromBody] ResetPasswordRequest request)
        {
            var result = await _userService.ResetPasswordAsync(id, request.NewPassword);
            return Ok(result);
        }
    }

    public class CreateUserRequest
    {
        public string Username { get; set; }
        public string Password { get; set; }
        public string Email { get; set; }
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string RoleCode { get; set; }
    }

    public class UpdateUserRequest
    {
        public Guid Id { get; set; }
        public string Email { get; set; }
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string RoleCode { get; set; }
        public bool IsActive { get; set; }
    }

    public class ResetPasswordRequest
    {
        public string NewPassword { get; set; }
    }
}
