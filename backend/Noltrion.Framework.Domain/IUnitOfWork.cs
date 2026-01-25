using System.Threading.Tasks;

namespace Noltrion.Framework.Domain
{
    public interface IUnitOfWork
    {
        Task<int> SaveChangesAsync();
        IRepository<T> Repository<T>() where T : BaseEntity;
    }
}
