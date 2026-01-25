using System;
using System.ComponentModel.DataAnnotations;

namespace Noltrion.Framework.Domain.Entities
{
    public class AuditLog : BaseEntity
    {
        [Required]
        [MaxLength(100)]
        public string EntityName { get; set; } = string.Empty;

        [Required]
        [MaxLength(100)]
        public string PrimaryKey { get; set; } = string.Empty;

        [Required]
        [MaxLength(50)]
        public string Action { get; set; } = string.Empty; // Insert, Update, Delete

        public string? UserId { get; set; }

        public string? OldValues { get; set; } // JSON
        public string? NewValues { get; set; } // JSON
        
        public DateTime Timestamp { get; set; } = DateTime.UtcNow;
    }
}
