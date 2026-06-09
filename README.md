# StayNest API

Backend REST API for StayNest Kenya — built with Node.js, Express, and PostgreSQL.

## Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Create account |
| POST | `/api/auth/login` | Sign in |
| GET | `/api/auth/me` | Get current user (auth required) |

### Properties
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/properties` | All properties (supports ?category, ?minPrice, ?maxPrice, ?guests, ?sort) |
| GET | `/api/properties/:id` | Single property |
| GET | `/api/properties/category/:category` | Properties by category |

### Bookings
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/bookings` | Create booking (auth required) |
| GET | `/api/bookings/my` | My bookings (auth required) |
| DELETE | `/api/bookings/:id` | Cancel booking (auth required) |

## Setup

```bash
git clone https://github.com/Qyde21/staynest-api.git
cd staynest-api
npm install
cp .env.example .env
# Fill in your .env values
npm run dev
```

## Environment Variables

```
PORT=5000
DATABASE_URL=postgresql://...
JWT_SECRET=your_secret_key
CLIENT_URL=http://localhost:3000
```

## Deploy on Railway

1. Push to GitHub
2. Go to railway.app → New Project → Deploy from GitHub
3. Add PostgreSQL plugin
4. Set environment variables
5. Run the schema: paste contents of `src/db/schema.sql` in Railway's PostgreSQL console
