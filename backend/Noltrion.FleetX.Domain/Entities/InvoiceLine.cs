using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Noltrion.Framework.Domain;

namespace Noltrion.FleetX.Domain.Entities
{
    public class InvoiceLine : BaseEntity
    {
        public Guid InvoiceId { get; set; }
        [ForeignKey("InvoiceId")]
        public virtual Invoice Invoice { get; set; }

        [MaxLength(250)]
        public string Description { get; set; } // Charge Description

        public decimal Amount { get; set; }
        public decimal TaxAmount { get; set; }
    }
}
