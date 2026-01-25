using System;
using System.ComponentModel.DataAnnotations;

namespace Noltrion.Framework.Domain.Entities
{
    public class RefreshToken : BaseEntity
    {
        public Guid UserId { get; set; }
        public User? User { get; set; }

        [Required]
        [MaxLength(255)]
        public string Token { get; set; } = string.Empty;

        public DateTime Expires { get; set; }
        public bool IsExpired => DateTime.UtcNow >= Expires;

        public DateTime? Revoked { get; set; }
        public bool IsRevoked => Revoked != null;
        
        [MaxLength(255)]
        public string? ReplacedByToken { get; set; }
        
        public bool IsActive => !IsRevoked && !IsExpired;
    }
}
