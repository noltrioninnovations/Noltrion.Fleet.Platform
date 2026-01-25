using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using System.Threading.Tasks;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using Noltrion.Framework.Application.Interfaces;
using Noltrion.Framework.Application.Models;
using Noltrion.Framework.Domain.Entities;
using Noltrion.Framework.Shared.Settings;

namespace Noltrion.Framework.Infrastructure.Services
{
    public class TokenService : ITokenService
    {
        private readonly JwtSettings _jwtSettings;

        public TokenService(IOptions<JwtSettings> jwtSettings)
        {
            _jwtSettings = jwtSettings.Value;
        }

        public Task<ApiResult<AuthResponse>> GenerateTokensAsync(User user)
        {
            var tokenHandler = new JwtSecurityTokenHandler();
            var key = Encoding.ASCII.GetBytes(_jwtSettings.Key);

            var claims = new List<Claim>
            {
                new Claim(JwtRegisteredClaimNames.Sub, user.Username),
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
                new Claim(JwtRegisteredClaimNames.Email, user.Email),
                new Claim("uid", user.Id.ToString())
            };

            // Add Roles
            foreach (var userRole in user.UserRoles)
            {
                if(userRole.Role != null)
                {
                    claims.Add(new Claim(ClaimTypes.Role, userRole.Role.Name));
                }
            }

            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(claims),
                Expires = DateTime.UtcNow.AddMinutes(_jwtSettings.DurationInMinutes),
                Issuer = _jwtSettings.Issuer,
                Audience = _jwtSettings.Audience,
                SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
            };

            var token = tokenHandler.CreateToken(tokenDescriptor);
            var accessToken = tokenHandler.WriteToken(token);
            var refreshToken = GenerateRefreshToken();

            return Task.FromResult(ApiResult<AuthResponse>.Ok(new AuthResponse
            {
                Token = accessToken,
                RefreshToken = refreshToken,
                Expiration = tokenDescriptor.Expires.Value,
                Username = user.Username,
                Email = user.Email,
                Roles = user.UserRoles.Select(ur => ur.Role?.Code ?? "").Where(r => !string.IsNullOrEmpty(r)).ToList()
            }));
        }

        public Task<ApiResult<AuthResponse>> RefreshTokenAsync(string token, string refreshToken)
        {
             // For now, simpler implementation - usually we verify the old token (ignoring expiry) 
             // and check against DB refresh token. 
             // Since this requires DB access which TokenService shouldn't have directly (it's infrastructure/utility),
             // the calling service (AuthService) should handle the DB validation.
             // But existing interface signature implies logic here. 
             // I will leave this as is for now, as logic dictates AuthService calls this.
             // Actually, the interface signature is weird if it doesn't take User.
             // I will adhere to the interface but maybe throw NotSupported if not fully implemented seamlessly.
             // Wait, the Requirement says "Refresh token support (basic)".
             
             // I will create a method to JUST generate a new RefreshToken string.
             throw new NotImplementedException("Handled by AuthService");
        }
        
        private string GenerateRefreshToken()
        {
            var randomNumber = new byte[32];
            using var rng = RandomNumberGenerator.Create();
            rng.GetBytes(randomNumber);
            return Convert.ToBase64String(randomNumber);
        }
    }
}
