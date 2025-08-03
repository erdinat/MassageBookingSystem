namespace WebApplication1.Api.DTOs
{
    public class RescheduleRequest
    {
        public int NewAvailabilitySlotId { get; set; }
        public int? NewTherapistId { get; set; }
    }
}