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
        public async Task<ActionResult<IEnumerable<Therapist>>> GetTherapists()
        {
            return await _context.Therapists.ToListAsync();
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Therapist>> GetTherapist(int id)
        {
            var therapist = await _context.Therapists.FindAsync(id);
            if (therapist == null) return NotFound();
            return therapist;
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
    }
}
