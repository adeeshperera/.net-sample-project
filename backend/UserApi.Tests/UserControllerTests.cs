using Microsoft.EntityFrameworkCore;
using UserApi.Controllers;
using UserApi.Data;
using UserApi.Models;
using Xunit;

namespace UserApi.Tests
{
    public class UserControllerTests
    {
        private AppDbContext GetInMemoryContext()
        {
            var options = new DbContextOptionsBuilder<AppDbContext>()
                .UseInMemoryDatabase(Guid.NewGuid().ToString())
                .Options;
            return new AppDbContext(options);
        }

        [Fact]
        public async Task Register_CreatesNewUser()
        {
            var context = GetInMemoryContext();
            var controller = new UsersController(context);
            var dto = new RegisterDto { Email = "test@test.com", Password = "pass123" };

            var result = await controller.Register(dto);

            Assert.NotNull(result);
            Assert.Single(context.Users);
        }

        [Fact]
        public async Task Login_ReturnsUnauthorized_WhenInvalidCredentials()
        {
            var context = GetInMemoryContext();
            var controller = new UsersController(context);
            var dto = new LoginDto { Email = "wrong@test.com", Password = "wrong" };

            var result = await controller.Login(dto);

            Assert.IsType<Microsoft.AspNetCore.Mvc.UnauthorizedObjectResult>(result);
        }
    }
}
