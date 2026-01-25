using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Cryptography;
using System.Text;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Noltrion.Framework.Application.Interfaces;
using Noltrion.Framework.Application.Models;
using Noltrion.Framework.Domain;
using Noltrion.Framework.Domain.Entities;

namespace Noltrion.Framework.Infrastructure.Services
{
    public class UserService : IUserService
    {
        private readonly IUnitOfWork _unitOfWork;

        public UserService(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public async Task<ApiResult<User>> GetByIdAsync(Guid id)
        {
            var user = await _unitOfWork.Repository<User>().Query()
                .Include(u => u.UserRoles).ThenInclude(ur => ur.Role)
                .FirstOrDefaultAsync(u => u.Id == id);

            if (user == null) return ApiResult<User>.Failure("User not found");
            return ApiResult<User>.Ok(user);
        }

        public async Task<ApiResult<List<User>>> GetAllAsync()
        {
            var users = await _unitOfWork.Repository<User>().Query()
                .Include(u => u.UserRoles).ThenInclude(ur => ur.Role)
                .OrderBy(u => u.Username)
                .ToListAsync();
            return ApiResult<List<User>>.Ok(users);
        }

        public async Task<ApiResult<User>> CreateAsync(User user, string password, string roleCode, Guid? customerId = null)
        {
            // Validations
            if (await _unitOfWork.Repository<User>().Query().AnyAsync(u => u.Username == user.Username))
                return ApiResult<User>.Failure("Username already exists");

            // Hash Password
            using (var sha256 = System.Security.Cryptography.SHA256.Create())
            {
                var bytes = sha256.ComputeHash(System.Text.Encoding.UTF8.GetBytes(password));
                user.PasswordHash = Convert.ToBase64String(bytes);
            }
            user.CreatedOn = DateTime.UtcNow;
            user.IsActive = true;
            // user.CustomerId = customerId; // Assign CustomerId

            await _unitOfWork.Repository<User>().AddAsync(user);
            await _unitOfWork.SaveChangesAsync(); // Get Id

            // Assign Role
            if (!string.IsNullOrEmpty(roleCode))
            {
                var role = await _unitOfWork.Repository<Role>().Query().FirstOrDefaultAsync(r => r.Code == roleCode);
                if (role != null)
                {
                    await _unitOfWork.Repository<UserRole>().AddAsync(new UserRole { UserId = user.Id, RoleId = role.Id });
                    await _unitOfWork.SaveChangesAsync();
                }
            }

            return ApiResult<User>.Ok(user);
        }

        public async Task<ApiResult<User>> UpdateAsync(User user, string roleCode)
        {
            var repo = _unitOfWork.Repository<User>();
            var existing = await repo.Query().Include(u => u.UserRoles).FirstOrDefaultAsync(u => u.Id == user.Id);
            
            if (existing == null) return ApiResult<User>.Failure("User not found");

            existing.FirstName = user.FirstName;
            existing.LastName = user.LastName;
            existing.Email = user.Email;
            existing.IsActive = user.IsActive;

            // Role Update
            if (!string.IsNullOrEmpty(roleCode))
            {
                // Remove existing roles
                if (existing.UserRoles.Any())
                {
                    // Assuming single role per user for simplified logic, or wipe all and add new
                    var userRoleRepo = _unitOfWork.Repository<UserRole>();
                    // Delete mechanism via UoW might vary based on implementation. 
                    // Direct DbSet access or repo delete.
                    // Assuming repo supports remove range or similar, OR context usage.
                    // Here manually removing:
                    // This part depends on IRepository capability. Falling back to context via UoW if needed, 
                    // but usually UoW doesn't expose Context.
                    // Using a workaround: Load roles, clear collection if tracking? 
                    // Better: Get Role ID, if different, update.
                    
                    // Actually, simpler approach for this task:
                    // userRoleRepo.Delete(existing.UserRoles.First()); 
                }
                
                // Let's rely on standard EF Core behavior where modifying collection works if loaded?
                // Or better, just add new role if not exists.
                // For this implementation, I will just add the check.
                
                var role = await _unitOfWork.Repository<Role>().Query().FirstOrDefaultAsync(r => r.Code == roleCode);
                if (role != null) 
                {
                    // Check if already has this role
                    if (!existing.UserRoles.Any(ur => ur.RoleId == role.Id))
                    {
                        // Remove others?
                         // Find current roles
                        var currentRoles = await _unitOfWork.Repository<UserRole>().Query().Where(ur => ur.UserId == user.Id).ToListAsync();
                        foreach(var cr in currentRoles) {
                             _unitOfWork.Repository<UserRole>().Delete(cr);
                        }
                        
                        await _unitOfWork.Repository<UserRole>().AddAsync(new UserRole { UserId = user.Id, RoleId = role.Id });
                    }
                }
            }

            await _unitOfWork.SaveChangesAsync();
            return ApiResult<User>.Ok(existing);
        }

        public async Task<ApiResult<bool>> DeleteAsync(Guid id)
        {
            var repo = _unitOfWork.Repository<User>();
            var user = await repo.GetByIdAsync(id);
            if (user == null) return ApiResult<bool>.Failure("User not found");

            repo.Delete(user);
            await _unitOfWork.SaveChangesAsync();
            return ApiResult<bool>.Ok(true);
        }

        public async Task<ApiResult<bool>> ResetPasswordAsync(Guid id, string newPassword)
        {
            var repo = _unitOfWork.Repository<User>();
            var user = await repo.GetByIdAsync(id);
            if (user == null) return ApiResult<bool>.Failure("User not found");

            user.PasswordHash = HashPassword(newPassword);
            await _unitOfWork.SaveChangesAsync();
            return ApiResult<bool>.Ok(true);
        }

        private static string HashPassword(string password)
        {
            using var sha256 = SHA256.Create();
            var bytes = sha256.ComputeHash(Encoding.UTF8.GetBytes(password));
            return Convert.ToBase64String(bytes);
        }
    }
}
