using WebApplication1.Api.Data;
using WebApplication1.Api.Services;
using Microsoft.EntityFrameworkCore;

// Türkiye saat dilimini ayarla
AppContext.SetSwitch("System.Globalization.InvariantGlobalization", false);

var builder = WebApplication.CreateBuilder(args);

// DbContext servisini ekle
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

// Notification Services ekle
builder.Services.AddScoped<IEmailService, EmailService>();
builder.Services.AddScoped<ISmsService, SmsService>();
builder.Services.AddScoped<INotificationService, NotificationService>();

// Auth Service ekle
builder.Services.AddScoped<IAuthService, AuthService>();

// Controller servislerini ekle
builder.Services.AddControllers();

// CORS ekle
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

var app = builder.Build();

// React build klasörü
var buildPath = Path.Combine(app.Environment.ContentRootPath, "ClientApp", "build");

// CORS middleware ekle
app.UseCors("AllowAll");

// Önce default static files (wwwroot)
app.UseStaticFiles();

// Sonra React build klasörünü root'ta serve et
app.UseStaticFiles(new StaticFileOptions
{
    FileProvider = new Microsoft.Extensions.FileProviders.PhysicalFileProvider(buildPath),
    RequestPath = "",
    ServeUnknownFileTypes = false
});

// Routing ekle
app.UseRouting();

// API endpoints
app.MapControllers();

// SPA fallback - sadece HTML istekleri için
app.MapFallback(context =>
{
    // API isteklerini hariç tut
    if (context.Request.Path.StartsWithSegments("/api"))
    {
        context.Response.StatusCode = 404;
        return Task.CompletedTask;
    }

    // Static dosya isteklerini hariç tut
    var path = context.Request.Path.Value?.ToLower();
    if (path != null && (path.Contains(".js") || path.Contains(".css") || 
                        path.Contains(".ico") || path.Contains(".png") || 
                        path.Contains(".jpg") || path.Contains(".svg")))
    {
        context.Response.StatusCode = 404;
        return Task.CompletedTask;
    }

    // index.html'i serve et
    var indexPath = Path.Combine(buildPath, "index.html");
    context.Response.ContentType = "text/html";
    return context.Response.SendFileAsync(indexPath);
});

app.Run();
