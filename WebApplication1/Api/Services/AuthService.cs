using Microsoft.EntityFrameworkCore;
using System.Security.Cryptography;
using System.Text;
using WebApplication1.Api.Data;
using WebApplication1.Api.Models;
using WebApplication1.Api.DTOs;

namespace WebApplication1.Api.Services
{
    public interface IAuthService
    {
        Task<AuthResponse> RegisterAsync(RegisterRequest request);
        Task<AuthResponse> LoginAsync(LoginRequest request);
        Task<AuthResponse> ChangePasswordAsync(int userId, ChangePasswordRequest request);
        Task<AuthResponse> UpdateProfileAsync(int userId, UpdateProfileRequest request);
        Task<AuthResponse> ForgotPasswordAsync(ForgotPasswordRequest request);
        Task<AuthResponse> ResetPasswordAsync(ResetPasswordRequest request);
        Task<UserDto?> GetUserProfileAsync(int userId);
        Task<bool> AddFavoriteTherapistAsync(int userId, int therapistId);
        Task<bool> RemoveFavoriteTherapistAsync(int userId, int therapistId);
        Task<List<TherapistDto>> GetFavoriteTherapistsAsync(int userId);
    }

    public class AuthService : IAuthService
    {
        private readonly ApplicationDbContext _context;
        private readonly IEmailService _emailService;
        private readonly ILogger<AuthService> _logger;

        public AuthService(ApplicationDbContext context, IEmailService emailService, ILogger<AuthService> logger)
        {
            _context = context;
            _emailService = emailService;
            _logger = logger;
        }

