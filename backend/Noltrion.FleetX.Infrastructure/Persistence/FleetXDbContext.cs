using Microsoft.EntityFrameworkCore;
using Noltrion.FleetX.Domain.Entities;
using Noltrion.Framework.Infrastructure.Persistence;

namespace Noltrion.FleetX.Infrastructure.Persistence
{
    public class FleetXDbContext : FrameworkDbContext
    {
        public FleetXDbContext(DbContextOptions<FleetXDbContext> options) : base(options)
        {
        }

        public DbSet<Vehicle> Vehicles { get; set; }
        public DbSet<Driver> Drivers { get; set; }
        public DbSet<Job> Jobs { get; set; }
        public DbSet<Trip> Trips { get; set; }
        public DbSet<TripJob> TripJobs { get; set; }
        public DbSet<Customer> Customers { get; set; }
        public DbSet<Organization> Organizations { get; set; }
        public DbSet<TripPackage> TripPackages { get; set; }
        public DbSet<Invoice> Invoices { get; set; }
        public DbSet<InvoiceLine> InvoiceLines { get; set; }
        public DbSet<JobRequest> JobRequests { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<Vehicle>()
                .HasIndex(v => v.RegistrationNumber)
                .IsUnique();

            modelBuilder.Entity<Driver>()
                .HasIndex(d => d.LicenseNumber)
                .IsUnique();

            modelBuilder.Entity<Organization>()
                .HasIndex(o => o.Code)
                .IsUnique();
        }
    }
}
