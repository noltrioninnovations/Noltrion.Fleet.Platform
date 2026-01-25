using System;

namespace Noltrion.Framework.Application.Models
{
    public class AuthResponse
    {
        public string Token { get; set; } = string.Empty;
        public string RefreshToken { get; set; } = string.Empty;
        public DateTime Expiration { get; set; }
        public string Username { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public System.Collections.Generic.List<string> Roles { get; set; } = new();
    }
}
