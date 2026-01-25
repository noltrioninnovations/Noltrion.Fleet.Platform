using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Noltrion.FleetX.Application.DTOs;
using Noltrion.FleetX.Application.Interfaces;
using Noltrion.FleetX.Domain.Entities;
using Noltrion.Framework.Application.Models;
using Noltrion.Framework.Domain;

namespace Noltrion.FleetX.Infrastructure.Services.Web
{
    public class OrganizationService : IOrganizationService
    {
        private readonly IUnitOfWork _unitOfWork;

        public OrganizationService(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public async Task<ApiResult<IEnumerable<OrganizationListDto>>> GetAllAsync()
        {
            var repo = _unitOfWork.Repository<Organization>();
            var list = await repo.Query()
                .OrderBy(x => x.Name)
                .Select(x => new OrganizationListDto
                {
                    Id = x.Id,
                    Code = x.Code,
                    Name = x.Name,
                    Address = x.Address,
                    IsActive = x.IsActive
                })
                .ToListAsync();

            return ApiResult<IEnumerable<OrganizationListDto>>.Ok(list);
        }

        public async Task<ApiResult<OrganizationDetailDto>> GetByIdAsync(Guid id)
        {
             var repo = _unitOfWork.Repository<Organization>();
             var org = await repo.GetByIdAsync(id);
             if (org == null) return ApiResult<OrganizationDetailDto>.Failure("Organization not found");

             return ApiResult<OrganizationDetailDto>.Ok(new OrganizationDetailDto 
             {
                 Id = org.Id,
                 Code = org.Code,
                 Name = org.Name,
                 Address = org.Address,
                 IsActive = org.IsActive,
                 CreatedBy = org.CreatedBy,
                 CreatedOn = org.CreatedOn,
                 ModifiedBy = org.ModifiedBy,
                 ModifiedOn = org.ModifiedOn
             });
        }

        public async Task<ApiResult<Guid>> CreateAsync(OrganizationCreateDto dto)
        {
            var repo = _unitOfWork.Repository<Organization>();

            if (await repo.Query().AnyAsync(x => x.Code == dto.Code))
            {
                return ApiResult<Guid>.Failure($"Organization Code '{dto.Code}' already exists.");
            }

            var org = new Organization
            {
                Code = dto.Code,
                Name = dto.Name,
                Address = dto.Address,
                IsActive = dto.IsActive
            };

            await repo.AddAsync(org);
            await _unitOfWork.SaveChangesAsync();

            return ApiResult<Guid>.Ok(org.Id);
        }

        public async Task<ApiResult<string>> UpdateAsync(Guid id, OrganizationUpdateDto dto)
        {
            var repo = _unitOfWork.Repository<Organization>();
            var org = await repo.GetByIdAsync(id);
            if (org == null) return ApiResult<string>.Failure("Organization not found");

            if (await repo.Query().AnyAsync(x => x.Code == dto.Code && x.Id != id))
            {
                 return ApiResult<string>.Failure($"Organization Code '{dto.Code}' already exists.");
            }

            org.Code = dto.Code;
            org.Name = dto.Name;
            org.Address = dto.Address;
            org.IsActive = dto.IsActive;

            await repo.UpdateAsync(org);
            await _unitOfWork.SaveChangesAsync();

            return ApiResult<string>.Ok("Organization updated successfully");
        }

        public async Task<ApiResult<string>> DeleteAsync(Guid id)
        {
            var repo = _unitOfWork.Repository<Organization>();
            var org = await repo.GetByIdAsync(id);
            if (org == null) return ApiResult<string>.Failure("Organization not found");

            await repo.DeleteAsync(id);
            await _unitOfWork.SaveChangesAsync();

            return ApiResult<string>.Ok("Organization deleted successfully");
        }
    }
}
