using System;

namespace Noltrion.FleetX.Application.DTOs.Web
{
    public class CreateJobRequestDto
    {
        public DateTime PreferredDate { get; set; }
        public string? PickupLocation { get; set; }
        public string? DropLocation { get; set; }
        public string? CargoDescription { get; set; }
        public double? Volume { get; set; }
        public double? Weight { get; set; }
    }

    public class JobRequestDto : CreateJobRequestDto
    {
        public Guid Id { get; set; }
        public Guid CustomerId { get; set; }
        public string RequestStatus { get; set; }
        public DateTime CreatedAt { get; set; }
        public Guid? TripId { get; set; }
    }
}
