using System;
using System.Collections.Generic;

namespace Noltrion.FleetX.Application.DTOs.Web
{
    public class CreateTripDto
    {
        public DateTime TripDate { get; set; }
        public Guid? CustomerId { get; set; } // For "Job / Customer" requirement
        public string TruckType { get; set; } // 14FT / 24FT
        public Guid? VehicleId { get; set; }
        public Guid? DriverId { get; set; }
        public DateTime? StartTime { get; set; }
        public DateTime? EndTime { get; set; }
        public decimal TotalCost { get; set; }
        public int NumberOfTrips { get; set; } = 1;
        public string? ChargesType { get; set; } // Monthly / Adhoc
        public string? HelperName { get; set; }
        public string? Remarks { get; set; }
        public Guid? JobRequestId { get; set; }
        
        public string? TimeWindowFrom { get; set; } // "HH:mm"
        public string? TimeWindowTo { get; set; } // "HH:mm"
        public bool ProofOfDeliveryRequired { get; set; }
        
        public List<TripPackageDto> Packages { get; set; } = new List<TripPackageDto>();
    }

    public class TripPackageDto
    {
        public string PackageType { get; set; }
        public int Quantity { get; set; }
        public decimal? Volume { get; set; }
        public int? NoOfPallets { get; set; }
    }
}
