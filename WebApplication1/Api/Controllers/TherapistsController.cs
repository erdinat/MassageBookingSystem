using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using WebApplication1.Api.Data;
using WebApplication1.Api.Models;

namespace WebApplication1.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class TherapistsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        public TherapistsController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<object>>> GetTherapists()
        {
            var therapists = await _context.Therapists
                .Select(t => new
                {
                    t.Id,
                    t.Name,
                    t.Bio,
                    t.ProfilePictureUrl
                })
                .ToListAsync();
            
            return Ok(therapists);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<object>> GetTherapist(int id)
        {
            var therapist = await _context.Therapists
                .Where(t => t.Id == id)
                .Select(t => new
                {
                    t.Id,
                    t.Name,
                    t.Bio,
                    t.ProfilePictureUrl
                })
                .FirstOrDefaultAsync();
            
            if (therapist == null) return NotFound();
            return Ok(therapist);
        }

        [HttpPost]
        public async Task<ActionResult<Therapist>> CreateTherapist(Therapist therapist)
        {
            _context.Therapists.Add(therapist);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetTherapist), new { id = therapist.Id }, therapist);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateTherapist(int id, Therapist therapist)
        {
            if (id != therapist.Id) return BadRequest();
            _context.Entry(therapist).State = EntityState.Modified;
            await _context.SaveChangesAsync();
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteTherapist(int id)
        {
            var therapist = await _context.Therapists.FindAsync(id);
            if (therapist == null) return NotFound();
            _context.Therapists.Remove(therapist);
            await _context.SaveChangesAsync();
            return NoContent();
        }
        [HttpPost("{id}/upload-picture")]
        public async Task<IActionResult> UploadProfilePicture(int id, IFormFile file)
        {
            Console.WriteLine($"Upload request received for therapist ID: {id}");
            
            var therapist = await _context.Therapists.FindAsync(id);
            if (therapist == null)
            {
                Console.WriteLine($"Therapist with ID {id} not found");
                return NotFound();
            }

            if (file == null || file.Length == 0)
            {
                Console.WriteLine("No file provided or file is empty");
                return BadRequest("Dosya yüklenmedi.");
            }

            Console.WriteLine($"File received: {file.FileName}, Size: {file.Length} bytes");

            // Güvenli bir dosya adı oluştur
            var fileName = $"{Guid.NewGuid()}{Path.GetExtension(file.FileName)}";
            
            // Dosyanın kaydedileceği yolu belirle (wwwroot altı)
            var directoryPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "images", "therapists");
            Console.WriteLine($"Directory path: {directoryPath}");
            
            if (!Directory.Exists(directoryPath))
            {
                Console.WriteLine($"Creating directory: {directoryPath}");
                Directory.CreateDirectory(directoryPath);
            }
            var filePath = Path.Combine(directoryPath, fileName);
            Console.WriteLine($"File will be saved to: {filePath}");

            // Dosyayı sunucuya kaydet
            try
            {
                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await file.CopyToAsync(stream);
                }
                Console.WriteLine($"File saved successfully to: {filePath}");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error saving file: {ex.Message}");
                return StatusCode(500, $"Dosya kaydedilirken hata oluştu: {ex.Message}");
            }

            // Eski resmi sil (varsa)
            if (!string.IsNullOrEmpty(therapist.ProfilePictureUrl))
            {
                var oldFileName = Path.GetFileName(therapist.ProfilePictureUrl);
                var oldFilePath = Path.Combine(directoryPath, oldFileName);
                if (System.IO.File.Exists(oldFilePath))
                {
                    System.IO.File.Delete(oldFilePath);
                }
            }
            
            // Veritabanındaki URL'yi güncelle (public URL)
            therapist.ProfilePictureUrl = $"/images/therapists/{fileName}";
            await _context.SaveChangesAsync();
            
            Console.WriteLine($"Database updated with profile picture URL: {therapist.ProfilePictureUrl}");
            return Ok(new { profilePictureUrl = therapist.ProfilePictureUrl });
        }
    }
}
