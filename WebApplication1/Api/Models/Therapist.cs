namespace WebApplication1.Api.Models
{
    public class Therapist
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string Bio { get; set; }
        public string ProfilePictureUrl { get; set; }

        public ICollection<AvailabilitySlot>? AvailabilitySlots { get; set; }
        public ICollection<Appointment>? Appointments { get; set; }
    }
}
