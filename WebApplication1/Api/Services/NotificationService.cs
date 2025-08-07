namespace WebApplication1.Api.Services
{
    public interface INotificationService
    {
        Task SendAppointmentConfirmationAsync(string email, string phone, string customerName, string serviceName, string therapistName, DateTime appointmentDateTime, decimal price);
        Task SendAppointmentReminderAsync(string email, string phone, string customerName, string serviceName, DateTime appointmentDateTime);
        Task SendAppointmentCancellationAsync(string email, string phone, string customerName, string serviceName, DateTime appointmentDateTime);
        Task ScheduleReminderAsync(int appointmentId, DateTime appointmentDateTime, string email, string phone, string customerName, string serviceName);
    }

    public class NotificationService : INotificationService
    {
        private readonly IEmailService _emailService;
        private readonly ISmsService _smsService;
        private readonly ILogger<NotificationService> _logger;

        public NotificationService(
            IEmailService emailService,
            ISmsService smsService,
            ILogger<NotificationService> logger)
        {
            _emailService = emailService;
            _smsService = smsService;
            _logger = logger;
        }

        public async Task SendAppointmentConfirmationAsync(string email, string phone, string customerName, string serviceName, string therapistName, DateTime appointmentDateTime, decimal price)
        {
            try
            {
                _logger.LogInformation($"Randevu onay bildirimleri gönderiliyor: {customerName}");

                // Email ve SMS'i paralel gönder
                var emailTask = _emailService.SendAppointmentConfirmationAsync(email, customerName, serviceName, therapistName, appointmentDateTime, price);
                var smsTask = _smsService.SendAppointmentConfirmationSmsAsync(phone, customerName, serviceName, appointmentDateTime);

                await Task.WhenAll(emailTask, smsTask);

                _logger.LogInformation($"Randevu onay bildirimleri başarıyla gönderildi: {customerName}");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Randevu onay bildirimleri gönderilirken hata: {customerName}");
            }
        }

        public async Task SendAppointmentReminderAsync(string email, string phone, string customerName, string serviceName, DateTime appointmentDateTime)
        {
            try
            {
                _logger.LogInformation($"Randevu hatırlatma bildirimleri gönderiliyor: {customerName}");

                // Email ve SMS'i paralel gönder
                var emailTask = _emailService.SendAppointmentReminderAsync(email, customerName, serviceName, appointmentDateTime);
                var smsTask = _smsService.SendAppointmentReminderSmsAsync(phone, customerName, serviceName, appointmentDateTime);

                await Task.WhenAll(emailTask, smsTask);

                _logger.LogInformation($"Randevu hatırlatma bildirimleri başarıyla gönderildi: {customerName}");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Randevu hatırlatma bildirimleri gönderilirken hata: {customerName}");
            }
        }

        public async Task SendAppointmentCancellationAsync(string email, string phone, string customerName, string serviceName, DateTime appointmentDateTime)
        {
            try
            {
                _logger.LogInformation($"Randevu iptal bildirimleri gönderiliyor: {customerName}");

                // Email ve SMS'i paralel gönder
                var emailTask = _emailService.SendAppointmentCancellationAsync(email, customerName, serviceName, appointmentDateTime);
                var smsTask = _smsService.SendAppointmentCancellationSmsAsync(phone, customerName, serviceName, appointmentDateTime);

                await Task.WhenAll(emailTask, smsTask);

                _logger.LogInformation($"Randevu iptal bildirimleri başarıyla gönderildi: {customerName}");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Randevu iptal bildirimleri gönderilirken hata: {customerName}");
            }
        }

        public async Task ScheduleReminderAsync(int appointmentId, DateTime appointmentDateTime, string email, string phone, string customerName, string serviceName)
        {
            try
            {
                // 24 saat öncesini hesapla
                var reminderTime = appointmentDateTime.AddDays(-1);
                
                // Şu anki zamandan önce ise hatırlatma gönderme
                if (reminderTime <= DateTime.Now)
                {
                    _logger.LogWarning($"Randevu çok yakın, hatırlatma gönderilmiyor: {appointmentId}");
                    return;
                }

                _logger.LogInformation($"Randevu hatırlatması zamanlandı: {appointmentId}, Hatırlatma zamanı: {reminderTime}");

                // Background service ile hatırlatma zamanla (şimdilik basit delay kullanıyoruz)
                // Gerçek projede Hangfire, Quartz.NET veya Azure Functions kullanılmalı
                _ = Task.Run(async () =>
                {
                    try
                    {
                        var delay = reminderTime - DateTime.Now;
                        if (delay > TimeSpan.Zero)
                        {
                            await Task.Delay(delay);
                            await SendAppointmentReminderAsync(email, phone, customerName, serviceName, appointmentDateTime);
                        }
                    }
                    catch (Exception ex)
                    {
                        _logger.LogError(ex, $"Background hatırlatma gönderilirken hata: {appointmentId}");
                    }
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Randevu hatırlatması zamanlanırken hata: {appointmentId}");
            }
        }
    }
}