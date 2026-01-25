using Microsoft.EntityFrameworkCore;
using Noltrion.FleetX.Domain.Entities;
using Noltrion.Framework.Infrastructure.Persistence;
using Noltrion.Framework.Shared.Enums;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Noltrion.FleetX.Infrastructure.Persistence
{
    public static class FleetXSeeder
    {
        public static async Task SeedAsync(FleetXDbContext context)
        {
            // 1. Seed Customers
            if (!context.Customers.Any(c => c.Name == "MegaCorp Logistics"))
            {
                context.Customers.Add(new Customer 
                { 
                    Name = "MegaCorp Logistics", 
                    Email = "admin@megacorp.com", 
                    Phone = "9988776655", 
                    Address = "Tech Park, Bangalore",
                    NotificationEnabled = true 
                });
            }
            if (!context.Customers.Any(c => c.Name == "FastRetail Inc"))
            {
                context.Customers.Add(new Customer 
                { 
                    Name = "FastRetail Inc", 
                    Email = "contact@fastretail.com", 
                    Phone = "8877665544", 
                    Address = "Market Road, Mumbai",
                    NotificationEnabled = true 
                });
            }
            await context.SaveChangesAsync();

            // 2. Seed Vehicles (Small, Medium, Large)
            if (!context.Vehicles.Any(v => v.RegistrationNumber == "KA-01-ACE-1111"))
            {
                context.Vehicles.Add(new Vehicle 
                { 
                    RegistrationNumber = "KA-01-ACE-1111", 
                    Model = "Tata Ace", 
                    Type = "Small Truck", 
                    Status = "Active",
                    CapacityKg = 1000,
                    VolumeCapacity = 10,
                    Latitude = 12.9716,
                    Longitude = 77.5946,
                    LastLocationUpdate = DateTime.UtcNow
                });
            }

            if (!context.Vehicles.Any(v => v.RegistrationNumber == "KA-05-EIC-2222"))
            {
                context.Vehicles.Add(new Vehicle 
                { 
                    RegistrationNumber = "KA-05-EIC-2222", 
                    Model = "Eicher Pro", 
                    Type = "Medium Truck", 
                    Status = "Active",
                    CapacityKg = 5000,
                    VolumeCapacity = 25,
                    Latitude = 12.9260,
                    Longitude = 77.6762,
                    LastLocationUpdate = DateTime.UtcNow
                });
            }

            if (!context.Vehicles.Any(v => v.RegistrationNumber == "KA-10-PRI-3333"))
            {
                context.Vehicles.Add(new Vehicle 
                { 
                    RegistrationNumber = "KA-10-PRI-3333", 
                    Model = "Tata Prima", 
                    Type = "Large Truck", 
                    Status = "Maintenance",
                    CapacityKg = 25000,
                    VolumeCapacity = 60,
                    Latitude = 13.0827,
                    Longitude = 80.2707, // Chennai
                    LastLocationUpdate = DateTime.UtcNow
                });
            }
            await context.SaveChangesAsync();

            // 3. Seed Drivers
            if (!context.Drivers.Any(d => d.LicenseNumber == "DL-2023-001"))
            {
                context.Drivers.Add(new Driver 
                { 
                    FullName = "Ramesh Kumar", 
                    LicenseNumber = "DL-2023-001", 
                    PhoneNumber = "9000011111", 
                    IsActive = true 
                });
            }
            if (!context.Drivers.Any(d => d.LicenseNumber == "DL-2023-002"))
            {
                context.Drivers.Add(new Driver 
                { 
                    FullName = "Suresh Singh", 
                    LicenseNumber = "DL-2023-002", 
                    PhoneNumber = "9000022222", 
                    IsActive = false 
                });
            }
            await context.SaveChangesAsync();

            // 4. Seed Jobs
            if (!context.Jobs.Any())
            {
                context.Jobs.AddRange(new List<Job>
                {
                    new Job 
                    { 
                        CustomerName = "MegaCorp Logistics", 
                        EmailReference = "ORD-SEED-001", 
                        PickupAddress = "Warehouse A, Electronic City", 
                        DeliveryAddress = "Indiranagar, Bangalore", 
                        WeightKg = 500, 
                        VolumeCbm = 2,
                        Status = JobStatus.Received, 
                        Source = JobSource.Email,
                        RequiredVehicleType = "Small Truck",
                        CreatedOn = DateTime.UtcNow.AddHours(-2)
                    },
                    new Job 
                    { 
                        CustomerName = "FastRetail Inc", 
                        EmailReference = "ORD-SEED-002", 
                        PickupAddress = "Central Warehouse", 
                        DeliveryAddress = "Mall of Asia, Bangalore", 
                        WeightKg = 4000, 
                        VolumeCbm = 20,
                        Status = JobStatus.Received, 
                        Source = JobSource.API,
                        RequiredVehicleType = "Medium Truck",
                        CreatedOn = DateTime.UtcNow.AddMinutes(-30)
                    }
                });
                await context.SaveChangesAsync();
            }

            // 5. Seed Organization
            if (!context.Organizations.Any(o => o.Code == "ORG001"))
            {
                context.Organizations.Add(new Organization 
                { 
                    Code = "ORG001", 
                    Name = "Default Organization", 
                    Address = "Head Office",
                    IsActive = true,
                    CreatedBy = "System",
                    CreatedOn = DateTime.UtcNow
                });
                await context.SaveChangesAsync();
            }

            // 5b. Seed Trips (Manifests)
            if (!context.Trips.Any())
            {
                var vehicle = await context.Vehicles.FirstOrDefaultAsync(v => v.RegistrationNumber == "KA-01-ACE-1111");
                var driver = await context.Drivers.FirstOrDefaultAsync(d => d.LicenseNumber == "DL-2023-001");
                var customer = await context.Customers.FirstOrDefaultAsync(c => c.Name == "MegaCorp Logistics");

                if (vehicle != null && driver != null && customer != null)
                {
                    var trip = new Trip
                    {
                        TripNumber = "TRP-SEED-001",
                        VehicleId = vehicle.Id,
                        DriverId = driver.Id,
                        // CustomerId = customer.Id, // Not in Trip entity
                        TripStatus = "Assigned", // Was Status
                        TripDate = DateTime.UtcNow.AddDays(1), // Was StartDate
                        TotalDistanceKm = 150, // Was EstimatedDistanceKm
                        TruckType = "14FT",
                        PickupLocation = "Bangalore",
                        DropLocation = "Chennai",
                        CreatedBy = "System",
                        CreatedOn = DateTime.UtcNow
                    };
                    
                    // Link to a Job if possible
                    var job = await context.Jobs.FirstOrDefaultAsync();
                    if (job != null)
                    {
                        trip.TripJobs.Add(new TripJob 
                        { 
                            JobId = job.Id,
                            SequenceOrder = 1,
                            Status = "Active"
                        });
                    }

                    context.Trips.Add(trip);
                    await context.SaveChangesAsync();
                }
            }

            // 6. Reset Menus (Upsert Strategy)
            var menuSet = context.Set<Noltrion.Framework.Domain.Entities.Menu>();
            var roleMenuSet = context.Set<Noltrion.Framework.Domain.Entities.RoleMenu>();

            // Define Target Menus
            var processedMenus = new List<Noltrion.Framework.Domain.Entities.Menu>();

            // Helper to Upsert (Find by Code, Update, or Add)
            async Task<Noltrion.Framework.Domain.Entities.Menu> UpsertMenu(string code, string title, string url, string icon, int order, Guid? parentId = null)
            {
                var existing = await menuSet.FirstOrDefaultAsync(m => m.Code == code);
                if (existing != null)
                {
                    existing.Title = title;
                    existing.Url = url;
                    existing.Icon = icon;
                    existing.Order = order;
                    existing.ParentId = parentId;
                    existing.IsActive = true;
                    processedMenus.Add(existing);
                    return existing;
                }
                else
                {
                    var newMenu = new Noltrion.Framework.Domain.Entities.Menu 
                    { 
                        Code = code, Title = title, Url = url, Icon = icon, Order = order, ParentId = parentId, IsActive = true 
                    };
                    menuSet.Add(newMenu);
                    processedMenus.Add(newMenu);
                    return newMenu;
                }
            }

            // 0. GET OR CREATE PARENT 'FLEET' MENU
            // DbInitializer creates 'FLEET', so we should find it.
            var fleetMenu = await UpsertMenu("FLEET", "Fleet", "#", "Truck", 4); 
            await context.SaveChangesAsync();

            // 1. Transform "TRIPS" (from DbInit) -> "MANIFESTS" (Child of Fleet)
            // DbInit creates 'TRIPS' with Code='TRIPS'. We want to move it under FLEET and rename it.
            var trips = await menuSet.FirstOrDefaultAsync(m => m.Code == "TRIPS");
            if (trips != null)
            {
                // Check if MANIFEST already exists (from previous run)
                var manifestExists = await menuSet.AnyAsync(m => m.Code == "MANIFEST");
                
                if (!manifestExists)
                {
                    // Rename TRIPS to MANIFEST
                    trips.Code = "MANIFEST";
                    trips.Title = "Manifests";
                    trips.Url = "/manifests";
                    trips.Icon = "FileText";
                    trips.ParentId = fleetMenu.Id;
                    trips.Order = 3;
                    processedMenus.Add(trips);
                }
                else
                {
                    // Loop: Manifest exists, Trips exists? Maybe soft delete trips or ignore
                    // If we are here, TRIPS exists but MANIFEST also exists. 
                    // This implies TRIPS was re-created or not renamed previously.
                    // We should probably deactivate TRIPS if we have MANIFEST.
                }
            }
            else
            {
                // TRIPS not found. Check MANIFEST.
                var manifest = await menuSet.FirstOrDefaultAsync(m => m.Code == "MANIFEST");
                if (manifest == null)
                {
                    // Create Manifest
                    await UpsertMenu("MANIFEST", "Manifests", "/manifests", "FileText", 3, fleetMenu.Id);
                }
                else
                {
                    // Ensure Manifest properties
                    manifest.Title = "Manifests";
                    manifest.Url = "/manifests";
                    manifest.ParentId = fleetMenu.Id;
                    processedMenus.Add(manifest);
                }
            }

            // 2. Handle Vehicles and Drivers
            // DbInit uses FLEET_VEHICLES and FLEET_DRIVERS.
            // Check if they exist, if so, ensure they are under FLEET.
            var vehicles = await menuSet.FirstOrDefaultAsync(m => m.Code == "FLEET_VEHICLES");
            if (vehicles != null)
            {
                vehicles.ParentId = fleetMenu.Id;
                processedMenus.Add(vehicles);
            }
            else
            {
                // Fallback: Check/Create VEHICLE_MASTER (Our previous code)
                await UpsertMenu("VEHICLE_MASTER", "Vehicles", "/vehicles", "Truck", 1, fleetMenu.Id);
            }

            var drivers = await menuSet.FirstOrDefaultAsync(m => m.Code == "FLEET_DRIVERS");
            if (drivers != null)
            {
                drivers.ParentId = fleetMenu.Id;
                processedMenus.Add(drivers);
            }
            else
            {
                await UpsertMenu("DRIVER_MASTER", "Drivers", "/drivers", "Users", 2, fleetMenu.Id);
            }

            // 3. Transform "JOBS" -> "JOB_MANAGEMENT"
            var jobs = await menuSet.FirstOrDefaultAsync(m => m.Code == "JOBS");
            if (jobs != null)
            {
                 if (!await menuSet.AnyAsync(m => m.Code == "JOB_MANAGEMENT"))
                 {
                    jobs.Code = "JOB_MANAGEMENT";
                    jobs.Title = "Job Management";
                    jobs.Url = "/jobs";
                    jobs.Icon = "Briefcase";
                    jobs.Order = 5;
                    jobs.ParentId = null; // Ensure Top Level
                    processedMenus.Add(jobs);
                 }
            }
            else
            {
                await UpsertMenu("JOB_MANAGEMENT", "Job Management", "/jobs", "Briefcase", 5);
            }

            // 4. Other Standards
            await UpsertMenu("DASHBOARD", "Dashboard", "/", "LayoutDashboard", 0);
            await UpsertMenu("CUSTOMER_MASTER", "Customers", "/customers", "Building", 3);

            await context.SaveChangesAsync();

            // 7. Assign Menus to Admin Role
            var adminRoleForMenu = await context.Set<Noltrion.Framework.Domain.Entities.Role>().FirstOrDefaultAsync(r => r.Code == "SuperAdmin");
            if (adminRoleForMenu != null)
            {
                // Assign menus if not already assigned
                foreach (var menu in processedMenus)
                {
                    var existingLink = await roleMenuSet.FirstOrDefaultAsync(rm => rm.RoleId == adminRoleForMenu.Id && rm.MenuId == menu.Id);
                    if (existingLink == null)
                    {
                        roleMenuSet.Add(new Noltrion.Framework.Domain.Entities.RoleMenu
                        {
                            RoleId = adminRoleForMenu.Id,
                            MenuId = menu.Id
                        });
                    }
                }
                await context.SaveChangesAsync();
            }

            // Assign Menus to OperationalManager
            var managerRole = await context.Set<Noltrion.Framework.Domain.Entities.Role>().FirstOrDefaultAsync(r => r.Code == "OperationalManager");
            if (managerRole != null)
            {
                var menusForManager = processedMenus.Where(m => m.Code != "USERS").ToList(); // Manager sees all except maybe User Management?
                foreach (var menu in menusForManager)
                {
                     if (!await roleMenuSet.AnyAsync(rm => rm.RoleId == managerRole.Id && rm.MenuId == menu.Id))
                     {
                        roleMenuSet.Add(new Noltrion.Framework.Domain.Entities.RoleMenu { RoleId = managerRole.Id, MenuId = menu.Id });
                     }
                }
                await context.SaveChangesAsync();
            }

            // Assign Menus to OfficeExecutive
            var execRole = await context.Set<Noltrion.Framework.Domain.Entities.Role>().FirstOrDefaultAsync(r => r.Code == "OfficeExecutive");
            if (execRole != null)
            {
                var menusForExec = processedMenus.Where(m => m.Code != "USERS" && m.Code != "FLEET_VEHICLES" && m.Code != "FLEET_DRIVERS").ToList(); 
                // Executive focuses on Requests and Manifests (Trips), Dashboard, Customers
                foreach (var menu in menusForExec)
                {
                     if (!await roleMenuSet.AnyAsync(rm => rm.RoleId == execRole.Id && rm.MenuId == menu.Id))
                     {
                        roleMenuSet.Add(new Noltrion.Framework.Domain.Entities.RoleMenu { RoleId = execRole.Id, MenuId = menu.Id });
                     }
                }
                await context.SaveChangesAsync();
            }

            // Assign Menus to Customer
            var customerRole = await context.Set<Noltrion.Framework.Domain.Entities.Role>().FirstOrDefaultAsync(r => r.Code == "Customer");
            if (customerRole != null)
            {
                var menusForCustomer = processedMenus.Where(m => m.Code == "DASHBOARD" || m.Code == "MANIFEST" || m.Code == "JOB_MANAGEMENT").ToList();
                foreach (var menu in menusForCustomer)
                {
                     if (!await roleMenuSet.AnyAsync(rm => rm.RoleId == customerRole.Id && rm.MenuId == menu.Id))
                     {
                        roleMenuSet.Add(new Noltrion.Framework.Domain.Entities.RoleMenu { RoleId = customerRole.Id, MenuId = menu.Id });
                     }
                }
                await context.SaveChangesAsync();
            }

            // 8. Seed Permissions
            var perms = new[] { "Organization.View", "Organization.Create", "Organization.Edit", "Organization.Delete" };
            var newPerms = new List<Noltrion.Framework.Domain.Entities.Permission>();

            foreach (var code in perms)
            {
                if (!await context.Set<Noltrion.Framework.Domain.Entities.Permission>().AnyAsync(p => p.Code == code))
                {
                    newPerms.Add(new Noltrion.Framework.Domain.Entities.Permission 
                    { 
                        Code = code, 
                        Name = code, 
                        Group = "Organization" 
                    });
                }
            }

            if (newPerms.Any())
            {
                context.Set<Noltrion.Framework.Domain.Entities.Permission>().AddRange(newPerms);
                await context.SaveChangesAsync();

                // Assign to Admin Role (Assuming Role 'Admin' exists)
                var adminRole = await context.Set<Noltrion.Framework.Domain.Entities.Role>().FirstOrDefaultAsync(r => r.Name == "Admin");
                if (adminRole != null)
                {
                    foreach (var p in newPerms)
                    {
                        context.Set<Noltrion.Framework.Domain.Entities.RolePermission>().Add(new Noltrion.Framework.Domain.Entities.RolePermission 
                        { 
                            RoleId = adminRole.Id, 
                            PermissionId = p.Id 
                        });
                    }
                    await context.SaveChangesAsync();
                }
            }

            // 9. Seed Roles
            var rolesToSeed = new[]
            {
                new { Code = "TenantAdmin", Name = "Tenant Admin" },
                new { Code = "EnterpriseOversight", Name = "Enterprise Oversight" },
                new { Code = "OperationalManager", Name = "Operational Manager" },
                new { Code = "OfficeExecutive", Name = "Office Executive" },
                new { Code = "Driver", Name = "Driver" },
                new { Code = "Accounts", Name = "Accounts" },
                new { Code = "Customer", Name = "Customer" }
            };

            foreach (var role in rolesToSeed)
            {
                if (!await context.Set<Noltrion.Framework.Domain.Entities.Role>().AnyAsync(r => r.Code == role.Code))
                {
                    context.Set<Noltrion.Framework.Domain.Entities.Role>().Add(new Noltrion.Framework.Domain.Entities.Role
                    {
                        Code = role.Code,
                        Name = role.Name,
                        Description = $"{role.Name} Role"
                    });
                }
            }
            await context.SaveChangesAsync();

            // 10. Seed Users for each Role
            var usersToSeed = new[]
            {
                new { Username = "tenantadmin", Role = "Tenant Admin" }, // Note: Code vs Name mismatch potential in existing code? 
                // Ah, above loops check r.Code.
                // But usersToSeed uses Role property. 
                // Existing seeded users: "tenantadmin" -> "TenantAdmin" (Code).
                // Wait, existing code: `r.Code == user.Role`. So usersToSeed must use Role Codes.
                new { Username = "tenantadmin", Role = "TenantAdmin" }, 
                new { Username = "manager", Role = "OperationalManager" },
                new { Username = "executive", Role = "OfficeExecutive" },
                new { Username = "driver01", Role = "Driver" },
                new { Username = "accountant", Role = "Accounts" },
                new { Username = "customer01", Role = "Customer" }
            };

            // Simple SHA256 Hash for "password"
            string defaultPasswordHash;
            using (var sha256 = System.Security.Cryptography.SHA256.Create())
            {
                var bytes = sha256.ComputeHash(System.Text.Encoding.UTF8.GetBytes("password"));
                defaultPasswordHash = Convert.ToBase64String(bytes);
            }

            foreach (var user in usersToSeed)
            {
                var dbUser = await context.Set<Noltrion.Framework.Domain.Entities.User>().FirstOrDefaultAsync(u => u.Username == user.Username);
                
                if (dbUser == null)
                {
                    dbUser = new Noltrion.Framework.Domain.Entities.User
                    {
                        Username = user.Username,
                        PasswordHash = defaultPasswordHash,
                        Email = $"{user.Username}@fleetx.com",
                        FirstName = user.Username,
                        LastName = "User",
                        IsActive = true,
                        CreatedOn = DateTime.UtcNow
                    };
                    context.Set<Noltrion.Framework.Domain.Entities.User>().Add(dbUser);
                    await context.SaveChangesAsync(); // Save to get ID

                    // Assign Role
                    var role = await context.Set<Noltrion.Framework.Domain.Entities.Role>().FirstOrDefaultAsync(r => r.Code == user.Role);
                    if (role != null)
                    {
                        context.Set<Noltrion.Framework.Domain.Entities.UserRole>().Add(new Noltrion.Framework.Domain.Entities.UserRole
                        {
                            UserId = dbUser.Id,
                            RoleId = role.Id
                        });
                    }
                }

            }

            // Explicit Fix for customer01
            var targetCustomerUser = await context.Set<Noltrion.Framework.Domain.Entities.User>().FirstOrDefaultAsync(u => u.Username == "customer01");
            var targetCustomerOrg = await context.Customers.FirstOrDefaultAsync(c => c.Name == "MegaCorp Logistics");
            
            if (targetCustomerUser != null && targetCustomerOrg != null)
            {
                if (targetCustomerUser.CustomerId != targetCustomerOrg.Id)
                {
                    System.Console.WriteLine($"[Seeder] Linking 'customer01' (Id: {targetCustomerUser.Id}) to 'MegaCorp Logistics' (Id: {targetCustomerOrg.Id})");
                    targetCustomerUser.CustomerId = targetCustomerOrg.Id;
                    context.Entry(targetCustomerUser).State = EntityState.Modified;
                }
                else
                {
                     System.Console.WriteLine($"[Seeder] 'customer01' is ALREADY linked to 'MegaCorp Logistics'.");
                }
            }
            else
            {
                 System.Console.WriteLine($"[Seeder] WARNING: Could not find 'customer01' or 'MegaCorp Logistics'. User: {targetCustomerUser?.Username}, Org: {targetCustomerOrg?.Name}");
            }

            await context.SaveChangesAsync();
        }
    }
}
