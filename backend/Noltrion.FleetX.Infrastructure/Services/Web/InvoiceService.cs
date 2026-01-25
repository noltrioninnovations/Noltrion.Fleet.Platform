using System;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Noltrion.Framework.Application.Models;
using Noltrion.FleetX.Application.DTOs.Web;
using Noltrion.FleetX.Application.Interfaces;
using Noltrion.FleetX.Domain.Entities;
using Noltrion.Framework.Domain; // Correct namespace for IUnitOfWork

namespace Noltrion.FleetX.Infrastructure.Services.Web
{
    public class InvoiceService : IInvoiceService
    {
        private readonly IUnitOfWork _unitOfWork;

        public InvoiceService(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public async Task<List<InvoiceDto>> GetAllAsync()
        {
            var invoices = await _unitOfWork.Repository<Invoice>()
                .Query()
                .Include(i => i.InvoiceLines)
                .OrderByDescending(i => i.InvoiceDate)
                .ToListAsync();

            return invoices.Select(MapToDto).ToList();
        }

        public async Task<ApiResult<InvoiceDto>> GetByTripIdAsync(string tripId)
        {
            if (!Guid.TryParse(tripId, out var tripGuid)) return ApiResult<InvoiceDto>.Failure("Invalid Trip ID");

            var invoice = await _unitOfWork.Repository<Invoice>()
                .Query()
                .Include(i => i.InvoiceLines) // Corrected property name
                .FirstOrDefaultAsync(i => i.TripId == tripGuid);

            if (invoice == null) return ApiResult<InvoiceDto>.Failure("Invoice not found for this trip");

            return ApiResult<InvoiceDto>.Ok(MapToDto(invoice));
        }

        public async Task<ApiResult<InvoiceDto>> GenerateForTripAsync(string tripId)
        {
            if (!Guid.TryParse(tripId, out var tripGuid)) return ApiResult<InvoiceDto>.Failure("Invalid Trip ID");

            // 1. Check if invoice already exists
            var existing = await _unitOfWork.Repository<Invoice>().Query().FirstOrDefaultAsync(i => i.TripId == tripGuid);
            if (existing != null) return ApiResult<InvoiceDto>.Failure("Invoice already exists for this trip");

            // 2. Fetch Trip Data with Packages and Vehicle Info
            var trip = await _unitOfWork.Repository<Trip>()
                .Query()
                .Include(t => t.Packages)
                .Include(t => t.Vehicle)
                .FirstOrDefaultAsync(t => t.Id == tripGuid);

            if (trip == null) return ApiResult<InvoiceDto>.Failure("Trip not found");

            // 3. Calculate Charges
            decimal subTotal = 0;
            var invoice = new Invoice
            {
                Id = Guid.NewGuid(), // Corrected type
                TripId = trip.Id,
                InvoiceDate = DateTime.UtcNow,
                InvoiceNumber = $"INV-{DateTime.UtcNow:yyyyMM}-{new Random().Next(1000, 9999)}",
                BillingSource = "System",
                Currency = "SGD",
                Status = "Draft",
                InvoiceLines = new System.Collections.Generic.List<InvoiceLine>() // Corrected property name
            };

            // Base Charge based on Truck Type
            decimal baseRate = trip.TruckType == "24FT" ? 150m : 80m;
            invoice.InvoiceLines.Add(new InvoiceLine 
            { 
                Id = Guid.NewGuid(), // Corrected type
                InvoiceId = invoice.Id,
                Description = $"Transport Charges - {trip.TruckType} - {trip.Vehicle?.RegistrationNumber}",
                Amount = baseRate,
                TaxAmount = baseRate * 0.09m
            });
            subTotal += baseRate;

            // Pallet Charges
            int totalPallets = trip.Packages.Where(p => p.PackageType == "Pallets").Sum(p => p.NoOfPallets ?? 0);
            if (totalPallets > 0)
            {
                decimal palletRate = 15m; // $15 per pallet
                decimal palletTotal = totalPallets * palletRate;
                invoice.InvoiceLines.Add(new InvoiceLine
                {
                    Id = Guid.NewGuid(),
                    InvoiceId = invoice.Id,
                    Description = $"Pallet Surcharge ({totalPallets} x ${palletRate})",
                    Amount = palletTotal,
                    TaxAmount = palletTotal * 0.09m
                });
                subTotal += palletTotal;
            }

            // Helper Charge
            if (!string.IsNullOrEmpty(trip.HelperName))
            {
                decimal helperAmt = 40m;
                invoice.InvoiceLines.Add(new InvoiceLine
                {
                    Id = Guid.NewGuid(),
                    InvoiceId = invoice.Id,
                    Description = "Helper Service",
                    Amount = helperAmt,
                    TaxAmount = helperAmt * 0.09m
                });
                subTotal += helperAmt;
            }

            // POD Surcharge
            if (trip.ProofOfDeliveryRequired)
            {
                decimal podAmt = 10m;
                invoice.InvoiceLines.Add(new InvoiceLine
                {
                    Id = Guid.NewGuid(),
                    InvoiceId = invoice.Id,
                    Description = "POD Handling Fee",
                    Amount = podAmt,
                    TaxAmount = podAmt * 0.09m
                });
                subTotal += podAmt;
            }

            invoice.TotalAmount = subTotal;
            invoice.TotalTax = subTotal * 0.09m; // 9% GST

            // 4. Save
            await _unitOfWork.Repository<Invoice>().AddAsync(invoice);
            await _unitOfWork.SaveChangesAsync();

            return ApiResult<InvoiceDto>.Ok(MapToDto(invoice));
        }

        public async Task<ApiResult<bool>> UpdateStatusAsync(string id, string status)
        {
            if (!Guid.TryParse(id, out var guidId)) return ApiResult<bool>.Failure("Invalid Invoice ID");

            var invoice = await _unitOfWork.Repository<Invoice>().GetByIdAsync(guidId);
            if (invoice == null) return ApiResult<bool>.Failure("Invoice not found");

            invoice.Status = status;
            await _unitOfWork.Repository<Invoice>().UpdateAsync(invoice);
            await _unitOfWork.SaveChangesAsync();

            return ApiResult<bool>.Ok(true);
        }

        public async Task<ApiResult<bool>> UpdateAsync(InvoiceDto dto)
        {
            if (!Guid.TryParse(dto.Id, out var guidId)) return ApiResult<bool>.Failure("Invalid Invoice ID");

            var repo = _unitOfWork.Repository<Invoice>();
            // Use query with includes to load existing lines for deletion
            var invoice = await repo.Query()
                .Include(i => i.InvoiceLines)
                .FirstOrDefaultAsync(i => i.Id == guidId);

            if (invoice == null) return ApiResult<bool>.Failure("Invoice not found");

            // Update Header
            invoice.TotalAmount = dto.TotalAmount;
            invoice.TotalTax = dto.TotalTax;
            invoice.Status = dto.Status;
            
            // Note: InvoiceNumber, TripId, Date usually don't change on simple update

            // Replace Lines
            // 1. Remove existing
            var lineRepo = _unitOfWork.Repository<InvoiceLine>();
            foreach (var line in invoice.InvoiceLines.ToList())
            {
                await lineRepo.DeleteAsync(line.Id);
            }
            invoice.InvoiceLines.Clear();

            // 2. Add new
            foreach (var lineDto in dto.Lines)
            {
                invoice.InvoiceLines.Add(new InvoiceLine
                {
                    Id = Guid.TryParse(lineDto.Id, out var lid) ? lid : Guid.NewGuid(),
                    InvoiceId = invoice.Id,
                    Description = lineDto.Description,
                    Amount = lineDto.Amount,
                    TaxAmount = lineDto.TaxAmount
                });
            }

            await repo.UpdateAsync(invoice);
            await _unitOfWork.SaveChangesAsync();

            return ApiResult<bool>.Ok(true);
        }

        private InvoiceDto MapToDto(Invoice entity)
        {
            return new InvoiceDto
            {
                Id = entity.Id.ToString(),
                InvoiceNumber = entity.InvoiceNumber,
                InvoiceDate = entity.InvoiceDate,
                TripId = entity.TripId.ToString(),
                TotalAmount = entity.TotalAmount,
                TotalTax = entity.TotalTax,
                Status = entity.Status,
                BillingSource = entity.BillingSource,
                Lines = entity.InvoiceLines.Select(l => new InvoiceLineDto // Corrected property name
                {
                    Id = l.Id.ToString(),
                    Description = l.Description,
                    Amount = l.Amount,
                    TaxAmount = l.TaxAmount
                }).ToList()
            };
        }
    }
}
