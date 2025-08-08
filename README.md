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

## Project Structure

```
src/
├── index.ts          # Main server file
├── routes/           # Route handlers (to be added)
├── controllers/      # Business logic (to be added)
├── models/           # Data models (to be added)
└── middleware/       # Custom middleware (to be added)
```

## Database

This project is configured to use NeonDB. Database configuration will be added when you're ready to set up the database connection.
