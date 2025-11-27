## Quick Start

```bash
# Database
docker compose up -d

# Backend (http://localhost:5135)
cd backend/UserApi
dotnet ef database update
dotnet run

# Frontend (http://localhost:3000)
cd frontend
npm install
npm run dev
```

## Configuration

Update `backend/UserApi/appsettings.json`:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=localhost;Port=5433;Database=userdb;Username=admin;Password=admin123"
  },
  "Stripe": {
    "SecretKey": "sk_test_xxx",
    "PublishableKey": "pk_test_xxx"
  }
}
```

Get keys from https://dashboard.stripe.com/test/apikeys

## API Endpoints

- **POST** `/api/users/register` - Register user with email/password
- **POST** `/api/users/login` - Login and get user data
- **GET** `/api/users` - List all users
- **DELETE** `/api/users/{id}` - Delete user
- **GET** `/api/payment/config` - Get Stripe publishable key
- **POST** `/api/payment/create-checkout-session` - Start payment (body: `{userId}`)
- **POST** `/api/payment/verify-payment` - Verify payment (body: `{sessionId}`)

## Frontend Routes

- `/register` - Registration form
- `/login` - Login form  
- `/payment` - Stripe checkout (requires login)
- `/payment/success` - Payment success
- `/payment/cancel` - Payment cancelled

## Flows

**Register**: /register → email/password → /login

**Login**: /login → credentials → localStorage → home

**Payment**: /payment → Stripe Checkout → complete payment → /payment/success → verify → HasPaid = true

## Testing

```bash
# Unit tests
cd backend/UserApi.Tests
dotnet test

# Use Postman for API testing (base URL: http://localhost:5135)
# Test card: 4242 4242 4242 4242 (any future date, any CVC)
```

## Data Model

User table: `Id` (int), `Email` (string, unique), `PasswordHash` (string), `HasPaid` (bool), `CreatedAt` (DateTime)

## Security

- Passwords hashed with BCrypt
- Stripe handles card data (PCI compliant)
- CORS enabled for localhost:3000
