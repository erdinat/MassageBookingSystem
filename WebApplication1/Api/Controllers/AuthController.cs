using Microsoft.AspNetCore.Mvc;
using WebApplication1.Api.Services;
using WebApplication1.Api.DTOs;

namespace WebApplication1.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;
        private readonly ILogger<AuthController> _logger;

        public AuthController(IAuthService authService, ILogger<AuthController> logger)
        {
            _authService = authService;
            _logger = logger;
        }

        [HttpPost("register")]
        public async Task<ActionResult<AuthResponse>> Register([FromBody] RegisterRequest request)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(new AuthResponse 
                    { 
                        Success = false, 
                        Message = "Geçersiz veri" 
                    });
                }

                var result = await _authService.RegisterAsync(request);
                
                if (result.Success)
                {
                    return Ok(result);
                }
                
                return BadRequest(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during registration");
                return StatusCode(500, new AuthResponse 
                { 
                    Success = false, 
                    Message = "Sunucu hatası" 
                });
            }
        }

        [HttpPost("login")]
        public async Task<ActionResult<AuthResponse>> Login([FromBody] LoginRequest request)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(new AuthResponse 
                    { 
                        Success = false, 
                        Message = "Geçersiz veri" 
                    });
                }

                var result = await _authService.LoginAsync(request);
                
                if (result.Success)
                {
                    return Ok(result);
                }
                
                return BadRequest(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during login");
                return StatusCode(500, new AuthResponse 
                { 
                    Success = false, 
                    Message = "Sunucu hatası" 
                });
            }
        }

        [HttpPost("forgot-password")]
        public async Task<ActionResult<AuthResponse>> ForgotPassword([FromBody] ForgotPasswordRequest request)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(new AuthResponse 
                    { 
                        Success = false, 
                        Message = "Geçersiz email adresi" 
                    });
                }

                var result = await _authService.ForgotPasswordAsync(request);
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during forgot password");
                return StatusCode(500, new AuthResponse 
                { 
                    Success = false, 
                    Message = "Sunucu hatası" 
                });
            }
        }

        [HttpPost("reset-password")]
        public async Task<ActionResult<AuthResponse>> ResetPassword([FromBody] ResetPasswordRequest request)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(new AuthResponse 
                    { 
                        Success = false, 
                        Message = "Geçersiz veri" 
                    });
                }

                var result = await _authService.ResetPasswordAsync(request);
                
                if (result.Success)
                {
                    return Ok(result);
                }
                
                return BadRequest(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during password reset");
                return StatusCode(500, new AuthResponse 
                { 
                    Success = false, 
                    Message = "Sunucu hatası" 
                });
            }
        }

        [HttpGet("profile/{userId}")]
        public async Task<ActionResult<UserDto>> GetProfile(int userId)
        {
            try
            {
                var user = await _authService.GetUserProfileAsync(userId);
                
                if (user == null)
                {
                    return NotFound(new { message = "Kullanıcı bulunamadı" });
                }
                
                return Ok(user);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting user profile");
                return StatusCode(500, new { message = "Sunucu hatası" });
            }
        }

        [HttpPut("profile/{userId}")]
        public async Task<ActionResult<AuthResponse>> UpdateProfile(int userId, [FromBody] UpdateProfileRequest request)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(new AuthResponse 
                    { 
                        Success = false, 
                        Message = "Geçersiz veri" 
                    });
                }

                var result = await _authService.UpdateProfileAsync(userId, request);
                
                if (result.Success)
                {
                    return Ok(result);
                }
                
                return BadRequest(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating profile");
                return StatusCode(500, new AuthResponse 
                { 
                    Success = false, 
                    Message = "Sunucu hatası" 
                });
            }
        }

        [HttpPost("change-password/{userId}")]
        public async Task<ActionResult<AuthResponse>> ChangePassword(int userId, [FromBody] ChangePasswordRequest request)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(new AuthResponse 
                    { 
                        Success = false, 
                        Message = "Geçersiz veri" 
                    });
                }

                var result = await _authService.ChangePasswordAsync(userId, request);
                
                if (result.Success)
                {
                    return Ok(result);
                }
                
                return BadRequest(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error changing password");
                return StatusCode(500, new AuthResponse 
                { 
                    Success = false, 
                    Message = "Sunucu hatası" 
                });
            }
        }

        [HttpPost("favorites/{userId}/add/{therapistId}")]
        public async Task<ActionResult> AddFavoriteTherapist(int userId, int therapistId)
        {
            try
            {
                var result = await _authService.AddFavoriteTherapistAsync(userId, therapistId);
                
                if (result)
                {
                    return Ok(new { message = "Terapist favorilere eklendi" });
                }
                
                return BadRequest(new { message = "Favorilere eklenirken hata oluştu" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error adding favorite therapist");
                return StatusCode(500, new { message = "Sunucu hatası" });
            }
        }

        [HttpDelete("favorites/{userId}/remove/{therapistId}")]
        public async Task<ActionResult> RemoveFavoriteTherapist(int userId, int therapistId)
        {
            try
            {
                var result = await _authService.RemoveFavoriteTherapistAsync(userId, therapistId);
                
                if (result)
                {
                    return Ok(new { message = "Terapist favorilerden çıkarıldı" });
                }
                
                return BadRequest(new { message = "Favorilerden çıkarılırken hata oluştu" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error removing favorite therapist");
                return StatusCode(500, new { message = "Sunucu hatası" });
            }
        }

        [HttpGet("favorites/{userId}")]
        public async Task<ActionResult<List<TherapistDto>>> GetFavoriteTherapists(int userId)
        {
            try
            {
                var favorites = await _authService.GetFavoriteTherapistsAsync(userId);
                return Ok(favorites);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting favorite therapists");
                return StatusCode(500, new { message = "Sunucu hatası" });
            }
        }
    }
}