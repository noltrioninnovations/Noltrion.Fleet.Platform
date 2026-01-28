using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Noltrion.FleetX.Application.Interfaces;
using Noltrion.FleetX.Application.Services;
using Noltrion.FleetX.Infrastructure.Persistence;
using Noltrion.Framework.Application.Interfaces;
// using Noltrion.Framework.Infrastructure.Services; // Will create token service here
using Noltrion.Framework.Domain;
using Noltrion.Framework.Infrastructure.Persistence;
using Noltrion.Framework.Shared.Settings;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers()
    .AddApplicationPart(typeof(Noltrion.Framework.API.Controllers.AuthController).Assembly)
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.ReferenceHandler = System.Text.Json.Serialization.ReferenceHandler.IgnoreCycles;
    });

// DB Config
// DB Config
builder.Services.AddScoped<Noltrion.Framework.Infrastructure.Persistence.Interceptors.AuditSaveChangesInterceptor>();

builder.Services.AddDbContext<FleetXDbContext>((sp, options) => {
    var interceptor = sp.GetService<Noltrion.Framework.Infrastructure.Persistence.Interceptors.AuditSaveChangesInterceptor>();
    var dbProvider = builder.Configuration["DBProvider"];
    System.Console.WriteLine($"[DEBUG] Loaded DBProvider: '{dbProvider}'");
    
        if (dbProvider == "PostgreSQL")
        {
            AppContext.SetSwitch("Npgsql.EnableLegacyTimestampBehavior", true);
            options.UseNpgsql(builder.Configuration.GetConnectionString("PostgreSqlConnection"));
                   //.AddInterceptors(interceptor);
        }
        else
        {
            options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection"));
                   //.AddInterceptors(interceptor);
        }
});

// Repositories & UoW
builder.Services.AddScoped<DbContext>(provider => provider.GetService<FleetXDbContext>());
builder.Services.AddScoped(typeof(IRepository<>), typeof(Repository<>));
builder.Services.AddScoped<IUnitOfWork, UnitOfWork>();

// Application Services
builder.Services.AddScoped<IVehicleService, VehicleService>();
builder.Services.AddScoped<IDriverService, DriverService>();
builder.Services.AddScoped<Noltrion.FleetX.Infrastructure.Services.Security.IMenuService, Noltrion.FleetX.Infrastructure.Services.Security.MenuService>();
builder.Services.AddScoped<Noltrion.FleetX.Infrastructure.Services.Security.IPermissionService, Noltrion.FleetX.Infrastructure.Services.Security.PermissionService>();
builder.Services.AddScoped<ICustomerService, Noltrion.FleetX.Infrastructure.Services.Web.CustomerService>();
builder.Services.AddScoped<ITripService, Noltrion.FleetX.Infrastructure.Services.Web.TripService>();
builder.Services.AddScoped<IOrganizationService, Noltrion.FleetX.Infrastructure.Services.Web.OrganizationService>();
builder.Services.AddScoped<IInvoiceService, Noltrion.FleetX.Infrastructure.Services.Web.InvoiceService>();
builder.Services.AddScoped<IJobService, Noltrion.FleetX.Infrastructure.Services.Web.JobService>();
builder.Services.AddScoped<IJobRequestService, Noltrion.FleetX.Infrastructure.Services.Web.JobRequestService>();

// Auth Services
// Auth Services
builder.Services.Configure<JwtSettings>(builder.Configuration.GetSection("JwtSettings"));
builder.Services.AddScoped<IAuthService, Noltrion.Framework.Infrastructure.Services.AuthService>();
builder.Services.AddScoped<ITokenService, Noltrion.Framework.Infrastructure.Services.TokenService>();

builder.Services.AddScoped<ICurrentUserService, Noltrion.Framework.Infrastructure.Services.CurrentUserService>();
builder.Services.AddScoped<IUserService, Noltrion.Framework.Infrastructure.Services.UserService>();
builder.Services.AddTransient<IEmailService, Noltrion.Framework.Infrastructure.Services.EmailService>();
builder.Services.AddHttpContextAccessor();

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = Microsoft.AspNetCore.Authentication.JwtBearer.JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = Microsoft.AspNetCore.Authentication.JwtBearer.JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(o =>
{
    o.RequireHttpsMetadata = false;
    o.SaveToken = false;
    o.TokenValidationParameters = new Microsoft.IdentityModel.Tokens.TokenValidationParameters
    {
        ValidateIssuerSigningKey = true,
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ClockSkew = System.TimeSpan.Zero,
        ValidIssuer = builder.Configuration["JwtSettings:Issuer"],
        ValidAudience = builder.Configuration["JwtSettings:Audience"],
        IssuerSigningKey = new Microsoft.IdentityModel.Tokens.SymmetricSecurityKey(System.Text.Encoding.UTF8.GetBytes(builder.Configuration["JwtSettings:Key"]))
    };
});

// API Versioning (Disabled for now)
// builder.Services.AddApiVersioning(...);

// Swagger/OpenAPI
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
    options.CustomSchemaIds(type => type.ToString());
});

// CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend",
        policy =>
        {
            policy.WithOrigins("http://localhost:5173", "http://localhost:3000") // Allow Vite and CRA defaults
                  .AllowAnyHeader()
                  .AllowAnyMethod()
                  .AllowCredentials();
        });
});

var app = builder.Build();

// Configure the HTTP request pipeline.
    app.UseSwagger();
    app.UseSwaggerUI();

app.UseCors("AllowFrontend");

app.UseHttpsRedirection();

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();
app.MapGet("/", context =>
{
    context.Response.Redirect("/swagger/index.html");
    return System.Threading.Tasks.Task.CompletedTask;
});

// Seed Database
using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    try
    {
        var context = services.GetRequiredService<FleetXDbContext>();
        context.Database.Migrate(); // Use Migrate instead of EnsureCreated in production
        if (app.Environment.IsDevelopment())
        {
            await Noltrion.Framework.Infrastructure.Persistence.DbInitializer.SeedAsync(context);
            await Noltrion.FleetX.Infrastructure.Persistence.FleetXSeeder.SeedAsync(context);
        }
    }
    catch (System.Exception ex)
    {
        // Log error
        System.Console.WriteLine("An error occurred seeding the DB: " + ex.Message);
    }
}

app.Run();
