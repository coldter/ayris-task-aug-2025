# ayris-task

## Requirements

[Task Definition PDF](./task.pdf)

## Deployment

URL: [https://ayris-task.vercel.app/](https://ayris-task.vercel.app/)

API Docs: [https://ayris-task.vercel.app/edge/docs](https://ayris-task.vercel.app/edge/docs)

Auth API Docs(Better-Auth): [https://ayris-task.vercel.app/edge/docs/auth](https://ayris-task.vercel.app/edge/docs/auth)

## Getting Started

This project uses PostgreSQL with Drizzle ORM.

1. Make sure you have a PostgreSQL database set up.
2. Update your `apps/server/.env` file with your PostgreSQL connection details.

3. Apply the schema to your database:
```bash
npm run db:push
```


Then, run the development server:

```bash
npm run dev
```

Open [http://localhost:3001](http://localhost:3001) in your browser to see the web application.
The API is running at [http://localhost:3000](http://localhost:3000).



## Project Structure

```
ayris-task/
├── apps/
│   ├── web/         # Frontend application (React + TanStack Router)
│   └── server/      # Backend API (Hono)
```

## Available Scripts

- `npm run dev`: Start all applications in development mode
- `npm run build`: Build all applications
- `npm run dev:web`: Start only the web application
- `npm run dev:server`: Start only the server
- `npm run check-types`: Check TypeScript types across all apps
- `npm run db:push`: Push schema changes to database
- `npm run db:studio`: Open database studio UI
- `npm run check`: Run Biome formatting and linting
