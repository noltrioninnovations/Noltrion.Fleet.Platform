using System;

namespace Noltrion.Framework.Application.Models
{
    public class EmailMessage
    {
        public string From { get; set; } = string.Empty;
        public string To { get; set; } = string.Empty;
        public string Subject { get; set; } = string.Empty;
        public string Body { get; set; } = string.Empty;
        public DateTime Date { get; set; }
        public string MessageId { get; set; } = string.Empty;
    }
}
