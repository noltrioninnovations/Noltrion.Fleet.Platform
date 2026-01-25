using Microsoft.AspNetCore.Mvc;
using Noltrion.FleetX.Infrastructure.Services.Security;
using Noltrion.Framework.Application.Models;
using System;
using System.Threading.Tasks;

namespace Noltrion.FleetX.API.Controllers.Web
{
    [ApiController]
    [Route("api/v1/web/menus")]
    public class MenuController : ControllerBase
    {
        private readonly IMenuService _menuService;

        public MenuController(IMenuService menuService)
        {
            _menuService = menuService;
        }

        [HttpGet("my-menus")]
        public async Task<IActionResult> GetMyMenus()
        {
            var userIdClaim = User.FindFirst("uid"); // Match TokenService claim
            if (userIdClaim == null)
            {
                return Unauthorized(ApiResult<object>.Failure("User not identified"));
            }

            var userId = Guid.Parse(userIdClaim.Value);
            
            var menus = await _menuService.GetMyMenusAsync(userId);
            return Ok(ApiResult<object>.Ok(menus));
        }
    }
}
