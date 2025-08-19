namespace WebApplication1.Api.Models
{
    public enum UserRole
    {
        Customer = 0,
        Therapist = 1,
        Admin = 2
    }
    public class User
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Surname { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Phone { get; set; } = string.Empty;
        public string PasswordHash { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? LastLoginAt { get; set; }
        public bool IsEmailVerified { get; set; } = false;
        public string? EmailVerificationToken { get; set; }
        public DateTime? EmailVerificationTokenExpiry { get; set; }
        public string? PasswordResetToken { get; set; }
        public DateTime? PasswordResetTokenExpiry { get; set; }
        public UserRole Role { get; set; } = UserRole.Customer;
        
        // Navigation properties
        public ICollection<Appointment> Appointments { get; set; } = new List<Appointment>();
        public Therapist? TherapistProfile { get; set; }
        public ICollection<UserFavoriteTherapist> FavoriteTherapists { get; set; } = new List<UserFavoriteTherapist>();
    }
}