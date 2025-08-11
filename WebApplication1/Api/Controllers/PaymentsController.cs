using Microsoft.AspNetCore.Mvc;
using System.ComponentModel.DataAnnotations;

namespace WebApplication1.Api.Controllers
{
    public class PaymentRequest
    {
        [Required]
        public string PaymentMethod { get; set; } = ""; // "card" | "cash"
        [Range(0, double.MaxValue)]
        public decimal Amount { get; set; }

        // Card-only fields (göstermelik)
        public string? CardNumber { get; set; }
        public string? CardHolder { get; set; }
        public string? Expiry { get; set; } // MM/YY
        public string? Cvv { get; set; }
    }

    public class PaymentResponse
    {
        public bool Success { get; set; }
        public string TransactionId { get; set; } = string.Empty;
        public string Message { get; set; } = string.Empty;
    }

    [ApiController]
    [Route("api/[controller]")]
    public class PaymentsController : ControllerBase
    {
        [HttpPost("simulate")]
        public async Task<ActionResult<PaymentResponse>> Simulate([FromBody] PaymentRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.PaymentMethod))
            {
                return BadRequest("Ödeme yöntemi gereklidir.");
            }

            // Gösterim amaçlı bekletme
            await Task.Delay(1200);

            if (request.PaymentMethod.Equals("card", StringComparison.OrdinalIgnoreCase))
            {
                // Basit sahte doğrulamalar
                if (string.IsNullOrWhiteSpace(request.CardNumber) || request.CardNumber.Replace(" ", "").Length < 12)
                {
                    return BadRequest("Kart numarası geçersiz.");
                }
                if (string.IsNullOrWhiteSpace(request.Cvv) || request.Cvv.Length < 3)
                {
                    return BadRequest("CVV geçersiz.");
                }
                if (string.IsNullOrWhiteSpace(request.CardHolder) || string.IsNullOrWhiteSpace(request.Expiry))
                {
                    return BadRequest("Kart sahibi ve son kullanma tarihi zorunludur.");
                }

                // Basit başarısızlık simülasyonu: 0000 ile biten kartlar hata versin
                var compact = request.CardNumber.Replace(" ", "");
                if (compact.EndsWith("0000"))
                {
                    return Ok(new PaymentResponse
                    {
                        Success = false,
                        TransactionId = Guid.NewGuid().ToString("N"),
                        Message = "İşlem bankanız tarafından reddedildi."
                    });
                }

                return Ok(new PaymentResponse
                {
                    Success = true,
                    TransactionId = Guid.NewGuid().ToString("N"),
                    Message = "Ödeme başarıyla gerçekleştirildi."
                });
            }

            if (request.PaymentMethod.Equals("cash", StringComparison.OrdinalIgnoreCase))
            {
                // Nakit için direkt onaylı gibi davranıyoruz
                return Ok(new PaymentResponse
                {
                    Success = true,
                    TransactionId = Guid.NewGuid().ToString("N"),
                    Message = "Nakit ödeme onaylandı (göstermelik)."
                });
            }

            return BadRequest("Desteklenmeyen ödeme yöntemi.");
        }
    }
}


