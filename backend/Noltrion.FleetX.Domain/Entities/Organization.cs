using System.ComponentModel.DataAnnotations;
using Noltrion.Framework.Domain;

namespace Noltrion.FleetX.Domain.Entities
{
    public class Organization : BaseEntity
    {
        [Required]
        [MaxLength(20)]
        public string Code { get; set; } = string.Empty;

        [Required]
        [MaxLength(150)]
        public string Name { get; set; } = string.Empty;

        [MaxLength(500)]
        public string Address { get; set; } = string.Empty;

        public bool IsActive { get; set; } = true;
    }
}
