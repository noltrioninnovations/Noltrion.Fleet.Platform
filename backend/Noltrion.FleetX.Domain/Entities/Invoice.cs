using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Noltrion.Framework.Domain;

namespace Noltrion.FleetX.Domain.Entities
{
    public class Invoice : BaseEntity
    {
        [MaxLength(50)]
        public string InvoiceNumber { get; set; } // System generated
        
        public DateTime InvoiceDate { get; set; }
        
        public Guid TripId { get; set; }
        [ForeignKey("TripId")]
        public virtual Trip Trip { get; set; }

        public string BillingSource { get; set; } = "Manifest";

        public Guid DebtorId { get; set; } // Usually the CustomerId from Trip
        public string Currency { get; set; } = "SGD";

        public decimal TotalAmount { get; set; }
        public decimal TotalTax { get; set; }
        
        public string Status { get; set; } = "Accrued"; // Accrued, Invoiced, PaymentReceived, Cancelled

        public virtual ICollection<InvoiceLine> InvoiceLines { get; set; } = new List<InvoiceLine>();
    }
}
