using System;

namespace Noltrion.Framework.Domain.Entities
{
    public class RoleMenu : BaseEntity
    {
        public Guid RoleId { get; set; }
        public Role? Role { get; set; }

        public Guid MenuId { get; set; }
        public Menu? Menu { get; set; }
    }
}
