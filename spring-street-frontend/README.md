# Spring Street Frontend

Next.js dashboard for the Spring Street Market Insights & Portfolio Analytics backend.

## Run

Start the Go backend first:

```bash
cd ../spring-street-backend
go run main.go
```

Then start the frontend:

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

The frontend reads live data from `NEXT_PUBLIC_API_BASE_URL`, defaulting to `http://localhost:8080`.
