using Microsoft.EntityFrameworkCore;
using WebApplication1.Api.Models;

namespace WebApplication1.Api.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options) { }

        public DbSet<Service> Services { get; set; }
        public DbSet<Therapist> Therapists { get; set; }
        public DbSet<AvailabilitySlot> AvailabilitySlots { get; set; }
        public DbSet<Appointment> Appointments { get; set; }
        public DbSet<Customer> Customers { get; set; }
        public DbSet<User> Users { get; set; }
        public DbSet<UserFavoriteTherapist> UserFavoriteTherapists { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<Appointment>()
                .HasOne(a => a.Therapist)
                .WithMany()
                .HasForeignKey(a => a.TherapistId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Appointment>()
                .HasOne(a => a.Service)
                .WithMany()
                .HasForeignKey(a => a.ServiceId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Appointment>()
                .HasOne(a => a.Customer)
                .WithMany()
                .HasForeignKey(a => a.CustomerId)
                .OnDelete(DeleteBehavior.Restrict);

            // User relationships
            modelBuilder.Entity<UserFavoriteTherapist>()
                .HasOne(uft => uft.User)
                .WithMany(u => u.FavoriteTherapists)
                .HasForeignKey(uft => uft.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<UserFavoriteTherapist>()
                .HasOne(uft => uft.Therapist)
                .WithMany()
                .HasForeignKey(uft => uft.TherapistId)
                .OnDelete(DeleteBehavior.Cascade);

            // User-Therapist relationship
            modelBuilder.Entity<Therapist>()
                .HasOne(t => t.User)
                .WithOne(u => u.TherapistProfile)
                .HasForeignKey<Therapist>(t => t.UserId)
                .OnDelete(DeleteBehavior.SetNull);

            // Email unique constraint
            modelBuilder.Entity<User>()
                .HasIndex(u => u.Email)
                .IsUnique();
        }
    }
}
