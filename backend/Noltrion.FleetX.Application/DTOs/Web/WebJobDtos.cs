using System;
using System.ComponentModel.DataAnnotations;

namespace Noltrion.FleetX.Application.DTOs.Web
{
    public class CreateJobDto
    {
        [Required]
        public string CustomerName { get; set; } = string.Empty;
        public string EmailReference { get; set; } = string.Empty;
        
        [Required]
        public string PickupAddress { get; set; } = string.Empty;
        public DateTime? RequestedPickupTime { get; set; }

        [Required]
        public string DeliveryAddress { get; set; } = string.Empty;
        public DateTime? RequestedDeliveryTime { get; set; }

        public double WeightKg { get; set; }
        public double VolumeCbm { get; set; }
        public string RequiredVehicleType { get; set; } = string.Empty;
        public string SpecialInstructions { get; set; } = string.Empty;
    }

    public class JobWebDto : CreateJobDto
    {
        public Guid Id { get; set; }
        public string Status { get; set; } = string.Empty;
        public string Source { get; set; } = string.Empty;
        public DateTime CreatedOn { get; set; }
    }
}
