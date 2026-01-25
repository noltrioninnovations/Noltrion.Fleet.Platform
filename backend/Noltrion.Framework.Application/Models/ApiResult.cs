using System.Collections.Generic;

namespace Noltrion.Framework.Application.Models
{
    public class ApiResult<T>
    {
        public bool Success { get; set; }
        public T? Data { get; set; }
        public List<string> Errors { get; set; } = new();
        public object? Meta { get; set; }

        public static ApiResult<T> Ok(T data, object? meta = null)
        {
            return new ApiResult<T> { Success = true, Data = data, Meta = meta };
        }

        public static ApiResult<T> Failure(List<string> errors)
        {
            return new ApiResult<T> { Success = false, Errors = errors };
        }
        
        public static ApiResult<T> Failure(string error)
        {
            return new ApiResult<T> { Success = false, Errors = new List<string> { error } };
        }
    }
}
