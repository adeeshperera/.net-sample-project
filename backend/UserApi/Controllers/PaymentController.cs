using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Stripe;
using Stripe.Checkout;
using UserApi.Data;

namespace UserApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class PaymentController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IConfiguration _config;

        public PaymentController(AppDbContext context, IConfiguration config)
        {
            _context = context;
            _config = config;
            StripeConfiguration.ApiKey = config["Stripe:SecretKey"];
        }

        [HttpPost("create-checkout-session")]
        public async Task<IActionResult> CreateCheckoutSession([FromBody] CreateSessionRequest request)
        {
            var options = new SessionCreateOptions
            {
                PaymentMethodTypes = new List<string> { "card" },
                LineItems = new List<SessionLineItemOptions>
                {
                    new SessionLineItemOptions
                    {
                        PriceData = new SessionLineItemPriceDataOptions
                        {
                            Currency = "usd",
                            UnitAmount = 100, // $1.00 in cents
                            ProductData = new SessionLineItemPriceDataProductDataOptions
                            {
                                Name = "Registration Fee"
                            }
                        },
                        Quantity = 1
                    }
                },
                Mode = "payment",
                SuccessUrl = $"http://localhost:3000/payment/success?session_id={{CHECKOUT_SESSION_ID}}&user_id={request.UserId}",
                CancelUrl = "http://localhost:3000/payment/cancel",
                Metadata = new Dictionary<string, string>
                {
                    { "userId", request.UserId.ToString() }
                }
            };

            var service = new SessionService();
            var session = await service.CreateAsync(options);

            return Ok(new { sessionId = session.Id, url = session.Url });
        }

        [HttpPost("verify-payment")]
        public async Task<IActionResult> VerifyPayment([FromBody] VerifyPaymentRequest request)
        {
            var service = new SessionService();
            var session = await service.GetAsync(request.SessionId);

            if (session.PaymentStatus == "paid")
            {
                var userId = int.Parse(session.Metadata["userId"]);
                var user = await _context.Users.FindAsync(userId);
                if (user != null)
                {
                    user.HasPaid = true;
                    await _context.SaveChangesAsync();
                }
                return Ok(new { success = true });
            }

            return BadRequest("Payment not completed");
        }

        [HttpGet("config")]
        public IActionResult GetConfig()
        {
            return Ok(new { publishableKey = _config["Stripe:PublishableKey"] });
        }
    }

    public class CreateSessionRequest
    {
        public int UserId { get; set; }
    }

    public class VerifyPaymentRequest
    {
        public string SessionId { get; set; } = string.Empty;
    }
}
