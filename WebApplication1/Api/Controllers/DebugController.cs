using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.IO;
using System.Threading.Tasks;
using WebApplication1.Api.Data;

namespace WebApplication1.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class DebugController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public DebugController(ApplicationDbContext context)
        {
            _context = context;
        }
        [HttpGet("test")]
        public IActionResult Test()
        {
            return Ok(new { message = "API çalışıyor!", time = DateTime.Now });
        }

        [HttpGet("paths")]
        public IActionResult GetPaths()
        {
            var contentRoot = Directory.GetCurrentDirectory();
            var buildPath = Path.Combine(contentRoot, "ClientApp", "build");
            var indexPath = Path.Combine(buildPath, "index.html");
            
            return Ok(new
            {
                contentRoot,
                buildPath,
                indexPath,
                indexExists = System.IO.File.Exists(indexPath),
                buildExists = Directory.Exists(buildPath)
            });
        }

        [HttpGet("index-content")]
        public async Task<IActionResult> GetIndexContent()
        {
            var contentRoot = Directory.GetCurrentDirectory();
            var buildPath = Path.Combine(contentRoot, "ClientApp", "build");
            var indexPath = Path.Combine(buildPath, "index.html");
            
            if (System.IO.File.Exists(indexPath))
            {
                var content = await System.IO.File.ReadAllTextAsync(indexPath);
                return Ok(new { 
                    exists = true, 
                    content = content,
                    length = content.Length 
                });
            }
            
            return Ok(new { exists = false });
        }

        [HttpGet("serve-index")]
        public async Task<IActionResult> ServeIndex()
        {
            var contentRoot = Directory.GetCurrentDirectory();
            var buildPath = Path.Combine(contentRoot, "ClientApp", "build");
            var indexPath = Path.Combine(buildPath, "index.html");
            
            if (System.IO.File.Exists(indexPath))
            {
                var content = await System.IO.File.ReadAllTextAsync(indexPath);
                return Content(content, "text/html");
            }
            
            return NotFound("index.html bulunamadı");
        }

        [HttpGet("users")]
        public async Task<IActionResult> GetUsers()
        {
            try
            {
                var users = await _context.Users.Select(u => new {
                    u.Id,
                    u.Name,
                    u.Email,
                    u.Role,
                    u.CreatedAt
                }).ToListAsync();
                
                return Ok(users);
            }
            catch (Exception ex)
            {
                return BadRequest($"Hata: {ex.Message}");
            }
        }

        [HttpGet("therapists-with-users")]
        public async Task<IActionResult> GetTherapistsWithUsers()
        {
            try
            {
                var therapists = await _context.Therapists
                    .Include(t => t.User)
                    .Select(t => new {
                        t.Id,
                        t.Name,
                        t.Bio,
                        t.UserId,
                        User = t.User != null ? new { t.User.Id, t.User.Name, t.User.Email, t.User.Role } : null
                    }).ToListAsync();
                
                return Ok(therapists);
            }
            catch (Exception ex)
            {
                return BadRequest($"Hata: {ex.Message}");
            }
        }

        [HttpPost("fix-therapist-user-connection")]
        public async Task<IActionResult> FixTherapistUserConnection()
        {
            try
            {
                // Find therapist users who don't have a therapist profile connection
                var therapistUsers = await _context.Users
                    .Where(u => u.Role == Models.UserRole.Therapist)
                    .ToListAsync();

                foreach (var user in therapistUsers)
                {
                    var existingTherapist = await _context.Therapists
                        .FirstOrDefaultAsync(t => t.UserId == user.Id);

                    if (existingTherapist == null)
                    {
                        // Find therapist by name match
                        var therapistByName = await _context.Therapists
                            .FirstOrDefaultAsync(t => t.Name.Contains(user.Name) && t.UserId == null);

                        if (therapistByName != null)
                        {
                            therapistByName.UserId = user.Id;
                            therapistByName.Name = $"{user.Name} {user.Surname}";
                        }
                    }
                }

                await _context.SaveChangesAsync();
                return Ok(new { message = "Terapist-User bağlantıları düzeltildi!" });
            }
            catch (Exception ex)
            {
                return BadRequest($"Hata: {ex.Message}");
            }
        }

        [HttpPost("fix-roles")]
        public async Task<IActionResult> FixRoles()
        {
            try
            {
                // Fix Altyngul as Therapist
                var altyngul = await _context.Users.FirstOrDefaultAsync(u => u.Email == "altyngul@therapist.lor-masaj.com");
                if (altyngul != null)
                {
                    altyngul.Role = Models.UserRole.Therapist;
                }

                // Fix Admin
                var admin = await _context.Users.FirstOrDefaultAsync(u => u.Email == "admin@lor-masaj.com");
                if (admin != null)
                {
                    admin.Role = Models.UserRole.Admin;
                }

                // Fix therapist-user connection
                var therapist = await _context.Therapists.FirstOrDefaultAsync(t => t.Name == "Altyngul Bolatbek");
                if (therapist != null && altyngul != null)
                {
                    therapist.UserId = altyngul.Id;
                    therapist.Name = $"{altyngul.Name} {altyngul.Surname}";
                }

                await _context.SaveChangesAsync();
                
                // Log the results for debugging
                var resultAltyngul = await _context.Users.FirstOrDefaultAsync(u => u.Email == "altyngul@therapist.lor-masaj.com");
                var resultTherapist = await _context.Therapists.FirstOrDefaultAsync(t => t.UserId == altyngul.Id);
                
                return Ok(new { 
                    message = "Roller ve bağlantılar düzeltildi!",
                    altyngulRole = resultAltyngul?.Role.ToString(),
                    therapistUserId = resultTherapist?.UserId,
                    altyngulId = altyngul?.Id
                });
            }
            catch (Exception ex)
            {
                return BadRequest($"Hata: {ex.Message}");
            }
        }

        [HttpPost("reset-therapist-password")]
        public async Task<IActionResult> ResetTherapistPassword()
        {
            try
            {
                var altyngul = await _context.Users.FirstOrDefaultAsync(u => u.Email == "altyngul@therapist.lor-masaj.com");
                if (altyngul != null)
                {
                    // Simple password hash for testing - same logic as AuthService
                    using var sha256 = System.Security.Cryptography.SHA256.Create();
                    var hashedBytes = sha256.ComputeHash(System.Text.Encoding.UTF8.GetBytes("123456" + "LOR_SALT_2024"));
                    altyngul.PasswordHash = Convert.ToBase64String(hashedBytes);
                    
                    await _context.SaveChangesAsync();
                    
                    return Ok(new { 
                        message = "Altyngul'un şifresi 123456 olarak sıfırlandı",
                        email = "altyngul@therapist.lor-masaj.com",
                        password = "123456",
                        role = "Therapist"
                    });
                }
                
                return BadRequest("Altyngul kullanıcısı bulunamadı");
            }
            catch (Exception ex)
            {
                return BadRequest($"Hata: {ex.Message}");
            }
        }

        [HttpPost("reset-admin-password")]
        public async Task<IActionResult> ResetAdminPassword()
        {
            try
            {
                var admin = await _context.Users.FirstOrDefaultAsync(u => u.Email == "admin@lor-masaj.com");
                if (admin != null)
                {
                    // Simple password hash for testing - same logic as AuthService
                    using var sha256 = System.Security.Cryptography.SHA256.Create();
                    var hashedBytes = sha256.ComputeHash(System.Text.Encoding.UTF8.GetBytes("123456" + "LOR_SALT_2024"));
                    admin.PasswordHash = Convert.ToBase64String(hashedBytes);
                    admin.Role = Models.UserRole.Admin; // Ensure admin role
                    
                    await _context.SaveChangesAsync();
                    
                    return Ok(new { 
                        message = "Admin şifresi 123456 olarak sıfırlandı",
                        email = "admin@lor-masaj.com",
                        password = "123456",
                        role = "Admin"
                    });
                }
                
                return BadRequest("Admin kullanıcısı bulunamadı");
            }
            catch (Exception ex)
            {
                return BadRequest($"Hata: {ex.Message}");
            }
        }

        [HttpGet("clear-cache-info")]
        public IActionResult GetClearCacheInfo()
        {
            return Ok(new { 
                message = "Browser cache'ini temizlemek için:",
                steps = new string[]
                {
                    "1. F12 ile Developer Tools'u açın",
                    "2. Network tab'ına gidin", 
                    "3. 'Disable cache' kutusunu işaretleyin",
                    "4. Sayfayı yenileyin (F5)",
                    "5. Veya localStorage'ı temizleyin: localStorage.clear()"
                },
                currentUsers = "Admin: admin@lor-masaj.com, Terapist: altyngul@therapist.lor-masaj.com, Şifre: 123456"
            });
        }

        [HttpPost("create-admin")]
        public IActionResult CreateAdmin()
        {
            try
            {
                return Ok(new { 
                    message = "Admin endpoint devre dışı - Frontend üzerinden admin hesabı oluşturun",
                    email = "admin@lor-masaj.com",
                    password = "Admin123!",
                    instructions = "1. /auth sayfasına gidin, 2. Kayıt ol sekmesine tıklayın, 3. Bu bilgilerle kayıt olun"
                });
            }
            catch (Exception ex)
            {
                return BadRequest($"Hata: {ex.Message}");
            }
        }
    }
} 