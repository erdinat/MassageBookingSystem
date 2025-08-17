using MailKit.Net.Smtp;
using MimeKit;
using MimeKit.Text;

namespace WebApplication1.Api.Services
{
    public interface IEmailService
    {
        Task SendEmailAsync(string toEmail, string subject, string htmlBody);
        Task SendAppointmentConfirmationAsync(string toEmail, string customerName, string serviceName, string therapistName, DateTime appointmentDateTime, decimal price);
        Task SendAppointmentReminderAsync(string toEmail, string customerName, string serviceName, DateTime appointmentDateTime);
        Task SendAppointmentCancellationAsync(string toEmail, string customerName, string serviceName, DateTime appointmentDateTime);
    }

    public class EmailService : IEmailService
    {
        private readonly IConfiguration _configuration;
        private readonly ILogger<EmailService> _logger;

        public EmailService(IConfiguration configuration, ILogger<EmailService> logger)
        {
            _configuration = configuration;
            _logger = logger;
        }

        public async Task SendAppointmentConfirmationAsync(string toEmail, string customerName, string serviceName, string therapistName, DateTime appointmentDateTime, decimal price)
        {
            var subject = "🌸 Randevu Onayı - L'OR Masaj Merkezi";
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
        .appointment-details {{ background-color: #F5F1E8; border: 2px solid #D4B896; border-radius: 8px; padding: 20px; margin: 20px 0; }}
        .detail-row {{ display: flex; justify-content: space-between; margin: 10px 0; padding: 5px 0; border-bottom: 1px solid #D4B896; }}
        .footer {{ background-color: #8B6F47; color: white; padding: 20px; text-align: center; }}
        .price {{ font-size: 24px; font-weight: bold; color: #8B6F47; }}
    </style>
</head>
<body>
    <div class='container'>
        <div class='header'>
            <h1>🌸 L'OR Masaj Merkezi</h1>
            <h2>Randevunuz Onaylandı!</h2>
        </div>
        <div class='content'>
            <p>Sayın <strong>{customerName}</strong>,</p>
            <p>Randevunuz başarıyla oluşturulmuştur. Aşağıda randevu detaylarınızı bulabilirsiniz:</p>
            
            <div class='appointment-details'>
                <h3 style='color: #8B6F47; margin-top: 0;'>Randevu Detayları</h3>
                <div class='detail-row'>
                    <span><strong>🌿 Hizmet:</strong></span>
                    <span>{serviceName}</span>
                </div>
                <div class='detail-row'>
                    <span><strong>👨‍⚕️ Terapist:</strong></span>
                    <span>{therapistName}</span>
                </div>
                <div class='detail-row'>
                    <span><strong>📅 Tarih:</strong></span>
                    <span>{appointmentDateTime:dd MMMM yyyy}</span>
                </div>
                <div class='detail-row'>
                    <span><strong>🕐 Saat:</strong></span>
                    <span>{appointmentDateTime:HH:mm}</span>
                </div>
                <div class='detail-row'>
                    <span><strong>💰 Ücret:</strong></span>
                    <span class='price'>₺{price}</span>
                </div>
            </div>
            
            <p><strong>📝 Önemli Notlar:</strong></p>
            <ul>
                <li>Randevunuzdan 24 saat önce hatırlatma mesajı alacaksınız</li>
                <li>İptal veya değişiklik için en az 2 saat önceden bildiriniz</li>
                <li>Randevunuza 10 dakika erken gelmenizi öneririz</li>
            </ul>
        </div>
        <div class='footer'>
            <p>L'OR Masaj Merkezi<br>
            📞 0555 123 45 67 | 📧 info@lor-masaj.com<br>
            🌐 www.lor-masaj.com</p>
        </div>
    </div>
</body>
</html>";

            await SendEmailAsync(toEmail, subject, htmlBody);
        }

        public async Task SendAppointmentReminderAsync(string toEmail, string customerName, string serviceName, DateTime appointmentDateTime)
        {
            var subject = "⏰ Randevu Hatırlatması - L'OR Masaj Merkezi";
            var htmlBody = $@"
<!DOCTYPE html>
<html>
<head>
    <meta charset='utf-8'>
    <style>
        body {{ font-family: Arial, sans-serif; background-color: #F5F1E8; margin: 0; padding: 20px; }}
        .container {{ max-width: 600px; margin: 0 auto; background-color: white; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 12px rgba(139, 111, 71, 0.2); }}
        .header {{ background: linear-gradient(135deg, #FF8C00, #FFB347); color: white; padding: 30px; text-align: center; }}
        .content {{ padding: 30px; text-align: center; }}
        .reminder-box {{ background-color: #FFF8DC; border: 2px solid #FFB347; border-radius: 8px; padding: 20px; margin: 20px 0; }}
        .time-highlight {{ font-size: 32px; font-weight: bold; color: #FF8C00; }}
    </style>
</head>
<body>
    <div class='container'>
        <div class='header'>
            <h1>⏰ Randevu Hatırlatması</h1>
        </div>
        <div class='content'>
            <p>Sayın <strong>{customerName}</strong>,</p>
            <div class='reminder-box'>
                <h2 style='color: #FF8C00; margin-top: 0;'>Yarın Randevunuz Var!</h2>
                <p><strong>🌿 Hizmet:</strong> {serviceName}</p>
                <p><strong>📅 Tarih:</strong> {appointmentDateTime:dd MMMM yyyy}</p>
                <p class='time-highlight'>{appointmentDateTime:HH:mm}</p>
            </div>
            <p>Randevunuza 10 dakika erken gelmenizi rica ederiz.</p>
            <p>Görüşmek üzere! 🌸</p>
        </div>
    </div>
</body>
</html>";

            await SendEmailAsync(toEmail, subject, htmlBody);
        }

        public async Task SendAppointmentCancellationAsync(string toEmail, string customerName, string serviceName, DateTime appointmentDateTime)
        {
            var subject = "❌ Randevu İptali - L'OR Masaj Merkezi";
            var htmlBody = $@"
<!DOCTYPE html>
<html>
<head>
    <meta charset='utf-8'>
    <style>
        body {{ font-family: Arial, sans-serif; background-color: #F5F1E8; margin: 0; padding: 20px; }}
        .container {{ max-width: 600px; margin: 0 auto; background-color: white; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 12px rgba(139, 111, 71, 0.2); }}
        .header {{ background: linear-gradient(135deg, #DC143C, #FF6B6B); color: white; padding: 30px; text-align: center; }}
        .content {{ padding: 30px; text-align: center; }}
        .cancellation-box {{ background-color: #FFE4E1; border: 2px solid #FF6B6B; border-radius: 8px; padding: 20px; margin: 20px 0; }}
    </style>
</head>
<body>
    <div class='container'>
        <div class='header'>
            <h1>❌ Randevu İptali</h1>
        </div>
        <div class='content'>
            <p>Sayın <strong>{customerName}</strong>,</p>
            <div class='cancellation-box'>
                <h2 style='color: #DC143C; margin-top: 0;'>Randevunuz İptal Edildi</h2>
                <p><strong>🌿 Hizmet:</strong> {serviceName}</p>
                <p><strong>📅 Tarih:</strong> {appointmentDateTime:dd MMMM yyyy} - {appointmentDateTime:HH:mm}</p>
            </div>
            <p>Yeni bir randevu oluşturmak için web sitemizi ziyaret edebilirsiniz.</p>
            <p>Teşekkür ederiz! 🌸</p>
        </div>
    </div>
</body>
</html>";

            await SendEmailAsync(toEmail, subject, htmlBody);
        }

        public async Task SendEmailAsync(string toEmail, string subject, string htmlBody)
        {
            try
            {
                var host = _configuration["EmailSettings:Host"];
                var port = int.Parse(_configuration["EmailSettings:Port"]);
                var username = _configuration["EmailSettings:Username"];
                var password = _configuration["EmailSettings:Password"];

                // Test modu - gerçek email bilgileri yoksa sadece log at
                if (string.IsNullOrEmpty(username) || username == "test@example.com" || 
                    string.IsNullOrEmpty(password) || password == "testpassword")
                {
                    _logger.LogInformation("=== EMAIL TEST MODE ===");
                    _logger.LogInformation($"To: {toEmail}");
                    _logger.LogInformation($"Subject: {subject}");
                    _logger.LogInformation($"Body: {htmlBody}");
                    _logger.LogInformation("=== END EMAIL TEST MODE ===");
                    return;
                }

                var email = new MimeMessage();
                email.From.Add(new MailboxAddress("L'OR Masaj Merkezi", username));
                email.To.Add(MailboxAddress.Parse(toEmail));
                email.Subject = subject;
                email.Body = new TextPart(TextFormat.Html) { Text = htmlBody };

                using var smtp = new SmtpClient();
                await smtp.ConnectAsync(host, port, MailKit.Security.SecureSocketOptions.StartTls);
                await smtp.AuthenticateAsync(username, password);
                await smtp.SendAsync(email);
                await smtp.DisconnectAsync(true);

                _logger.LogInformation($"Email başarıyla gönderildi: {toEmail}");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Email gönderilirken hata oluştu: {toEmail}");
            }
        }
    }
}