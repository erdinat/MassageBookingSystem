namespace WebApplication1.Api.Models
{
    public class Customer
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string Surname { get; set; }
        public string Phone { get; set; }
        public string Email { get; set; }
        // Gelecekte: public string PasswordHash { get; set; }
    }
} 