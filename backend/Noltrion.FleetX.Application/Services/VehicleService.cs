using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.Text.RegularExpressions;
using Noltrion.FleetX.Application.DTOs.Common;
using Noltrion.FleetX.Application.DTOs.Mobile;
using Noltrion.FleetX.Application.DTOs.Web;
using Noltrion.FleetX.Application.Interfaces;
using Noltrion.FleetX.Domain.Entities;
using Noltrion.Framework.Application.Models;
using Noltrion.Framework.Domain;

namespace Noltrion.FleetX.Application.Services
{
    public class VehicleService : IVehicleService
    {
        private readonly IRepository<Vehicle> _repository;
        private readonly IUnitOfWork _unitOfWork;

        public VehicleService(IRepository<Vehicle> repository, IUnitOfWork unitOfWork)
        {
            _repository = repository;
            _unitOfWork = unitOfWork;
        }


        public async Task<ApiResult<VehicleWebDto>> CreateAsync(CreateVehicleDto dto)
        {
            var errors = Validate(dto);
            if (errors.Any()) return ApiResult<VehicleWebDto>.Failure(errors);

            var existing = await _repository.FindAsync(v => v.RegistrationNumber == dto.RegistrationNumber);
            if (existing.Any()) return ApiResult<VehicleWebDto>.Failure("Vehicle with this registration number already exists.");

            var vehicle = new Vehicle
            {
                RegistrationNumber = dto.RegistrationNumber,
                Model = dto.Model,
                Type = dto.Type
            };

            await _repository.AddAsync(vehicle);
            await _unitOfWork.SaveChangesAsync();

            return ApiResult<VehicleWebDto>.Ok(MapToWebDto(vehicle));
        }

        public async Task<ApiResult<IEnumerable<VehicleMobileDto>>> GetAllMobileAsync()
        {
            var vehicles = await _repository.GetAllAsync();
            var dtos = vehicles.Select(MapToMobileDto);
            return ApiResult<IEnumerable<VehicleMobileDto>>.Ok(dtos);
        }

        public async Task<ApiResult<IEnumerable<VehicleWebDto>>> GetAllWebAsync()
        {
            var vehicles = await _repository.GetAllAsync();
            var dtos = vehicles.Select(MapToWebDto);
            return ApiResult<IEnumerable<VehicleWebDto>>.Ok(dtos);
        }

        private static VehicleWebDto MapToWebDto(Vehicle v) => new()
        {
            Id = v.Id,
            RegistrationNumber = v.RegistrationNumber,
            Model = v.Model,
            Type = v.Type,
            Status = v.Status,
            CreatedOn = v.CreatedOn,
            CreatedBy = v.CreatedBy
        };

        private static VehicleMobileDto MapToMobileDto(Vehicle v) => new()
        {
            Id = v.Id,
            RegistrationNumber = v.RegistrationNumber,
            Status = v.Status
        };

        public async Task<ApiResult<VehicleWebDto>> GetByIdAsync(Guid id)
        {
            var vehicle = await _repository.GetByIdAsync(id);
            if (vehicle == null) return ApiResult<VehicleWebDto>.Failure("Not Found");
            return ApiResult<VehicleWebDto>.Ok(MapToWebDto(vehicle));
        }

        public async Task<ApiResult<string>> UpdateAsync(Guid id, CreateVehicleDto dto)
        {
            var errors = Validate(dto);
            if (errors.Any()) return ApiResult<string>.Failure(errors);

            var vehicle = await _repository.GetByIdAsync(id);
            if (vehicle == null) return ApiResult<string>.Failure("Not Found");

            var existing = await _repository.FindAsync(v => v.RegistrationNumber == dto.RegistrationNumber && v.Id != id);
            if (existing.Any()) return ApiResult<string>.Failure("Vehicle with this registration number already exists.");

            vehicle.RegistrationNumber = dto.RegistrationNumber;
            vehicle.Model = dto.Model;
            vehicle.Type = dto.Type;
            // vehicle.CapacityKg = dto.CapacityKg; // TODO: Add to DTO

            await _repository.UpdateAsync(vehicle);
            await _unitOfWork.SaveChangesAsync();
            return ApiResult<string>.Ok("Updated");
        }

        public async Task<ApiResult<string>> DeleteAsync(Guid id)
        {
            var vehicle = await _repository.GetByIdAsync(id);
            if (vehicle == null) return ApiResult<string>.Failure("Not Found");

            await _repository.DeleteAsync(id);
            await _unitOfWork.SaveChangesAsync();
            return ApiResult<string>.Ok("Deleted");
        }

        private List<string> Validate(CreateVehicleDto dto)
        {
            var errors = new List<string>();
            if (string.IsNullOrWhiteSpace(dto.RegistrationNumber)) errors.Add("Registration Number is required");
            if (string.IsNullOrWhiteSpace(dto.Model)) errors.Add("Model is required");

            // SG Vehicle Validation: e.g. SAA1234A, GBA1234Z, NAA1234C
            if (!string.IsNullOrWhiteSpace(dto.RegistrationNumber) && !Regex.IsMatch(dto.RegistrationNumber, @"^[A-Z]{1,3}\d{1,4}[A-Z]$"))
                errors.Add("Invalid Vehicle Registration Number (e.g. SAA1234A, GBA1234Z)");

            return errors;
        }
    }
}
