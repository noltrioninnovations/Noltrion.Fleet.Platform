using Microsoft.EntityFrameworkCore;
using Noltrion.Framework.Application.Interfaces;
using Noltrion.Framework.Domain;
using Noltrion.Framework.Domain.Entities;
using System;
using System.Linq;
using System.Threading.Tasks;

namespace Noltrion.FleetX.Infrastructure.Services.Security
{
    public interface IPermissionService
    {
        Task<bool> HasPermissionAsync(Guid userId, string permissionCode);
    }

    public class PermissionService : IPermissionService
    {
        private readonly IUnitOfWork _unitOfWork;

        public PermissionService(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public async Task<bool> HasPermissionAsync(Guid userId, string permissionCode)
        {
            var userRoleRepo = _unitOfWork.Repository<UserRole>();
            var roleParamRepo = _unitOfWork.Repository<RolePermission>();
            var permRepo = _unitOfWork.Repository<Permission>();

            // 1. Get User Roles
            var userRoles = await userRoleRepo.FindAsync(ur => ur.UserId == userId);
            var roleIds = userRoles.Select(ur => ur.RoleId).ToList();

            if (!roleIds.Any()) return false;

            // 2. Get Permissions for Roles
            var rolePerms = await roleParamRepo.FindAsync(rp => roleIds.Contains(rp.RoleId));
            var permIds = rolePerms.Select(rp => rp.PermissionId).Distinct().ToList();

            if (!permIds.Any()) return false;

            // 3. Check if permissionCode exists in these permissions
            // We need to fetch Permission entities to check 'Code'
            // Optimization: If we cached PermissionId -> Code, this would be faster.
            // For MVP, fetch matching permissions.
            var permissions = await permRepo.FindAsync(p => permIds.Contains(p.Id) && p.Code == permissionCode);
            
            return permissions.Any();
        }
    }
}
