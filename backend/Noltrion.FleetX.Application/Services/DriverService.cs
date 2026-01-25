using Noltrion.FleetX.Application.DTOs.Web;
using Noltrion.FleetX.Application.Interfaces;
using Noltrion.FleetX.Domain.Entities;
using Noltrion.Framework.Application.Models;
using Noltrion.Framework.Domain;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq;
using System.Threading.Tasks;
using System.Text.RegularExpressions;

namespace Noltrion.FleetX.Application.Services
{
    public class DriverService : IDriverService
    {
        private readonly IRepository<Driver> _repository;
        private readonly IUnitOfWork _unitOfWork;

        public DriverService(IRepository<Driver> repository, IUnitOfWork unitOfWork)
        {
            _repository = repository;
            _unitOfWork = unitOfWork;
        }

        public async Task<ApiResult<IEnumerable<DriverWebDto>>> GetAllAsync()
        {
            var list = await _repository.GetAllAsync();
            var dtos = list.Select(d => new DriverWebDto
            {
                Id = d.Id,
                Name = d.FullName,
                LicenseNumber = d.LicenseNumber,
                Phone = d.PhoneNumber,
                Status = d.IsActive ? "Active" : "Inactive"
            });
            return ApiResult<IEnumerable<DriverWebDto>>.Ok(dtos);
        }

        public async Task<ApiResult<DriverWebDto>> GetByIdAsync(Guid id)
        {
            var driver = await _repository.GetByIdAsync(id);
            if (driver == null) return ApiResult<DriverWebDto>.Failure("Not Found");
            return ApiResult<DriverWebDto>.Ok(new DriverWebDto
            {
                Id = driver.Id,
                Name = driver.FullName,
                LicenseNumber = driver.LicenseNumber,
                Phone = driver.PhoneNumber,
                Status = driver.IsActive ? "Active" : "Inactive"
            });
        }

        public async Task<ApiResult<DriverWebDto>> CreateAsync(CreateDriverDto dto)
        {
            var errors = Validate(dto);
            if (errors.Any()) return ApiResult<DriverWebDto>.Failure(errors);

            var existing = await _repository.FindAsync(d => d.LicenseNumber == dto.LicenseNumber);
            if (existing.Any()) return ApiResult<DriverWebDto>.Failure("Driver with this license number already exists.");

            var driver = new Driver
            {
                FullName = dto.Name,
                LicenseNumber = dto.LicenseNumber,
                PhoneNumber = dto.Phone,
                IsActive = true
            };
            await _repository.AddAsync(driver);
            await _unitOfWork.SaveChangesAsync();
            return await GetByIdAsync(driver.Id);
        }

        public async Task<ApiResult<string>> UpdateAsync(Guid id, CreateDriverDto dto)
        {
            var errors = Validate(dto);
            if (errors.Any()) return ApiResult<string>.Failure(errors);

            var driver = await _repository.GetByIdAsync(id);
            if (driver == null) return ApiResult<string>.Failure("Not Found");

            var existing = await _repository.FindAsync(d => d.LicenseNumber == dto.LicenseNumber && d.Id != id);
            if (existing.Any()) return ApiResult<string>.Failure("Driver with this license number already exists.");

            driver.FullName = dto.Name;
            driver.LicenseNumber = dto.LicenseNumber;
            driver.PhoneNumber = dto.Phone;
            
            await _repository.UpdateAsync(driver);
            await _unitOfWork.SaveChangesAsync();
            return ApiResult<string>.Ok("Updated");
        }

        public async Task<ApiResult<string>> DeleteAsync(Guid id)
        {
            var driver = await _repository.GetByIdAsync(id);
            if (driver == null) return ApiResult<string>.Failure("Not Found");

            // Hard delete or Soft? 
            // _repository.Delete(driver);
            driver.IsActive = false; // Soft Delete Logic via IsActive field
            await _repository.UpdateAsync(driver);

            await _unitOfWork.SaveChangesAsync();
            return ApiResult<string>.Ok("Deactivated");
        }

        private List<string> Validate(CreateDriverDto dto)
        {
            var errors = new List<string>();
            if (string.IsNullOrWhiteSpace(dto.Name)) errors.Add("Name is required");
            if (string.IsNullOrWhiteSpace(dto.LicenseNumber)) errors.Add("License Number is required");
            
            // SG NRIC/FIN Validation
            if (!string.IsNullOrWhiteSpace(dto.LicenseNumber) && !Regex.IsMatch(dto.LicenseNumber, @"^[STFGM]\d{7}[A-Z]$"))
                errors.Add("Invalid License Number (Format: S1234567A)");

            // SG Phone Validation
            if (!string.IsNullOrWhiteSpace(dto.Phone) && !Regex.IsMatch(dto.Phone, @"^(\+65|65)?[689]\d{7}$"))
                errors.Add("Invalid Singapore Phone Number");
            
            return errors;
        }
    }
}
