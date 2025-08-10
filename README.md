# SkillMatch Server

An Express TypeScript server for the SkillMatch application.

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn

## Installation

1. Install dependencies:

```bash
npm install
```

## Development

To start the development server with hot reload:

```bash
npm run dev
```

The server will start on `http://localhost:3000`

## Production

To build and run the production server:

```bash
npm run build
npm start
```

## Available Endpoints

- `GET /` - Welcome message
- `GET /health` - Health check endpoint
- `POST /api/send-mail` - Send email endpoint

### Email Endpoint Usage

The `/api/send-mail` endpoint accepts POST requests with the following JSON body:

```json
{
  "email": "recipient@example.com",
  "subject": "Welcome to SkillMatch",
  "template": "welcome.ejs",
  "data": {
    "name": "John Doe",
    "message": "Welcome to our platform!",
    "websiteUrl": "https://skillmatch.com"
  }
}
```

**Required fields:**

- `email`: Recipient's email address
- `subject`: Email subject line
- `template`: EJS template filename (without .ejs extension)

**Optional fields:**

- `data`: Object containing variables to pass to the EJS template

## Project Structure

```
src/
├── index.ts          # Main server file
├── routes/           # Route handlers (to be added)
├── controllers/      # Business logic (to be added)
├── models/           # Data models (to be added)
└── middleware/       # Custom middleware (to be added)
```

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Server Configuration
PORT=3001

# Database Configuration
DATABASE_URL=postgresql://username:password@host:port/database

# Frontend URL (for email verification links)
FRONTEND_URL=http://localhost:3000

# SMTP Configuration for Email Service
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

**Note:** For Gmail, you need to use an App Password, not your regular password. To generate an App Password:

1. Go to your Google Account settings
2. Enable 2-Step Verification if not already enabled
3. Go to Security > App passwords
4. Generate a new app password for "Mail"

## Database

This project uses **NeonDB** (PostgreSQL) for data storage. The database connection is automatically established when the server starts.

### Database Schema

The following tables are automatically created:

- **users**: User accounts and authentication
- **user_profiles**: Extended user information
- **projects**: User projects and portfolios
- **connections**: Networking connections between users
- **messages**: Direct messages between users
- **skills**: Available skills and categories
- **user_skills**: Many-to-many relationship between users and skills

### Getting Your NeonDB Connection String

1. Sign up at [neon.tech](https://neon.tech)
2. Create a new project
3. Copy the connection string from your project dashboard
4. Add it to your `.env` file as `DATABASE_URL`

Example connection string:

```
postgresql://username:password@ep-xyz-123456.us-east-2.aws.neon.tech/database
```
