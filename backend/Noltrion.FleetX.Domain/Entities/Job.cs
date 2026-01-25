using System;
using System.ComponentModel.DataAnnotations;
using Noltrion.Framework.Domain;
using Noltrion.Framework.Shared.Enums;

namespace Noltrion.FleetX.Domain.Entities
{
    public class Job : BaseEntity
    {
        [Required]
        [MaxLength(200)]
        public string CustomerName { get; set; } = string.Empty;

        [MaxLength(100)]
        public string EmailReference { get; set; } = string.Empty;

        public JobSource Source { get; set; } = JobSource.Manual;
        public JobStatus Status { get; set; } = JobStatus.Received;

        // Pickup Details
        [Required]
        [MaxLength(500)]
        public string PickupAddress { get; set; } = string.Empty;
        public double? PickupLatitude { get; set; }
        public double? PickupLongitude { get; set; }
        public DateTime? RequestedPickupTime { get; set; }

        // Delivery Details
        [Required]
        [MaxLength(500)]
        public string DeliveryAddress { get; set; } = string.Empty;
        public double? DeliveryLatitude { get; set; }
        public double? DeliveryLongitude { get; set; }
        public DateTime? RequestedDeliveryTime { get; set; }

        // Load Details
        public double WeightKg { get; set; }
        public double VolumeCbm { get; set; }
        
        [MaxLength(100)]
        public string RequiredVehicleType { get; set; } = string.Empty;

        [MaxLength(1000)]
        public string SpecialInstructions { get; set; } = string.Empty;
    }
}
