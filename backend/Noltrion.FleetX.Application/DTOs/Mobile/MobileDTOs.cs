using System;
using System.Collections.Generic;

namespace Noltrion.FleetX.Application.DTOs.Mobile
{
    public class MobileTripDto
    {
        public Guid Id { get; set; }
        public string VehicleReg { get; set; } = string.Empty;
        public int JobCount { get; set; }
        public string Status { get; set; } = string.Empty;
        public double TotalWeightKg { get; set; }
        public DateTime? StartTime { get; set; }
        public List<MobileJobDto> Jobs { get; set; } = new List<MobileJobDto>();
    }

    public class MobileJobDto
    {
        public Guid Id { get; set; }
        public int Sequence { get; set; }
        public string CustomerName { get; set; } = string.Empty;
        public string Address { get; set; } = string.Empty;
        public double Latitude { get; set; }
        public double Longitude { get; set; }
        public string Type { get; set; } = "Delivery"; // Pickup / Delivery
        public double WeightKg { get; set; }
        public string Status { get; set; } = string.Empty;
    }

    public class DriverActionRequest
    {
        public double Latitude { get; set; }
        public double Longitude { get; set; }
        public DateTime Timestamp { get; set; }
        public string? Note { get; set; }
    }
}
