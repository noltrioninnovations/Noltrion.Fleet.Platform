using System;

namespace Noltrion.FleetX.Application.Interfaces
{
    public interface ICostService
    {
        decimal CalculateTripCost(double distanceKm, double weightKg);
    }
}
