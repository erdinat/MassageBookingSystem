namespace WebApplication1.Api.Models
{
    public class UserFavoriteTherapist
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public int TherapistId { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        
        // Navigation properties
        public User User { get; set; } = null!;
        public Therapist Therapist { get; set; } = null!;
    }
}