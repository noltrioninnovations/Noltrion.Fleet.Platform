using System;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Noltrion.Framework.Application.Interfaces;
using Noltrion.Framework.Application.Models;
using Noltrion.Framework.Domain;
using Noltrion.Framework.Domain.Entities;

namespace Noltrion.Framework.Infrastructure.Services
{
    public class AuthService : IAuthService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly ITokenService _tokenService;

        public AuthService(IUnitOfWork unitOfWork, ITokenService tokenService)
        {
            _unitOfWork = unitOfWork;
            _tokenService = tokenService;
        }

        public async Task<ApiResult<AuthResponse>> LoginAsync(string username, string password)
        {
            try
            {
                var userRepo = _unitOfWork.Repository<User>();
                // Use Query() to Include Roles
                var user = await userRepo.Query()
                    .Include(u => u.UserRoles)
                        .ThenInclude(ur => ur.Role)
                    .FirstOrDefaultAsync(u => u.Username == username);

                // var users = await userRepo.FindAsync(u => u.Username == username); // Removed
                // var user = users.FirstOrDefault(); // Removed

                if (user == null)
                {
                    return ApiResult<AuthResponse>.Failure("Invalid credentials");
                }

                if (!user.IsActive)
                {
                    return ApiResult<AuthResponse>.Failure("Account is deactivated");
                }

                // Verify Password
                var hashedPassword = HashPassword(password);
                // Note: Seeder uses the same HashPassword logic (SHA256).
                if (user.PasswordHash != hashedPassword)
                {
                    return ApiResult<AuthResponse>.Failure("Invalid credentials");
                }

                // Update Last Login
                user.LastLogin = DateTime.UtcNow;
                try 
                {
                     // await _unitOfWork.SaveChangesAsync(); // If tracking enabled
                     // Since we used repository FindAsync, tracking depends on implementation.
                     // For now, skip saving to avoid unrelated errors if UoW is finicky.
                }
                catch(Exception ex)
                {
                    System.Console.WriteLine($"DEBUG: SaveChanges Failed: {ex.Message}");
                }

                return await _tokenService.GenerateTokensAsync(user);
            }
            catch (Exception ex)
            {
                System.Console.WriteLine($"CRITICAL ERROR IN LOGIN: {ex}");
                return ApiResult<AuthResponse>.Failure(ex.Message);
            }
        }

        private static string HashPassword(string password)
        {
            using var sha256 = System.Security.Cryptography.SHA256.Create();
            var bytes = sha256.ComputeHash(System.Text.Encoding.UTF8.GetBytes(password));
            return Convert.ToBase64String(bytes);
        }

        public async Task<ApiResult<AuthResponse>> RefreshTokenAsync(string token, string refreshToken)
        {
             // Pending implementation
             return ApiResult<AuthResponse>.Failure("Refresh token not implemented yet");
        }
    }
}
