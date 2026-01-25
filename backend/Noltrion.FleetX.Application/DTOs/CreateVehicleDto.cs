using System.ComponentModel.DataAnnotations;

namespace Noltrion.FleetX.Application.DTOs.Common
{
    public class CreateVehicleDto
    {
        [Required]
        public string RegistrationNumber { get; set; } = string.Empty;
        [Required]
        public string Model { get; set; } = string.Empty;
        public string Type { get; set; } = string.Empty;
    }
}
