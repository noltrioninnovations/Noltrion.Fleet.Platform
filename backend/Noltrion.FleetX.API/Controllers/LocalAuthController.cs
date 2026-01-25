using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Noltrion.Framework.Application.Interfaces;
using Noltrion.Framework.Application.Models;
using System.Threading.Tasks;

namespace Noltrion.FleetX.API.Controllers
{
    [Route("api/auth-local")]
    [ApiController]
    public class LocalAuthController : ControllerBase
    {
        private readonly IAuthService _authService;

        public LocalAuthController(IAuthService authService)
        {
            _authService = authService;
        }

        [HttpPost("login")]
        [AllowAnonymous]
        public async Task<ActionResult<ApiResult<AuthResponse>>> Login([FromBody] LoginRequest request)
        {
            var result = await _authService.LoginAsync(request.Username, request.Password);
            if (result.Success)
            {
                return Ok(result);
            }
            return BadRequest(result);
        }
    }

    public class LoginRequest
    {
        public string Username { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
    }
}
