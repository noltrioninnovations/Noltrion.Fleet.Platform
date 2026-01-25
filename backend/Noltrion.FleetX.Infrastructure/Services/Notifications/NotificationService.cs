using Noltrion.Framework.Application.Interfaces;
using Noltrion.Framework.Domain.Entities;
using System.Threading.Tasks;

namespace Noltrion.FleetX.Infrastructure.Services.Notifications
{
    public interface INotificationService
    {
        Task NotifyDriverAssignedAsync(string driverEmail, string tripId);
        Task NotifyPodApprovedAsync(string customerEmail, string jobId);
    }

    public class NotificationService : INotificationService
    {
        private readonly IEmailService _emailService;

        public NotificationService(IEmailService emailService)
        {
            _emailService = emailService;
        }

        public async Task NotifyDriverAssignedAsync(string driverEmail, string tripId)
        {
            var subject = "New Trip Assigned";
            var body = $"You have been assigned to Trip {tripId}. Please check your app.";
            await _emailService.SendEmailAsync(driverEmail, subject, body);
        }

        public async Task NotifyPodApprovedAsync(string customerEmail, string jobId)
        {
            var subject = "Delivery Confirmed";
            var body = $"Your Job {jobId} has been delivered and verified.";
            await _emailService.SendEmailAsync(customerEmail, subject, body);
        }
    }
}
