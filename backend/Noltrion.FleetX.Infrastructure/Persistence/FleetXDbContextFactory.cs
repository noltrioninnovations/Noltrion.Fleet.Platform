using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;
using Microsoft.EntityFrameworkCore.Diagnostics;

namespace Noltrion.FleetX.Infrastructure.Persistence
{
    public class FleetXDbContextFactory : IDesignTimeDbContextFactory<FleetXDbContext>
    {
        public FleetXDbContext CreateDbContext(string[] args)
        {
            var optionsBuilder = new DbContextOptionsBuilder<FleetXDbContext>();
            var dbProvider = System.Environment.GetEnvironmentVariable("DBProvider");

            if (dbProvider == "PostgreSQL")
            {
                System.AppContext.SetSwitch("Npgsql.EnableLegacyTimestampBehavior", true);
                var connectionString = System.Environment.GetEnvironmentVariable("PostgreSqlConnection") ?? "Host=localhost;Port=5432;Database=fleetx_dev;Username=postgres;Password=password";
                optionsBuilder.UseNpgsql(connectionString);
            }
            else
            {
                var connectionString = System.Environment.GetEnvironmentVariable("DefaultConnection") ?? "Data Source=DESKTOP-L1S9R7K;Initial Catalog=FleetX;Integrated Security=True;TrustServerCertificate=True;MultipleActiveResultSets=True";
                optionsBuilder.UseSqlServer(connectionString)
                    .ConfigureWarnings(warnings => warnings.Ignore(RelationalEventId.PendingModelChangesWarning));
            }

            return new FleetXDbContext(optionsBuilder.Options);
        }
    }
}
