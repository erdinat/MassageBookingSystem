using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using WebApplication1.Api.Data;
using WebApplication1.Api.Models;

namespace WebApplication1.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ServicesController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        public ServicesController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<object>>> GetServices()
        {
            var services = await _context.Services
                .Select(s => new
                {
                    s.Id,
                    s.Name,
                    s.Description,
                    s.Price,
                    s.DurationMinutes
                })
                .ToListAsync();
            
            return Ok(services);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<object>> GetService(int id)
        {
            var service = await _context.Services
                .Where(s => s.Id == id)
                .Select(s => new
                {
                    s.Id,
                    s.Name,
                    s.Description,
                    s.Price,
                    s.DurationMinutes
                })
                .FirstOrDefaultAsync();
            
            if (service == null) return NotFound();
            return Ok(service);
        }

        [HttpPost]
        public async Task<ActionResult<Service>> CreateService(Service service)
        {
            _context.Services.Add(service);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetService), new { id = service.Id }, service);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateService(int id, Service service)
        {
            if (id != service.Id) return BadRequest();
            _context.Entry(service).State = EntityState.Modified;
            await _context.SaveChangesAsync();
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteService(int id)
        {
            var service = await _context.Services.FindAsync(id);
            if (service == null) return NotFound();
            _context.Services.Remove(service);
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}
