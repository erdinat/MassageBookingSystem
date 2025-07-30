using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using WebApplication1.Api.Data;
using WebApplication1.Api.Models;

namespace WebApplication1.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AvailabilityController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        public AvailabilityController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<AvailabilitySlot>>> GetSlots()
        {
            return await _context.AvailabilitySlots.Include(a => a.Therapist).ToListAsync();
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<AvailabilitySlot>> GetSlot(int id)
        {
            var slot = await _context.AvailabilitySlots.Include(a => a.Therapist).FirstOrDefaultAsync(a => a.Id == id);
            if (slot == null) return NotFound();
            return slot;
        }

        [HttpPost]
        public async Task<ActionResult<AvailabilitySlot>> CreateSlot(AvailabilitySlot slot)
        {
            _context.AvailabilitySlots.Add(slot);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetSlot), new { id = slot.Id }, slot);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateSlot(int id, AvailabilitySlot slot)
        {
            if (id != slot.Id) return BadRequest();
            _context.Entry(slot).State = EntityState.Modified;
            await _context.SaveChangesAsync();
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteSlot(int id)
        {
            var slot = await _context.AvailabilitySlots.FindAsync(id);
            if (slot == null) return NotFound();
            _context.AvailabilitySlots.Remove(slot);
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}