        public async Task<AuthResponse> RegisterAsync(RegisterRequest request)
        {
            try
            {
                // Validation
                if (request.Password != request.ConfirmPassword)
                {
                    return new AuthResponse { Success = false, Message = "Şifreler eşleşmiyor" };
                }

                if (request.Password.Length < 6)
                {
                    return new AuthResponse { Success = false, Message = "Şifre en az 6 karakter olmalıdır" };
                }

                // Check if user already exists
                var existingUser = await _context.Users.FirstOrDefaultAsync(u => u.Email == request.Email);
                if (existingUser != null)
                {
                    return new AuthResponse { Success = false, Message = "Bu email adresi zaten kullanılıyor" };
                }

                // Hash password
                var passwordHash = HashPassword(request.Password);

                // Generate email verification token
                var verificationToken = GenerateRandomToken();

                // Create user
                var user = new User
                {
                    Name = request.Name,
                    Surname = request.Surname,
                    Email = request.Email,
                    Phone = request.Phone,
                    PasswordHash = passwordHash,
                    EmailVerificationToken = verificationToken,
                    EmailVerificationTokenExpiry = DateTime.UtcNow.AddDays(1),
                    CreatedAt = DateTime.UtcNow
                };

                _context.Users.Add(user);
                await _context.SaveChangesAsync();

                // Send verification email (in background)
                _ = Task.Run(async () =>
                {
                    try
                    {
                        await SendVerificationEmailAsync(user.Email, user.Name, verificationToken);
                    }
                    catch (Exception ex)
                    {
                        _logger.LogError(ex, "Email verification could not be sent to {Email}", user.Email);
                    }
                });

                var userDto = MapToUserDto(user);
                return new AuthResponse
                {
                    Success = true,
                    Message = "Kayıt başarılı! Email adresinize doğrulama linki gönderildi.",
                    User = userDto,
                    Token = GenerateJwtToken(user) // You would implement JWT token generation
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during user registration");
                return new AuthResponse { Success = false, Message = "Kayıt sırasında bir hata oluştu" };
            }
        }

        public async Task<AuthResponse> LoginAsync(LoginRequest request)
        {
            try
            {
                var user = await _context.Users
                    .Include(u => u.FavoriteTherapists)
                    .ThenInclude(ft => ft.Therapist)
                    .FirstOrDefaultAsync(u => u.Email == request.Email);

                if (user == null || !VerifyPassword(request.Password, user.PasswordHash))
                {
                    return new AuthResponse { Success = false, Message = "Email veya şifre hatalı" };
                }

                // Update last login
                user.LastLoginAt = DateTime.UtcNow;
                await _context.SaveChangesAsync();

                var userDto = MapToUserDto(user);
                return new AuthResponse
                {
                    Success = true,
                    Message = "Giriş başarılı",
                    User = userDto,
                    Token = GenerateJwtToken(user)
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during user login");
                return new AuthResponse { Success = false, Message = "Giriş sırasında bir hata oluştu" };
            }
        }

        public async Task<AuthResponse> ChangePasswordAsync(int userId, ChangePasswordRequest request)
        {
            try
            {
                if (request.NewPassword != request.ConfirmNewPassword)
                {
                    return new AuthResponse { Success = false, Message = "Yeni şifreler eşleşmiyor" };
                }

                if (request.NewPassword.Length < 6)
                {
                    return new AuthResponse { Success = false, Message = "Yeni şifre en az 6 karakter olmalıdır" };
                }

                var user = await _context.Users.FindAsync(userId);
                if (user == null)
                {
                    return new AuthResponse { Success = false, Message = "Kullanıcı bulunamadı" };
                }

                if (!VerifyPassword(request.CurrentPassword, user.PasswordHash))
                {
                    return new AuthResponse { Success = false, Message = "Mevcut şifre hatalı" };
                }

                user.PasswordHash = HashPassword(request.NewPassword);
                await _context.SaveChangesAsync();

                return new AuthResponse { Success = true, Message = "Şifre başarıyla değiştirildi" };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during password change for user {UserId}", userId);
                return new AuthResponse { Success = false, Message = "Şifre değiştirme sırasında bir hata oluştu" };
            }
        }

        public async Task<AuthResponse> UpdateProfileAsync(int userId, UpdateProfileRequest request)
        {
            try
            {
                var user = await _context.Users.FindAsync(userId);
                if (user == null)
                {
                    return new AuthResponse { Success = false, Message = "Kullanıcı bulunamadı" };
                }

                user.Name = request.Name;
                user.Surname = request.Surname;
                user.Phone = request.Phone;

                await _context.SaveChangesAsync();

                var userDto = MapToUserDto(user);
                return new AuthResponse
                {
                    Success = true,
                    Message = "Profil başarıyla güncellendi",
                    User = userDto
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during profile update for user {UserId}", userId);
                return new AuthResponse { Success = false, Message = "Profil güncellenirken bir hata oluştu" };
            }
        }

        public async Task<AuthResponse> ForgotPasswordAsync(ForgotPasswordRequest request)
        {
            try
            {
                var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == request.Email);
                if (user == null)
                {
                    // Don't reveal if email exists for security
                    return new AuthResponse { Success = true, Message = "Eğer bu email adresi sistemde kayıtlıysa, şifre sıfırlama linki gönderilmiştir." };
                }

                var resetToken = GenerateRandomToken();
                user.PasswordResetToken = resetToken;
                user.PasswordResetTokenExpiry = DateTime.UtcNow.AddHours(1);

                await _context.SaveChangesAsync();

                // Send reset email (in background)
                _ = Task.Run(async () =>
                {
                    try
                    {
                        await SendPasswordResetEmailAsync(user.Email, user.Name, resetToken);
                    }
                    catch (Exception ex)
                    {
                        _logger.LogError(ex, "Password reset email could not be sent to {Email}", user.Email);
                    }
                });

                return new AuthResponse { Success = true, Message = "Eğer bu email adresi sistemde kayıtlıysa, şifre sıfırlama linki gönderilmiştir." };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during forgot password for email {Email}", request.Email);
                return new AuthResponse { Success = false, Message = "Şifre sıfırlama sırasında bir hata oluştu" };
            }
        }

        public async Task<AuthResponse> ResetPasswordAsync(ResetPasswordRequest request)
        {
            try
            {
                if (request.NewPassword != request.ConfirmNewPassword)
                {
                    return new AuthResponse { Success = false, Message = "Şifreler eşleşmiyor" };
                }

                if (request.NewPassword.Length < 6)
                {
                    return new AuthResponse { Success = false, Message = "Şifre en az 6 karakter olmalıdır" };
                }

                var user = await _context.Users.FirstOrDefaultAsync(u => 
                    u.Email == request.Email && 
                    u.PasswordResetToken == request.Token &&
                    u.PasswordResetTokenExpiry > DateTime.UtcNow);

                if (user == null)
                {
                    return new AuthResponse { Success = false, Message = "Geçersiz veya süresi dolmuş token" };
                }

                user.PasswordHash = HashPassword(request.NewPassword);
                user.PasswordResetToken = null;
                user.PasswordResetTokenExpiry = null;

                await _context.SaveChangesAsync();

                return new AuthResponse { Success = true, Message = "Şifre başarıyla sıfırlandı" };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during password reset");
                return new AuthResponse { Success = false, Message = "Şifre sıfırlama sırasında bir hata oluştu" };
            }
        }

        public async Task<UserDto?> GetUserProfileAsync(int userId)
        {
            try
            {
                var user = await _context.Users
                    .Include(u => u.FavoriteTherapists)
                    .ThenInclude(ft => ft.Therapist)
                    .FirstOrDefaultAsync(u => u.Id == userId);

                return user != null ? MapToUserDto(user) : null;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting user profile for {UserId}", userId);
                return null;
            }
        }

        public async Task<bool> AddFavoriteTherapistAsync(int userId, int therapistId)
        {
            try
            {
                var exists = await _context.UserFavoriteTherapists
                    .AnyAsync(uft => uft.UserId == userId && uft.TherapistId == therapistId);

                if (exists) return true; // Already favorite

                var favorite = new UserFavoriteTherapist
                {
                    UserId = userId,
                    TherapistId = therapistId,
                    CreatedAt = DateTime.UtcNow
                };

                _context.UserFavoriteTherapists.Add(favorite);
                await _context.SaveChangesAsync();
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error adding favorite therapist {TherapistId} for user {UserId}", therapistId, userId);
                return false;
            }
        }

        public async Task<bool> RemoveFavoriteTherapistAsync(int userId, int therapistId)
        {
            try
            {
                var favorite = await _context.UserFavoriteTherapists
                    .FirstOrDefaultAsync(uft => uft.UserId == userId && uft.TherapistId == therapistId);

                if (favorite == null) return true; // Already removed

                _context.UserFavoriteTherapists.Remove(favorite);
                await _context.SaveChangesAsync();
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error removing favorite therapist {TherapistId} for user {UserId}", therapistId, userId);
                return false;
            }
        }

        public async Task<List<TherapistDto>> GetFavoriteTherapistsAsync(int userId)
        {
            try
            {
                var favorites = await _context.UserFavoriteTherapists
                    .Include(uft => uft.Therapist)
                    .Where(uft => uft.UserId == userId)
                    .Select(uft => new TherapistDto
                    {
                        Id = uft.Therapist.Id,
                        Name = uft.Therapist.Name,
                        Bio = uft.Therapist.Bio
                    })
                    .ToListAsync();

                return favorites;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting favorite therapists for user {UserId}", userId);
                return new List<TherapistDto>();
            }
        }

        private string HashPassword(string password)
        {
            using var sha256 = SHA256.Create();
            var hashedBytes = sha256.ComputeHash(Encoding.UTF8.GetBytes(password + "LOR_SALT_2024"));
            return Convert.ToBase64String(hashedBytes);
        }

        private bool VerifyPassword(string password, string hash)
        {
            return HashPassword(password) == hash;
        }

        private string GenerateRandomToken()
        {
            var bytes = new byte[32];
            using var rng = RandomNumberGenerator.Create();
            rng.GetBytes(bytes);
            return Convert.ToBase64String(bytes);
        }

        private string GenerateJwtToken(User user)
        {
            // In a real application, you would implement JWT token generation here
            // For now, we'll return a simple token
            return Convert.ToBase64String(Encoding.UTF8.GetBytes($"{user.Id}:{user.Email}:{DateTime.UtcNow.Ticks}"));
        }

        private UserDto MapToUserDto(User user)
        {
            return new UserDto
            {
                Id = user.Id,
                Name = user.Name,
                Surname = user.Surname,
                Email = user.Email,
                Phone = user.Phone,
                CreatedAt = user.CreatedAt,
                LastLoginAt = user.LastLoginAt,
                IsEmailVerified = user.IsEmailVerified,
                FavoriteTherapists = user.FavoriteTherapists?.Select(ft => new TherapistDto
                {
                    Id = ft.Therapist.Id,
                    Name = ft.Therapist.Name,
                    Bio = ft.Therapist.Bio
                }).ToList() ?? new List<TherapistDto>()
            };
        }

        private async Task SendVerificationEmailAsync(string email, string name, string token)
        {
            var verificationLink = $"http://localhost:3000/verify-email?token={token}&email={Uri.EscapeDataString(email)}";
            
            var subject = "🌸 Email Doğrulama - L'OR Masaj Merkezi";
            var htmlBody = $@"
<!DOCTYPE html>
<html>
<head>
    <meta charset='utf-8'>
    <style>
        body {{ font-family: Arial, sans-serif; background-color: #F5F1E8; margin: 0; padding: 20px; }}
        .container {{ max-width: 600px; margin: 0 auto; background-color: white; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 12px rgba(139, 111, 71, 0.2); }}
        .header {{ background: linear-gradient(135deg, #8B6F47, #D4B896); color: white; padding: 30px; text-align: center; }}
        .content {{ padding: 30px; }}
        .button {{ display: inline-block; background-color: #8B6F47; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; }}
    </style>
</head>
<body>
    <div class='container'>
        <div class='header'>
            <h1>🌸 L'OR Masaj Merkezi</h1>
            <h2>Email Doğrulama</h2>
        </div>
        <div class='content'>
            <p>Sayın <strong>{name}</strong>,</p>
            <p>L'OR Masaj Merkezi'ne hoş geldiniz! Email adresinizi doğrulamak için aşağıdaki butona tıklayın:</p>
            <p style='text-align: center; margin: 30px 0;'>
                <a href='{verificationLink}' class='button'>Email Adresimi Doğrula</a>
            </p>
            <p>Bu link 24 saat geçerlidir.</p>
            <p>Teşekkür ederiz! 🌸</p>
        </div>
    </div>
</body>
</html>";

            await _emailService.SendEmailAsync(email, subject, htmlBody);
        }

        private async Task SendPasswordResetEmailAsync(string email, string name, string token)
        {
            var resetLink = $"http://localhost:3000/reset-password?token={token}&email={Uri.EscapeDataString(email)}";
            
            var subject = "🔐 Şifre Sıfırlama - L'OR Masaj Merkezi";
            var htmlBody = $@"
<!DOCTYPE html>
<html>
<head>
    <meta charset='utf-8'>
    <style>
        body {{ font-family: Arial, sans-serif; background-color: #F5F1E8; margin: 0; padding: 20px; }}
        .container {{ max-width: 600px; margin: 0 auto; background-color: white; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 12px rgba(139, 111, 71, 0.2); }}
        .header {{ background: linear-gradient(135deg, #FF6B6B, #FFB347); color: white; padding: 30px; text-align: center; }}
        .content {{ padding: 30px; }}
        .button {{ display: inline-block; background-color: #FF6B6B; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; }}
    </style>
</head>
<body>
    <div class='container'>
        <div class='header'>
            <h1>🔐 Şifre Sıfırlama</h1>
        </div>
        <div class='content'>
            <p>Sayın <strong>{name}</strong>,</p>
            <p>Şifrenizi sıfırlamak için aşağıdaki butona tıklayın:</p>
            <p style='text-align: center; margin: 30px 0;'>
                <a href='{resetLink}' class='button'>Şifremi Sıfırla</a>
            </p>
            <p>Bu link 1 saat geçerlidir.</p>
            <p>Eğer bu işlemi siz yapmadıysanız, bu emaili görmezden gelebilirsiniz.</p>
            <p>L'OR Masaj Merkezi 🌸</p>
        </div>
    </div>
</body>
</html>";

            await _emailService.SendEmailAsync(email, subject, htmlBody);
        }
    }
}