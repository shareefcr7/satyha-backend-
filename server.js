app.use(cors({
  origin: [
    "http://localhost:3000",
    "http://localhost:3001",

    "https://clear-glass-frontend.vercel.app",
    "https://clear-glass-frontend-lfez.vercel.app"
  ],
  credentials: true
}));