using System;

namespace Noltrion.FleetX.Application.DTOs.Web
{
    public class VehicleWebDto
    {
        public Guid Id { get; set; }
        public string RegistrationNumber { get; set; } = string.Empty;
        public string Model { get; set; } = string.Empty;
        public string Type { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public DateTime CreatedOn { get; set; }
        public string CreatedBy { get; set; } = string.Empty;
    }
}

namespace Noltrion.FleetX.Application.DTOs.Mobile
{
    public class VehicleMobileDto
    {
        public Guid Id { get; set; }
        public string RegistrationNumber { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
    }
}
