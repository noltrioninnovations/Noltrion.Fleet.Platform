using System;
using System.ComponentModel.DataAnnotations;
using Noltrion.Framework.Domain;

namespace Noltrion.FleetX.Domain.Entities
{
    public class Vehicle : BaseEntity
    {
        [Required]
        [MaxLength(50)]
        public string RegistrationNumber { get; set; } = string.Empty;

        [Required]
        [MaxLength(100)]
        public string Model { get; set; } = string.Empty;

        [MaxLength(50)]
        public string Type { get; set; } = string.Empty; // e.g., Truck, Van

        public string Status { get; set; } = "Active"; // Active, Maintenance, Inactive

        public double CapacityKg { get; set; }
        public double VolumeCapacity { get; set; }

        public double? Latitude { get; set; }
        public double? Longitude { get; set; }
        public DateTime? LastLocationUpdate { get; set; }
    }
}
