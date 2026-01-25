using System.Collections.Generic;
using System.Threading.Tasks;
using Noltrion.Framework.Application.Models;

namespace Noltrion.Framework.Application.Interfaces
{
    public interface IEmailService
    {
        Task SendEmailAsync(string to, string subject, string body);
        Task<List<EmailMessage>> FetchUnreadEmailsAsync(string host, int port, bool useSsl, string username, string password);
    }
}
