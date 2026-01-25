namespace Noltrion.Framework.Shared.Settings
{
    public class JwtSettings
    {
        public string Key { get; set; } = string.Empty;
        public string Issuer { get; set; } = string.Empty;
        public string Audience { get; set; } = string.Empty;
        public double DurationInMinutes { get; set; } = 60;
        public int RefreshTokenExpirationInDays { get; set; } = 7;
    }
}
