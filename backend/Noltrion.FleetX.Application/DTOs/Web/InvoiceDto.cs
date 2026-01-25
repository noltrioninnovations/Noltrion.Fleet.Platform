using System;
using System.Collections.Generic;

namespace Noltrion.FleetX.Application.DTOs.Web
{
    public class InvoiceDto
    {
        public string Id { get; set; }
        public string InvoiceNumber { get; set; }
        public DateTime InvoiceDate { get; set; }
        public string TripId { get; set; }
        public string BillingSource { get; set; }
        public string Currency { get; set; } = "SGD";
        public decimal TotalAmount { get; set; }
        public decimal TotalTax { get; set; }
        public string Status { get; set; } // Draft, Approved, Paid
        
        public List<InvoiceLineDto> Lines { get; set; } = new List<InvoiceLineDto>();
    }

    public class InvoiceLineDto
    {
        public string Id { get; set; }
        public string Description { get; set; }
        public decimal Amount { get; set; }
        public decimal TaxAmount { get; set; }
    }
}
