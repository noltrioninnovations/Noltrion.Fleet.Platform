using System;
using Noltrion.Framework.Application.Interfaces;

namespace Noltrion.Framework.Infrastructure.Services
{
    public class CurrentUserService : ICurrentUserService
    {
        private readonly Microsoft.AspNetCore.Http.IHttpContextAccessor _httpContextAccessor;

        public CurrentUserService(Microsoft.AspNetCore.Http.IHttpContextAccessor httpContextAccessor)
        {
            _httpContextAccessor = httpContextAccessor;
        }

        public Guid? UserId
        {
            get
            {
                // Prioritize 'uid' claim which is explicitly the GUID
                var id = _httpContextAccessor.HttpContext?.User?.FindFirst("uid")?.Value;
                
                if (string.IsNullOrEmpty(id))
                {
                     // Fallback to NameIdentifier if not found (though NameIdentifier might be username)
                     id = _httpContextAccessor.HttpContext?.User?.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
                }

                return Guid.TryParse(id, out var guid) ? guid : null;
            }
        }

        public string? UserName => _httpContextAccessor.HttpContext?.User?.Identity?.Name;

        public bool IsAuthenticated => _httpContextAccessor.HttpContext?.User?.Identity?.IsAuthenticated ?? false;
    }
}
