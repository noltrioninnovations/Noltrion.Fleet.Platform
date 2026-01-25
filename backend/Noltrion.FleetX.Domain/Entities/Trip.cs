using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Noltrion.Framework.Domain;

namespace Noltrion.FleetX.Domain.Entities
{
    public class Trip : BaseEntity
    {
        public string TripStatus { get; set; } = "Planned"; // Planned, InProgress, Completed, Cancelled
        
        [MaxLength(20)]
        public string TripNumber { get; set; } = string.Empty;
        
        public DateTime TripDate { get; set; }
        
        [MaxLength(10)]
        public string TruckType { get; set; } // 14FT / 24FT
        
        public string? HelperName { get; set; }
        
        [MaxLength(250)]
        public string? Remarks { get; set; }

        public string? ChargesType { get; set; } // Monthly / Adhoc
        public int NumberOfTrips { get; set; } = 1;

        public Guid? VehicleId { get; set; }
        
        [ForeignKey("VehicleId")]
        public virtual Vehicle? Vehicle { get; set; }

        public Guid? DriverId { get; set; }
        
        [ForeignKey("DriverId")]
        public virtual Driver? Driver { get; set; }

        public DateTime? StartTime { get; set; }
        public DateTime? EndTime { get; set; }

        public double TotalDistanceKm { get; set; }
        public decimal TotalCost { get; set; }
        
        public TimeSpan? TimeWindowFrom { get; set; }
        public TimeSpan? TimeWindowTo { get; set; }
        public bool ProofOfDeliveryRequired { get; set; }
        public string? ProofOfDeliveryUrl { get; set; }
        
        public string? PickupLocation { get; set; }
        public string? DropLocation { get; set; }

        public Guid? JobRequestId { get; set; }
        // No Navigation property back to JobRequest needed here to avoid circular dependencies if simple ID is enough,
        // but since it's 1-to-1 often, let's keep it simple. JobRequest holds the FK to Trip usually.
        // Actually, let's add the ID for reference.
        
        public virtual ICollection<TripJob> TripJobs { get; set; } = new List<TripJob>();
        public virtual ICollection<TripPackage> Packages { get; set; } = new List<TripPackage>();
        public virtual ICollection<Invoice> Invoices { get; set; } = new List<Invoice>();
    }
}
