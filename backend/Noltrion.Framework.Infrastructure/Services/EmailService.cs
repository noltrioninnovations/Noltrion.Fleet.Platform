using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using MailKit;
using MailKit.Net.Imap;
using MailKit.Net.Smtp;
using MailKit.Search;
using MailKit.Security;
using MimeKit;
using Noltrion.Framework.Application.Interfaces;
using Noltrion.Framework.Application.Models;

namespace Noltrion.Framework.Infrastructure.Services
{
    public class EmailService : IEmailService
    {
        public async Task SendEmailAsync(string to, string subject, string body)
        {
            // Simplified SMTP implementation stub
            // In real world, use SmtpClient with config
            await Task.CompletedTask; 
        }

        public async Task<List<EmailMessage>> FetchUnreadEmailsAsync(string host, int port, bool useSsl, string username, string password)
        {
            var messages = new List<EmailMessage>();

            using (var client = new ImapClient())
            {
                await client.ConnectAsync(host, port, useSsl);
                await client.AuthenticateAsync(username, password);

                var inbox = client.Inbox;
                await inbox.OpenAsync(FolderAccess.ReadWrite);

                // Fetch unread messages
                var uids = await inbox.SearchAsync(SearchQuery.NotSeen);
                
                foreach (var uid in uids)
                {
                    var message = await inbox.GetMessageAsync(uid);
                    
                    messages.Add(new EmailMessage
                    {
                        From = message.From.ToString(),
                        To = message.To.ToString(),
                        Subject = message.Subject,
                        Body = message.TextBody ?? message.HtmlBody,
                        Date = message.Date.DateTime,
                        MessageId = message.MessageId
                    });

                    // Mark as seen
                    await inbox.AddFlagsAsync(uid, MessageFlags.Seen, true);
                }

                await client.DisconnectAsync(true);
            }

            return messages;
        }
    }
}
