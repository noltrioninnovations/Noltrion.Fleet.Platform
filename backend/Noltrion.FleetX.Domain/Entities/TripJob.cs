using System;
using System.ComponentModel.DataAnnotations.Schema;
using Noltrion.Framework.Domain;

namespace Noltrion.FleetX.Domain.Entities
{
    public class TripJob : BaseEntity
    {
        public Guid TripId { get; set; }
        
        [ForeignKey("TripId")]
        public virtual Trip? Trip { get; set; }

        public Guid JobId { get; set; }
        
        [ForeignKey("JobId")]
        public virtual Job? Job { get; set; }

        public int SequenceOrder { get; set; }
        
        public string Status { get; set; } = "Pending"; // Pending, PickedUp, Delivered
    }
}
