using Microsoft.AspNetCore.Mvc;
using System;
using System.IO;
using System.Threading.Tasks;

namespace WebApplication1.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class DebugController : ControllerBase
    {
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