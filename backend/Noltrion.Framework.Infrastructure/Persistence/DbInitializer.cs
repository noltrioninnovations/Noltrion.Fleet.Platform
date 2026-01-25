using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Cryptography;
using System.Text;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Noltrion.Framework.Domain.Entities;

namespace Noltrion.Framework.Infrastructure.Persistence
{
    public static class DbInitializer
    {
        public static async Task SeedAsync(FrameworkDbContext context)
        {
            // Seed Roles
            if (!context.Roles.Any())
            {
                var roles = new[]
                {
                    new Role { Code = "SuperAdmin", Name = "Super Administrator", Description = "System Owner" },
                    new Role { Code = "OperationManager", Name = "Operation Manager", Description = "Fleet Operations" },
                    new Role { Code = "Driver", Name = "Driver", Description = "Vehicle Driver" },
                    new Role { Code = "Customer", Name = "Customer", Description = "Client User" }
                };
                context.Roles.AddRange(roles);
                await context.SaveChangesAsync();
            }

            // Seed User
            if (!context.Users.Any())
            {
                var superAdminRole = context.Roles.FirstOrDefault(r => r.Code == "SuperAdmin");
                if (superAdminRole != null)
                {
                    var user = new User
                    {
                        Username = "admin",
                        Email = "admin@noltrion.com",
                        FirstName = "System",
                        LastName = "Admin",
                        PasswordHash = HashPassword("Admin@123"), // Default Password
                        CreatedBy = "System",
                        IsActive = true
                    };
                    
                    context.Users.Add(user);
                    await context.SaveChangesAsync();

                    // Assign Role
                    var userRole = new UserRole { UserId = user.Id, RoleId = superAdminRole.Id };
                    context.UserRoles.Add(userRole);
                    await context.SaveChangesAsync();
                }

                // Seed Operation Manager
                var opManagerRole = context.Roles.FirstOrDefault(r => r.Code == "OperationManager");
                if (opManagerRole != null)
                {
                    var manager = new User
                    {
                        Username = "manager",
                        Email = "manager@fleetx.com",
                        FirstName = "Operation",
                        LastName = "Manager",
                        PasswordHash = HashPassword("Manager@123"),
                        CreatedBy = "System",
                        IsActive = true
                    };
                    context.Users.Add(manager);
                    await context.SaveChangesAsync();

                    context.UserRoles.Add(new UserRole { UserId = manager.Id, RoleId = opManagerRole.Id });
                    await context.SaveChangesAsync();
                }
            }

            // Seed Menus
            if (!context.Menus.Any(m => m.Code == "JOBS"))
            {
                var menus = new List<Menu>();
                var superAdminRole = context.Roles.FirstOrDefault(r => r.Code == "SuperAdmin");

                // 1. Dashboard
                var dashboard = new Menu { Title = "Dashboard", Code = "DASHBOARD", Icon = "LayoutDashboard", Order = 1, Url = "/" };
                menus.Add(dashboard);

                // 2. Jobs
                var jobsParams = new Menu { Title = "Jobs", Code = "JOBS", Icon = "Briefcase", Order = 2 };
                menus.Add(jobsParams);
                
                // 3. Planning
                var planning = new Menu { Title = "Planning", Code = "PLANNING", Icon = "Calendar", Order = 3 };
                menus.Add(planning);

                // 4. Trips
                var trips = new Menu { Title = "Trips", Code = "TRIPS", Icon = "Map", Order = 4 };
                menus.Add(trips);

                // 5. Fleet
                var fleet = new Menu { Title = "Fleet", Code = "FLEET", Icon = "Truck", Order = 5 };
                menus.Add(fleet);

                // 6. Customers
                var customers = new Menu { Title = "Customers", Code = "CUSTOMERS", Icon = "Users", Order = 6 };
                menus.Add(customers);

                // 7. Reports
                var reports = new Menu { Title = "Reports", Code = "REPORTS", Icon = "BarChart", Order = 7 };
                menus.Add(reports);

                // 8. Billing
                var billing = new Menu { Title = "Billing", Code = "BILLING", Icon = "DollarSign", Order = 8 };
                menus.Add(billing);

                // 8. Administration
                var admin = new Menu { Title = "Administration", Code = "ADMIN", Icon = "Settings", Order = 99 };
                menus.Add(admin);

                context.Menus.AddRange(menus);
                await context.SaveChangesAsync(); 

                // Seed Children
                var childMenus = new List<Menu>();

                // Jobs Children
                childMenus.Add(new Menu { Title = "Incoming Jobs", Code = "JOBS_INCOMING", Url = "/jobs/incoming", ParentId = jobsParams.Id, Order = 1 });
                childMenus.Add(new Menu { Title = "Planned Jobs", Code = "JOBS_PLANNED", Url = "/jobs/planned", ParentId = jobsParams.Id, Order = 2 });
                childMenus.Add(new Menu { Title = "Assigned Jobs", Code = "JOBS_ASSIGNED", Url = "/jobs/assigned", ParentId = jobsParams.Id, Order = 3 });

                // Planning Children
                childMenus.Add(new Menu { Title = "Auto Planning", Code = "PLAN_AUTO", Url = "/planning/auto", ParentId = planning.Id, Order = 1 });
                childMenus.Add(new Menu { Title = "Planning Board", Code = "PLAN_BOARD", Url = "/planning", ParentId = planning.Id, Order = 2 });

                // Trips Children
                childMenus.Add(new Menu { Title = "Active Trips", Code = "TRIPS_ACTIVE", Url = "/trips/active", ParentId = trips.Id, Order = 1 });
                childMenus.Add(new Menu { Title = "Trip History", Code = "TRIPS_HISTORY", Url = "/trips/history", ParentId = trips.Id, Order = 2 });

                // Fleet Children
                childMenus.Add(new Menu { Title = "Vehicles", Code = "FLEET_VEHICLES", Url = "/vehicles", ParentId = fleet.Id, Order = 1 });
                childMenus.Add(new Menu { Title = "Drivers", Code = "FLEET_DRIVERS", Url = "/drivers", ParentId = fleet.Id, Order = 2 });

                // Customers Children
                childMenus.Add(new Menu { Title = "Customer Master", Code = "CUST_MASTER", Url = "/customers", ParentId = customers.Id, Order = 1 });

                // Reports Children
                childMenus.Add(new Menu { Title = "Daily Summary", Code = "RPT_DAILY", Url = "/reports/daily", ParentId = reports.Id, Order = 1 });
                childMenus.Add(new Menu { Title = "Weekly Summary", Code = "RPT_WEEKLY", Url = "/reports/weekly", ParentId = reports.Id, Order = 2 });
                childMenus.Add(new Menu { Title = "Monthly Summary", Code = "RPT_MONTHLY", Url = "/reports/monthly", ParentId = reports.Id, Order = 3 });

                // Billing Children
                childMenus.Add(new Menu { Title = "Invoices", Code = "BILL_INVOICES", Url = "/invoices", ParentId = billing.Id, Order = 1 });

                // Admin Children
                childMenus.Add(new Menu { Title = "Users", Code = "ADM_USERS", Url = "/users", ParentId = admin.Id, Order = 1 });
                childMenus.Add(new Menu { Title = "Roles", Code = "ADM_ROLES", Url = "/roles", ParentId = admin.Id, Order = 2 });
                childMenus.Add(new Menu { Title = "Permissions", Code = "ADM_PERMS", Url = "/permissions", ParentId = admin.Id, Order = 3 });
                childMenus.Add(new Menu { Title = "Menus", Code = "ADM_MENUS", Url = "/menus", ParentId = admin.Id, Order = 4 });

                context.Menus.AddRange(childMenus);
                await context.SaveChangesAsync();

                // Assign All to SuperAdmin
                if (superAdminRole != null)
                {
                    var allMenus = await context.Menus.ToListAsync();
                    var roleMenus = allMenus.Select(m => new RoleMenu
                    {
                        RoleId = superAdminRole.Id,
                        MenuId = m.Id
                    });
                    context.RoleMenus.AddRange(roleMenus);
                    await context.SaveChangesAsync();
                }
            }
        }

        private static string HashPassword(string password)
        {
            using var sha256 = SHA256.Create();
            var bytes = sha256.ComputeHash(Encoding.UTF8.GetBytes(password));
            return Convert.ToBase64String(bytes);
        }
    }
}
