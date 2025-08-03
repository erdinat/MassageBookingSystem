using Twilio;
using Twilio.Rest.Api.V2010.Account;
using Twilio.Types;

namespace WebApplication1.Api.Services
{
    public interface ISmsService
    {
        Task SendSmsAsync(string phoneNumber, string message);
        Task SendAppointmentConfirmationSmsAsync(string phoneNumber, string customerName, string serviceName, DateTime appointmentDateTime);
        Task SendAppointmentReminderSmsAsync(string phoneNumber, string customerName, string serviceName, DateTime appointmentDateTime);
        Task SendAppointmentCancellationSmsAsync(string phoneNumber, string customerName, string serviceName, DateTime appointmentDateTime);
    }

    public class SmsService : ISmsService
    {
        private readonly IConfiguration _configuration;
        private readonly ILogger<SmsService> _logger;

        public SmsService(IConfiguration configuration, ILogger<SmsService> logger)
        {
            _configuration = configuration;
            _logger = logger;
        }

        public async Task SendAppointmentConfirmationSmsAsync(string phoneNumber, string customerName, string serviceName, DateTime appointmentDateTime)
        {
            var message = $@"🌸 L'OR Masaj Merkezi

Sayın {customerName},
Randevunuz onaylandı!

🌿 Hizmet: {serviceName}
📅 Tarih: {appointmentDateTime:dd.MM.yyyy}
🕐 Saat: {appointmentDateTime:HH:mm}

24 saat önce hatırlatma mesajı alacaksınız.
Randevunuza 10 dk erken gelmenizi rica ederiz.

İyi günler! 🌸";

            await SendSmsAsync(phoneNumber, message);
        }

        public async Task SendAppointmentReminderSmsAsync(string phoneNumber, string customerName, string serviceName, DateTime appointmentDateTime)
        {
            var message = $@"⏰ Randevu Hatırlatması

Sayın {customerName},
Yarın randevunuz var!

🌿 {serviceName}
📅 {appointmentDateTime:dd.MM.yyyy} - {appointmentDateTime:HH:mm}

L'OR Masaj Merkezi'nde görüşmek üzere! 🌸";

            await SendSmsAsync(phoneNumber, message);
        }

        public async Task SendAppointmentCancellationSmsAsync(string phoneNumber, string customerName, string serviceName, DateTime appointmentDateTime)
        {
            var message = $@"❌ Randevu İptali

Sayın {customerName},
{appointmentDateTime:dd.MM.yyyy} {appointmentDateTime:HH:mm} tarihindeki {serviceName} randevunuz iptal edilmiştir.

Yeni randevu için: www.lor-masaj.com

L'OR Masaj Merkezi 🌸";

            await SendSmsAsync(phoneNumber, message);
        }

        public async Task SendSmsAsync(string phoneNumber, string message)
        {
            try
            {
                var accountSid = _configuration["TwilioSettings:AccountSid"];
                var authToken = _configuration["TwilioSettings:AuthToken"];
                var fromNumber = _configuration["TwilioSettings:PhoneNumber"];

                if (string.IsNullOrEmpty(accountSid) || string.IsNullOrEmpty(authToken) || string.IsNullOrEmpty(fromNumber))
                {
                    _logger.LogWarning("Twilio ayarları bulunamadı. SMS gönderilemiyor.");
                    return;
                }

                TwilioClient.Init(accountSid, authToken);

                // Türkiye telefon numarası formatını kontrol et ve düzelt
                var formattedNumber = FormatPhoneNumber(phoneNumber);

                var smsMessage = await MessageResource.CreateAsync(
                    body: message,
                    from: new PhoneNumber(fromNumber),
                    to: new PhoneNumber(formattedNumber)
                );

                _logger.LogInformation($"SMS başarıyla gönderildi: {formattedNumber}, SID: {smsMessage.Sid}");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"SMS gönderilirken hata oluştu: {phoneNumber}");
                // Hata durumunda uygulama çökmemeli, sadece log atılmalı
            }
        }

        private string FormatPhoneNumber(string phoneNumber)
        {
            // Türkiye telefon numarası formatlaması
            phoneNumber = phoneNumber.Replace(" ", "").Replace("-", "").Replace("(", "").Replace(")", "");
            
            if (phoneNumber.StartsWith("0"))
            {
                phoneNumber = "+90" + phoneNumber.Substring(1);
            }
            else if (!phoneNumber.StartsWith("+90"))
            {
                phoneNumber = "+90" + phoneNumber;
            }

            return phoneNumber;
        }
    }
}