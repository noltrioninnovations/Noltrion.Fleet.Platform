using Microsoft.EntityFrameworkCore;
using Noltrion.Framework.Application.Interfaces;
using Noltrion.Framework.Domain;
using Noltrion.Framework.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Noltrion.FleetX.Infrastructure.Services.Security
{
    public interface IMenuService
    {
        Task<List<MenuDto>> GetMyMenusAsync(Guid userId);
    }

    public class MenuDto
    {
        public Guid Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Url { get; set; } = string.Empty;
        public string Icon { get; set; } = string.Empty;
        public int Order { get; set; }
        public List<MenuDto> Children { get; set; } = new List<MenuDto>();
    }

    public class MenuService : IMenuService
    {
        private readonly IUnitOfWork _unitOfWork;

        public MenuService(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public async Task<List<MenuDto>> GetMyMenusAsync(Guid userId)
        {
            var menuRepo = _unitOfWork.Repository<Menu>();
            var roleMenuRepo = _unitOfWork.Repository<RoleMenu>();
            var userRoleRepo = _unitOfWork.Repository<UserRole>();

            // 1. Get User Roles
            var userRoles = await userRoleRepo.FindAsync(ur => ur.UserId == userId);
            if (userRoles == null || !userRoles.Any())
            {
                return new List<MenuDto>();
            }

            var roleIds = userRoles.Select(ur => ur.RoleId).ToList();

            // 2. Get Menu Ids for User Roles
            var menuIds = await roleMenuRepo.Query()
                .Where(rm => roleIds.Contains(rm.RoleId))
                .Select(rm => rm.MenuId)
                .Distinct()
                .ToListAsync();

            if (menuIds == null || !menuIds.Any())
                return new List<MenuDto>();

            // 3. Fetch Menus
            var menus = await menuRepo.Query()
                .Where(m => menuIds.Contains(m.Id) && m.IsActive)
                .OrderBy(m => m.Order)
                .ToListAsync();
            
            // 4. Transform to DTOs
            return BuildTree(menus);
        }

        private List<MenuDto> BuildTree(IEnumerable<Menu> menus)
        {
            var roots = menus.Where(m => m.ParentId == null).OrderBy(m => m.Order).ToList();
            var dtos = new List<MenuDto>();

            foreach (var menu in roots)
            {
                dtos.Add(MapToDto(menu, menus));
            }
            return dtos;
        }

        private MenuDto MapToDto(Menu menu, IEnumerable<Menu> allMenus)
        {
            var dto = new MenuDto
            {
                Id = menu.Id,
                Title = menu.Title,
                Url = menu.Url,
                Icon = menu.Icon,
                Order = menu.Order
            };

            var children = allMenus.Where(m => m.ParentId == menu.Id).OrderBy(m => m.Order);
            foreach (var child in children)
            {
                dto.Children.Add(MapToDto(child, allMenus));
            }
            
            return dto;
        }
    }
}
