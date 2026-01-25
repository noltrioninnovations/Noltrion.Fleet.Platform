using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace Noltrion.Framework.Domain.Entities
{
    public class Menu : BaseEntity
    {
        [Required]
        [MaxLength(100)]
        public string Code { get; set; } = string.Empty;

        [Required]
        [MaxLength(100)]
        public string Title { get; set; } = string.Empty;

        [MaxLength(255)]
        public string Url { get; set; } = string.Empty;

        [MaxLength(50)]
        public string Icon { get; set; } = string.Empty;

        public int Order { get; set; }

        public Guid? ParentId { get; set; }
        public Menu? Parent { get; set; }
        public ICollection<Menu> Children { get; set; } = new List<Menu>();

        public ICollection<RoleMenu> RoleMenus { get; set; } = new List<RoleMenu>();
    }
}
