using System;

namespace Noltrion.FleetX.Application.Interfaces
{
    public interface IEtaService
    {
        TimeSpan CalculateEta(double distanceKm);
    }
}
