using System;
using System.ComponentModel.DataAnnotations.Schema;
using Noltrion.Framework.Domain;

namespace Noltrion.FleetX.Domain.Entities
{
    public class TripPackage : BaseEntity
    {
        public Guid TripId { get; set; }

        [ForeignKey("TripId")]
        public virtual Trip Trip { get; set; }

        public string PackageType { get; set; } // Pallets, Box, Crate
        public int Quantity { get; set; }
        public decimal? Volume { get; set; } // M3
        public int? NoOfPallets { get; set; }
    }
}
