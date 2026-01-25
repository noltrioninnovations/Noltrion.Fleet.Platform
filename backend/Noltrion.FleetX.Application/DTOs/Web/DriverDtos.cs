using System.ComponentModel.DataAnnotations;

namespace Noltrion.FleetX.Application.DTOs.Web
{
    public class CreateDriverDto
    {
        [Required]
        public string Name { get; set; } = string.Empty;
        
        [Required]
        public string LicenseNumber { get; set; } = string.Empty;

        public string Phone { get; set; } = string.Empty;
    }

    public class DriverWebDto
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string LicenseNumber { get; set; } = string.Empty;
        public string Phone { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
    }
}
