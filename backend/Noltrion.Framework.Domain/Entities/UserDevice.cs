using System;
using System.ComponentModel.DataAnnotations;

namespace Noltrion.Framework.Domain.Entities
{
    public class UserDevice : BaseEntity
    {
        public Guid UserId { get; set; }
        public User? User { get; set; }

        [Required]
        [MaxLength(255)]
        public string DeviceId { get; set; } = string.Empty;

        [MaxLength(100)]
        public string DeviceType { get; set; } = string.Empty; // Mobile, Web

        [MaxLength(255)]
        public string? FcmToken { get; set; } // Firebase Cloud Messaging
    }
}
