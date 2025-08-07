using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using System.Security.Cryptography;
using System.Text;
using WebApplication1.Api.Data;
using WebApplication1.Api.DTOs;
using WebApplication1.Api.Models;

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
                // Email kontrolü
                if (await _context.Users.AnyAsync(u => u.Email == request.Email))
                {
                    return new AuthResponse { Success = false, Message = "Bu email adresi zaten kullanılıyor." };
                }

                // Yeni kullanıcı oluştur
                var user = new User
                {
                    Name = request.Name,
                    Surname = request.Surname,
                    Email = request.Email,
                    Phone = request.Phone,
                    PasswordHash = HashPassword(request.Password),
                    Role = UserRole.Customer,
                    CreatedAt = DateTime.UtcNow,
                    IsEmailVerified = false
                };

                _context.Users.Add(user);
                await _context.SaveChangesAsync();

                // Email doğrulama token'ı oluştur
                var verificationToken = GenerateRandomToken();
                user.EmailVerificationToken = verificationToken;
                user.EmailVerificationTokenExpiry = DateTime.UtcNow.AddHours(24);
                await _context.SaveChangesAsync();

                // Doğrulama emaili gönder
                await SendVerificationEmailAsync(user.Email, user.Name, verificationToken);

                return new AuthResponse
                {
                    Success = true,
                    Message = "Kayıt başarılı! Email adresinizi doğrulamak için email'inizi kontrol edin.",
                    User = MapToUserDto(user),
                    Token = GenerateJwtToken(user)
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Kayıt sırasında hata oluştu");
                return new AuthResponse { Success = false, Message = "Kayıt sırasında bir hata oluştu." };
            }
        }

        public async Task<AuthResponse> LoginAsync(LoginRequest request)
        {
            try
            {
                var user = await _context.Users
                    .FirstOrDefaultAsync(u => u.Email == request.Email);

                if (user == null || !VerifyPassword(request.Password, user.PasswordHash))
                {
                    return new AuthResponse { Success = false, Message = "Email veya şifre hatalı." };
                }

                // Son giriş zamanını güncelle
                user.LastLoginAt = DateTime.UtcNow;
                await _context.SaveChangesAsync();

                return new AuthResponse
                {
                    Success = true,
                    Message = "Giriş başarılı!",
                    User = MapToUserDto(user),
                    Token = GenerateJwtToken(user)
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Giriş sırasında hata oluştu");
                return new AuthResponse { Success = false, Message = "Giriş sırasında bir hata oluştu." };
            }
        }

        public async Task<AuthResponse> ChangePasswordAsync(int userId, ChangePasswordRequest request)
        {
            try
            {
                var user = await _context.Users.FindAsync(userId);
                if (user == null)
                {
                    return new AuthResponse { Success = false, Message = "Kullanıcı bulunamadı." };
                }

                if (!VerifyPassword(request.CurrentPassword, user.PasswordHash))
                {
                    return new AuthResponse { Success = false, Message = "Mevcut şifre hatalı." };
                }

                if (request.NewPassword != request.ConfirmNewPassword)
                {
                    return new AuthResponse { Success = false, Message = "Yeni şifreler eşleşmiyor." };
                }

                user.PasswordHash = HashPassword(request.NewPassword);
                await _context.SaveChangesAsync();

                return new AuthResponse
                {
                    Success = true,
                    Message = "Şifre başarıyla değiştirildi.",
                    User = MapToUserDto(user)
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Şifre değiştirme sırasında hata oluştu");
                return new AuthResponse { Success = false, Message = "Şifre değiştirme sırasında bir hata oluştu." };
            }
        }

        public async Task<AuthResponse> UpdateProfileAsync(int userId, UpdateProfileRequest request)
        {
            try
            {
                var user = await _context.Users.FindAsync(userId);
                if (user == null)
                {
                    return new AuthResponse { Success = false, Message = "Kullanıcı bulunamadı." };
                }

                user.Name = request.Name;
                user.Surname = request.Surname;
                user.Phone = request.Phone;
                await _context.SaveChangesAsync();

                return new AuthResponse
                {
                    Success = true,
                    Message = "Profil başarıyla güncellendi.",
                    User = MapToUserDto(user)
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Profil güncelleme sırasında hata oluştu");
                return new AuthResponse { Success = false, Message = "Profil güncelleme sırasında bir hata oluştu." };
            }
        }

        public async Task<AuthResponse> ForgotPasswordAsync(ForgotPasswordRequest request)
        {
            try
            {
                var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == request.Email);
                if (user == null)
                {
                    return new AuthResponse { Success = false, Message = "Bu email adresi ile kayıtlı kullanıcı bulunamadı." };
                }

                var resetToken = GenerateRandomToken();
                user.PasswordResetToken = resetToken;
                user.PasswordResetTokenExpiry = DateTime.UtcNow.AddHours(1);
                await _context.SaveChangesAsync();

                await SendPasswordResetEmailAsync(user.Email, user.Name, resetToken);

                return new AuthResponse
                {
                    Success = true,
                    Message = "Şifre sıfırlama linki email adresinize gönderildi."
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Şifre sıfırlama sırasında hata oluştu");
                return new AuthResponse { Success = false, Message = "Şifre sıfırlama sırasında bir hata oluştu." };
            }
        }

        public async Task<AuthResponse> ResetPasswordAsync(ResetPasswordRequest request)
        {
            try
            {
                var user = await _context.Users.FirstOrDefaultAsync(u => 
                    u.Email == request.Email && 
                    u.PasswordResetToken == request.Token &&
                    u.PasswordResetTokenExpiry > DateTime.UtcNow);

                if (user == null)
                {
                    return new AuthResponse { Success = false, Message = "Geçersiz veya süresi dolmuş token." };
                }

                if (request.NewPassword != request.ConfirmNewPassword)
                {
                    return new AuthResponse { Success = false, Message = "Yeni şifreler eşleşmiyor." };
                }

                user.PasswordHash = HashPassword(request.NewPassword);
                user.PasswordResetToken = null;
                user.PasswordResetTokenExpiry = null;
                await _context.SaveChangesAsync();

                return new AuthResponse
                {
                    Success = true,
                    Message = "Şifreniz başarıyla sıfırlandı."
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Şifre sıfırlama sırasında hata oluştu");
                return new AuthResponse { Success = false, Message = "Şifre sıfırlama sırasında bir hata oluştu." };
            }
        }

        public async Task<UserDto?> GetUserProfileAsync(int userId)
        {
            try
            {
                var user = await _context.Users
                    .FirstOrDefaultAsync(u => u.Id == userId);

                return user != null ? MapToUserDto(user) : null;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Kullanıcı profili alınırken hata oluştu");
                return null;
            }
        }



        private string HashPassword(string password)
        {
            using var sha256 = SHA256.Create();
            var hashedBytes = sha256.ComputeHash(Encoding.UTF8.GetBytes(password));
            return Convert.ToBase64String(hashedBytes);
        }

        private bool VerifyPassword(string password, string hash)
        {
            return HashPassword(password) == hash;
        }

        private string GenerateRandomToken()
        {
            return Convert.ToBase64String(Encoding.UTF8.GetBytes($"{Guid.NewGuid()}:{DateTime.UtcNow.Ticks}"));
        }

        private string GenerateJwtToken(User user)
        {
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
                Role = user.Role.ToString()
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