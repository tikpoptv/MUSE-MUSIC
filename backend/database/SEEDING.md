# Database Seeding Guide

## Overview

Database seeding script for MUSE Music that uses the same password hashing method as the backend (bcrypt with 12 salt rounds)

## Features

- ✅ Password hashing with bcrypt (saltRounds = 12) same as backend
- ✅ Test user data with working credentials
- ✅ Sample artists and songs data
- ✅ Transaction-based seeding (rollback on error)
- ✅ Auto-clear existing data before seeding

## Quick Start

### 1. Seed Database (Development)

```bash
cd backend
npm run db:seed
```

### 2. Reset and Seed Everything

```bash
npm run db:fresh
```

## Available Commands

| Command | Description |
|---------|-------------|
| `npm run db:seed` | Seed database (uses current env) |
| `npm run db:seed:dev` | Seed development database |
| `npm run db:seed:prod` | Seed production database |
| `npm run db:fresh` | Reset database + Seed again |
| `npm run db:fresh:dev` | Reset + Seed (development) |

## Test Credentials

After running seed, you can login with these credentials:

### Admin Account
```
Username: admin
Password: Admin@123456
Email: admin@musemusic.com
Role: admin
```

### Test User Account
```
Username: testuser
Password: Test@123456
Email: testuser@example.com
Role: customer
```

### Other Test Accounts

| Username | Password | Email | Role |
|----------|----------|-------|------|
| john_doe | John@123456 | john@example.com | customer |
| jane_smith | Jane@123456 | jane@example.com | customer |
| reviewer | Reviewer@123456 | reviewer@musemusic.com | admin |

## What Gets Seeded

### 1. Users (5 accounts)
- 2 admin accounts (admin, reviewer)
- 3 customer accounts (testuser, john_doe, jane_smith)
- Password hashed with bcrypt (saltRounds = 12)
- Terms accepted = true
- Login status = offline

### 2. Customers (3 profiles)
- Customer profiles for non-admin users
- DOB, country, timezone, preferred language
- Default: Thailand, Asia/Bangkok, Thai

## Security

### Password Hashing

```javascript
// Same as backend userService.js
const SALT_ROUNDS = 12;
const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
```

### Password Requirements

According to `backend/src/utils/passwordValidation.js`:
- At least 8 characters
- At least 1 uppercase letter
- At least 1 lowercase letter
- At least 1 number
- At least 1 special character (@$!%*?&)

## Customization

### Add New Users

Edit `backend/database/scripts/seed.js`:

```javascript
const seedData = {
  users: [
    // ... existing users
    {
      username: 'newuser',
      email: 'newuser@example.com',
      password: 'Password@123',
      fullName: 'New User',
      role: 'customer',
      provider: 'local',
      termsAccepted: true
    }
  ]
};
```

## Troubleshooting

### Error: "password must be between 8 and 72 characters"

- bcrypt has a max limit of 72 characters
- Use passwords shorter than 72 characters

### Error: "foreign key constraint"

- Check that migrations have run: `npm run migrate`
- Try running: `npm run db:fresh`

### Error: "duplicate key value"

- Data already exists
- Try running: `npm run db:reset` then `npm run db:seed` again

## Development Workflow

### 1. First Time Setup
```bash
npm run migrate      # Create schema
npm run db:seed      # Seed data
```

### 2. Reset Everything
```bash
npm run db:fresh     # reset + seed again
```

### 3. Add More Data
```bash
# Edit seed.js
npm run db:seed      # Seed additional data
```

## Testing with Seeded Data

### Test Login
```bash
# Start backend
npm run dev

# Test login (use Postman/curl)
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "password": "Test@123456"
  }'
```

### Verify Password Hash
```bash
# Check in database
psql -h localhost -U postgres -d muse_music
SELECT username, password FROM Users WHERE username = 'testuser';

# Password should start with $2b$ (bcrypt hash)
```

## Production Use

⚠️ **WARNING**: Do NOT seed production with test data!

If you need to seed production:
1. Create a separate seed file for production
2. Use secure passwords (not test passwords)
3. Do not commit production credentials in git

## Files

| File | Description |
|------|-------------|
| `database/scripts/seed.js` | Main seed script |
| `database/SEEDING.md` | This documentation |
| `package.json` | npm scripts definitions |

## Related Commands

- `npm run migrate` - Run migrations
- `npm run db:reset` - Clear all data
- `npm run db:fresh` - Reset + Seed
- `npm test` - Run tests with seeded data

## Support

If you encounter issues:
1. Check `.env` file (DATABASE_URL)
2. Check PostgreSQL is running
3. Check migrations are completed
4. Check logs in console

---

**Last Updated**: 2025-12-11  
**Version**: 1.0.0
