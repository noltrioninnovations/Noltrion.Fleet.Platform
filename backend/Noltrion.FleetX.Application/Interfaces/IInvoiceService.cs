using System.Threading.Tasks;
using Noltrion.Framework.Application.Models;
using Noltrion.FleetX.Application.DTOs.Web;

namespace Noltrion.FleetX.Application.Interfaces
{
    public interface IInvoiceService
    {
        Task<List<InvoiceDto>> GetAllAsync();
        Task<ApiResult<InvoiceDto>> GetByTripIdAsync(string tripId);
        Task<ApiResult<InvoiceDto>> GenerateForTripAsync(string tripId);
        Task<ApiResult<bool>> UpdateStatusAsync(string id, string status);
        Task<ApiResult<bool>> UpdateAsync(InvoiceDto dto);
    }
}
