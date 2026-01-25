using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace Noltrion.Framework.Domain.Entities
{
    public class Permission : BaseEntity
    {
        [Required]
        [MaxLength(100)]
        public string Code { get; set; } = string.Empty;

        [Required]
        [MaxLength(100)]
        public string Name { get; set; } = string.Empty;

        [MaxLength(100)]
        public string Group { get; set; } = string.Empty;

        // Navigation properties
        public ICollection<RolePermission> RolePermissions { get; set; } = new List<RolePermission>();
    }
}
