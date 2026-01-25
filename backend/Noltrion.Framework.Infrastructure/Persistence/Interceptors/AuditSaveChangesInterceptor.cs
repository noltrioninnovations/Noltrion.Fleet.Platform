using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Diagnostics;
using Noltrion.Framework.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;

namespace Noltrion.Framework.Infrastructure.Persistence.Interceptors
{
    public class AuditSaveChangesInterceptor : SaveChangesInterceptor
    {
        private readonly Noltrion.Framework.Application.Interfaces.ICurrentUserService _currentUserService;

        public AuditSaveChangesInterceptor(Noltrion.Framework.Application.Interfaces.ICurrentUserService currentUserService)
        {
            _currentUserService = currentUserService;
        }

        public override async ValueTask<InterceptionResult<int>> SavingChangesAsync(
            DbContextEventData eventData, 
            InterceptionResult<int> result, 
            CancellationToken cancellationToken = default)
        {
            var auditEntries = OnBeforeSaveChanges(eventData.Context);
            var saveResult = await base.SavingChangesAsync(eventData, result, cancellationToken);
            
            if (eventData.Context != null && auditEntries.Count > 0)
            {
                // After save, update temporary PKs with generated ones if possible?
                // For GUIDs, they are already set.
                // For Identity int columns, we would need to visit auditEntries and update PrimaryKey.
                // But for now we assume GUIDs.
            }
            
            return saveResult;
        }

        private List<AuditLog> OnBeforeSaveChanges(DbContext? context)
        {
            if (context == null) return new List<AuditLog>();
            
            context.ChangeTracker.DetectChanges();
            var auditEntries = new List<AuditLog>();
            
            foreach (var entry in context.ChangeTracker.Entries())
            {
                if (entry.Entity is AuditLog || entry.State == EntityState.Detached || entry.State == EntityState.Unchanged)
                    continue;

                var auditEntry = new AuditLog
                {
                    EntityName = entry.Entity.GetType().Name,
                    Timestamp = DateTime.UtcNow,
                    Action = entry.State.ToString(),
                    UserId = _currentUserService.UserId?.ToString() ?? "Anonymous"
                };
                
                // Get Primary Key
                // Assuming "Id" property exists and is the key
                var idProperty = entry.Properties.FirstOrDefault(p => p.Metadata.IsPrimaryKey());
                if (idProperty != null && idProperty.CurrentValue != null)
                {
                    auditEntry.PrimaryKey = idProperty.CurrentValue.ToString()!;
                }
                else
                {
                    auditEntry.PrimaryKey = "Unknown"; // New entity might not have ID if Identity Column
                }

                var oldValues = new Dictionary<string, object>();
                var newValues = new Dictionary<string, object>();

                foreach (var property in entry.Properties)
                {
                    if (property.IsTemporary) continue;
                    
                    string propertyName = property.Metadata.Name;
                    
                    switch (entry.State)
                    {
                        case EntityState.Added:
                            newValues[propertyName] = property.CurrentValue!;
                            break;

                        case EntityState.Deleted:
                            oldValues[propertyName] = property.OriginalValue!;
                            break;

                        case EntityState.Modified:
                            if (property.IsModified)
                            {
                                oldValues[propertyName] = property.OriginalValue!;
                                newValues[propertyName] = property.CurrentValue!;
                            }
                            break;
                    }
                }

                if (oldValues.Count > 0)
                    auditEntry.OldValues = JsonSerializer.Serialize(oldValues);
                    
                if (newValues.Count > 0)
                    auditEntry.NewValues = JsonSerializer.Serialize(newValues);

                auditEntries.Add(auditEntry);
            }

            // Add all valid audit entries to context
            foreach (var auditEntry in auditEntries)
            {
                context.Add(auditEntry);
            }
            
            return auditEntries;
        }
    }
}
