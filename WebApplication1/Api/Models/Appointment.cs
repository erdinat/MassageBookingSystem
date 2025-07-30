using System;

namespace WebApplication1.Api.Models
{
    public class Appointment
    {
        public int Id { get; set; }
        public int ServiceId { get; set; }
        public Service? Service { get; set; }
        public int TherapistId { get; set; }
        public Therapist? Therapist { get; set; }
        public int AvailabilitySlotId { get; set; }
        public AvailabilitySlot? AvailabilitySlot { get; set; }
        public int CustomerId { get; set; }
        public Customer? Customer { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}
