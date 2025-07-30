using System;

namespace WebApplication1.Api.Models
{
    public class AvailabilitySlot
    {
        public int Id { get; set; }
        public int TherapistId { get; set; }
        public Therapist? Therapist { get; set; }
        public DateTime StartTime { get; set; }
        public DateTime EndTime { get; set; }
        public bool IsBooked { get; set; }
    }
}
