using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Noltrion.Framework.Domain;

namespace Noltrion.FleetX.Domain.Entities
{
    public class JobRequest : BaseEntity
    {
        [Required]
        public Guid CustomerId { get; set; }
        
        [Required]
        public DateTime PreferredDate { get; set; }
        
        public string? PickupLocation { get; set; }
        public string? DropLocation { get; set; }
        
        [MaxLength(250)]
        public string? CargoDescription { get; set; }
        
        public double? Volume { get; set; }
        public double? Weight { get; set; }
        
        [MaxLength(20)]
        public string RequestStatus { get; set; } = "Submitted"; // Submitted, Converted, Rejected
        
        public Guid? TripId { get; set; }
        
        [ForeignKey("TripId")]
        public virtual Trip? Trip { get; set; }
    }
}
