using System;
using System.ComponentModel.DataAnnotations;
using Noltrion.Framework.Domain;

namespace Noltrion.FleetX.Domain.Entities
{
    public class Driver : BaseEntity
    {
        [Required]
        [MaxLength(100)]
        public string FullName { get; set; } = string.Empty;

        [Required]
        [MaxLength(20)]
        public string LicenseNumber { get; set; } = string.Empty;

        [MaxLength(20)]
        public string PhoneNumber { get; set; } = string.Empty;

        public bool IsActive { get; set; } = true;
    }
}
