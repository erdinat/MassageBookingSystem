using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using WebApplication1.Api.Data;
using WebApplication1.Api.Models;
using WebApplication1.Api.Services;
using WebApplication1.Api.DTOs;

namespace WebApplication1.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AppointmentsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly INotificationService _notificationService;
        
        public AppointmentsController(ApplicationDbContext context, INotificationService notificationService)
        {
            _context = context;
            _notificationService = notificationService;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<object>>> GetAppointments()
        {
            var appointments = await _context.Appointments
                .Include(a => a.Service)
                .Include(a => a.Therapist)
                .Include(a => a.Customer)
                .Include(a => a.AvailabilitySlot)
                .OrderByDescending(a => a.AvailabilitySlot.StartTime)
                .Select(a => new
                {
                    a.Id,
                    a.CreatedAt,
                    a.UserId,
                    a.TherapistId,
                    Service = new
                    {
                        a.Service.Id,
                        a.Service.Name,
                        a.Service.Description,
                        a.Service.Price,
                        a.Service.DurationMinutes
                    },
                    Therapist = new
                    {
                        a.Therapist.Id,
                        a.Therapist.Name,
                        a.Therapist.Bio,
                        a.Therapist.ProfilePictureUrl
                    },
                    Customer = new
                    {
                        a.Customer.Id,
                        a.Customer.Name,
                        a.Customer.Surname,
                        a.Customer.Phone,
                        a.Customer.Email
                    },
                    AvailabilitySlot = new
                    {
                        a.AvailabilitySlot.Id,
                        StartTime = DateTime.SpecifyKind(a.AvailabilitySlot.StartTime, DateTimeKind.Utc),
                        EndTime = DateTime.SpecifyKind(a.AvailabilitySlot.EndTime, DateTimeKind.Utc),
                        a.AvailabilitySlot.IsBooked
                    }
                })
                .ToListAsync();
            
            return Ok(appointments);
        }

        [HttpGet("customer/{email}")]
        public async Task<ActionResult<IEnumerable<Appointment>>> GetAppointmentsByCustomerEmail(string email)
        {
            var appointments = await _context.Appointments
                .Include(a => a.Service)
                .Include(a => a.Therapist)
                .Include(a => a.Customer)
                .Include(a => a.AvailabilitySlot)
                .Where(a => a.Customer.Email == email)
                .OrderByDescending(a => a.AvailabilitySlot.StartTime)
                .ToListAsync();

            return appointments;
        }

        [HttpGet("customer/{email}/upcoming")]
        public async Task<ActionResult<IEnumerable<object>>> GetUpcomingAppointmentsByCustomerEmail(string email)
        {
            var appointments = await _context.Appointments
                .Include(a => a.Service)
                .Include(a => a.Therapist)
                .Include(a => a.Customer)
                .Include(a => a.AvailabilitySlot)
                .Where(a => a.Customer.Email == email && a.AvailabilitySlot.StartTime > DateTime.Now)
                .OrderBy(a => a.AvailabilitySlot.StartTime)
                .Select(a => new
                {
                    a.Id,
                    a.CreatedAt,
                    a.UserId,
                    a.TherapistId,
                    Service = new
                    {
                        a.Service.Id,
                        a.Service.Name,
                        a.Service.Description,
                        a.Service.Price,
                        a.Service.DurationMinutes
                    },
                    Therapist = new
                    {
                        a.Therapist.Id,
                        a.Therapist.Name,
                        a.Therapist.Bio,
                        a.Therapist.ProfilePictureUrl
                    },
                    Customer = new
                    {
                        a.Customer.Id,
                        a.Customer.Name,
                        a.Customer.Surname,
                        a.Customer.Phone,
                        a.Customer.Email
                    },
                    AvailabilitySlot = new
                    {
                        a.AvailabilitySlot.Id,
                        StartTime = DateTime.SpecifyKind(a.AvailabilitySlot.StartTime, DateTimeKind.Utc),
                        EndTime = DateTime.SpecifyKind(a.AvailabilitySlot.EndTime, DateTimeKind.Utc),
                        a.AvailabilitySlot.IsBooked
                    }
                })
                .ToListAsync();

            return Ok(appointments);
        }

        [HttpGet("customer/{email}/past")]
        public async Task<ActionResult<IEnumerable<object>>> GetPastAppointmentsByCustomerEmail(string email)
        {
            var appointments = await _context.Appointments
                .Include(a => a.Service)
                .Include(a => a.Therapist)
                .Include(a => a.Customer)
                .Include(a => a.AvailabilitySlot)
                .Where(a => a.Customer.Email == email && a.AvailabilitySlot.StartTime <= DateTime.Now)
                .OrderByDescending(a => a.AvailabilitySlot.StartTime)
                .Select(a => new
                {
                    a.Id,
                    a.CreatedAt,
                    a.UserId,
                    a.TherapistId,
                    Service = new
                    {
                        a.Service.Id,
                        a.Service.Name,
                        a.Service.Description,
                        a.Service.Price,
                        a.Service.DurationMinutes
                    },
                    Therapist = new
                    {
                        a.Therapist.Id,
                        a.Therapist.Name,
                        a.Therapist.Bio,
                        a.Therapist.ProfilePictureUrl
                    },
                    Customer = new
                    {
                        a.Customer.Id,
                        a.Customer.Name,
                        a.Customer.Surname,
                        a.Customer.Phone,
                        a.Customer.Email
                    },
                    AvailabilitySlot = new
                    {
                        a.AvailabilitySlot.Id,
                        StartTime = DateTime.SpecifyKind(a.AvailabilitySlot.StartTime, DateTimeKind.Utc),
                        EndTime = DateTime.SpecifyKind(a.AvailabilitySlot.EndTime, DateTimeKind.Utc),
                        a.AvailabilitySlot.IsBooked
                    }
                })
                .ToListAsync();

            return Ok(appointments);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Appointment>> GetAppointment(int id)
        {
            var appointment = await _context.Appointments
                .Include(a => a.Service)
                .Include(a => a.Therapist)
                .Include(a => a.Customer)
                .Include(a => a.AvailabilitySlot)
                .FirstOrDefaultAsync(a => a.Id == id);
            if (appointment == null) return NotFound();
            return appointment;
        }

        [HttpPost]
        public async Task<ActionResult<Appointment>> CreateAppointment(Appointment appointment)
        {
            try
            {
                // Türkiye saati için CreatedAt
                var turkeyTime = TimeZoneInfo.ConvertTimeFromUtc(DateTime.UtcNow, TimeZoneInfo.FindSystemTimeZoneById("Turkey Standard Time"));
                appointment.CreatedAt = turkeyTime;
                
                Console.WriteLine($"Appointment Creation Debug - UTC: {DateTime.UtcNow}, Turkey Time: {turkeyTime}, Set CreatedAt: {appointment.CreatedAt}");
                
                _context.Appointments.Add(appointment);
                await _context.SaveChangesAsync();

                // Randevu detaylarını çek
                var fullAppointment = await _context.Appointments
                    .Include(a => a.Service)
                    .Include(a => a.Therapist)
                    .Include(a => a.Customer)
                    .Include(a => a.AvailabilitySlot)
                    .FirstOrDefaultAsync(a => a.Id == appointment.Id);

                if (fullAppointment != null)
                {
                    // Bildirim gönder (arka planda)
                    _ = Task.Run(async () =>
                    {
                        try
                        {
                            await _notificationService.SendAppointmentConfirmationAsync(
                                fullAppointment.Customer?.Email ?? "",
                                fullAppointment.Customer?.Phone ?? "",
                                (fullAppointment.Customer?.Name ?? "") + " " + (fullAppointment.Customer?.Surname ?? ""),
                                fullAppointment.Service?.Name ?? "",
                                fullAppointment.Therapist?.Name ?? "",
                                fullAppointment.AvailabilitySlot?.StartTime ?? DateTime.Now,
                                fullAppointment.Service?.Price ?? 0
                            );

                            // Hatırlatma zamanla
                            await _notificationService.ScheduleReminderAsync(
                                fullAppointment.Id,
                                fullAppointment.AvailabilitySlot?.StartTime ?? DateTime.Now,
                                fullAppointment.Customer?.Email ?? "",
                                fullAppointment.Customer?.Phone ?? "",
                                (fullAppointment.Customer?.Name ?? "") + " " + (fullAppointment.Customer?.Surname ?? ""),
                                fullAppointment.Service?.Name ?? ""
                            );
                        }
                        catch (Exception ex)
                        {
                            // Log the error but don't fail the appointment creation
                            Console.WriteLine($"Bildirim gönderilirken hata: {ex.Message}");
                        }
                    });
                }

                return CreatedAtAction(nameof(GetAppointment), new { id = appointment.Id }, appointment);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Randevu oluşturulurken hata: {ex.Message}");
            }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateAppointment(int id, Appointment appointment)
        {
            if (id != appointment.Id) return BadRequest();
            
            try
            {
                _context.Entry(appointment).State = EntityState.Modified;
                await _context.SaveChangesAsync();
                return NoContent();
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Randevu güncellenirken hata: {ex.Message}");
            }
        }

        [HttpPut("{id}/reschedule")]
        public async Task<IActionResult> RescheduleAppointment(int id, [FromBody] RescheduleRequest request)
        {
            try
            {
                var appointment = await _context.Appointments
                    .Include(a => a.Service)
                    .Include(a => a.Therapist)
                    .Include(a => a.Customer)
                    .Include(a => a.AvailabilitySlot)
                    .FirstOrDefaultAsync(a => a.Id == id);

                if (appointment == null) return NotFound();

                // Eski slot'u serbest bırak
                var oldSlot = appointment.AvailabilitySlot;
                oldSlot.IsBooked = false;

                // Yeni slot'u bul ve rezerve et
                var newSlot = await _context.AvailabilitySlots.FindAsync(request.NewAvailabilitySlotId);
                if (newSlot == null || newSlot.IsBooked) 
                    return BadRequest("Seçilen saat müsait değil.");

                newSlot.IsBooked = true;
                appointment.AvailabilitySlotId = request.NewAvailabilitySlotId;

                // Yeni terapist seçildiyse güncelle
                if (request.NewTherapistId.HasValue && request.NewTherapistId != appointment.TherapistId)
                {
                    appointment.TherapistId = request.NewTherapistId.Value;
                }

                await _context.SaveChangesAsync();

                // Bildirim gönder (arka planda)
                _ = Task.Run(async () =>
                {
                    try
                    {
                        // Randevu güncelleme bildirimi (yeniden konfirmasyon olarak)
                        await _notificationService.SendAppointmentConfirmationAsync(
                            appointment.Customer?.Email ?? "",
                            appointment.Customer?.Phone ?? "",
                            (appointment.Customer?.Name ?? "") + " " + (appointment.Customer?.Surname ?? ""),
                            appointment.Service?.Name ?? "",
                            appointment.Therapist?.Name ?? "",
                            newSlot?.StartTime ?? DateTime.Now,
                            appointment.Service?.Price ?? 0
                        );
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine($"Randevu güncelleme bildirimi gönderilirken hata: {ex.Message}");
                    }
                });

                return Ok(new { message = "Randevu başarıyla güncellendi." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Randevu yeniden zamanlanırken hata: {ex.Message}");
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteAppointment(int id)
        {
            try
            {
                // İptal edilecek randevuyu detaylarıyla birlikte çek
                var appointment = await _context.Appointments
                    .Include(a => a.Service)
                    .Include(a => a.Therapist)
                    .Include(a => a.Customer)
                    .Include(a => a.AvailabilitySlot)
                    .FirstOrDefaultAsync(a => a.Id == id);

                if (appointment == null) return NotFound();

                // Randevuyu sil
                _context.Appointments.Remove(appointment);
                await _context.SaveChangesAsync();

                // İptal bildirimi gönder (arka planda)
                _ = Task.Run(async () =>
                {
                    try
                    {
                        await _notificationService.SendAppointmentCancellationAsync(
                            appointment.Customer.Email,
                            appointment.Customer.Phone,
                            appointment.Customer.Name + " " + appointment.Customer.Surname,
                            appointment.Service.Name,
                            appointment.AvailabilitySlot.StartTime
                        );
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine($"İptal bildirimi gönderilirken hata: {ex.Message}");
                    }
                });

                return NoContent();
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Randevu iptal edilirken hata: {ex.Message}");
            }
        }
    }
}
