import express, { NextFunction, Request, Response } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { createServer } from "http";
import { Server } from "socket.io";
import prisma from "./lib/prisma";
import { setupSocketHandlers } from "./socket/handlers";
import { setupTournamentHandlers } from "./socket/tournament";
import { getUserIdFromToken } from "./auth/identity";

const app = express();
const PORT = 3000;

const corsOptions = {
  origin: ["http://localhost:5173", "http://localhost:8080"],
  methods: ["GET", "POST"],
  credentials: true,
};

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: corsOptions,
});

app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());

type AuthedRequest = Request & { userId?: string };

async function requireAuth(req: Request, res: Response, next: NextFunction) {
  const authedReq = req as AuthedRequest;
  const token = authedReq.cookies?.access_token as string | undefined;

  if (!token) {
    return res.status(401).json({ error: "Authentication required" });
  }

  const userId = await getUserIdFromToken(token);
  if (!userId) {
    return res.status(401).json({ error: "Invalid token" });
  }

  authedReq.userId = userId;
  return next();
}

app.get("/", (_req, res) => {
  res.json({ message: "Welcome to the API" });
});

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

// Public route
app.get("/api/leaderboard", async (_req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: { id: true, username: true, wins: true, losses: true },
      orderBy: { wins: "desc" },
      take: 20,
    });
    res.json(users);
  } catch {
    res.status(500).json({ error: "Internal server error" });
  }
});

// Private routes (no :id from client)
app.get("/api/me/stats", requireAuth, async (req, res) => {
  const userId = (req as AuthedRequest).userId;
  if (!userId) return res.status(401).json({ error: "Authentication required" });

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, username: true, wins: true, losses: true },
  });

  if (!user) return res.status(404).json({ error: "User not found" });
  return res.json(user);
});

app.get("/api/me/games", requireAuth, async (req, res) => {
  try {
    const userId = (req as AuthedRequest).userId as string;
    const games = await prisma.game.findMany({
      where: {
        OR: [{ playerXId: userId }, { playerOId: userId }],
      },
      include: {
        User_Game_playerXIdToUser: { select: { id: true, username: true } },
        User_Game_playerOIdToUser: { select: { id: true, username: true } },
      },
      orderBy: { created_at: "desc" },
    });
    return res.json(games);
  } catch {
    return res.status(500).json({ error: "Internal server error" });
  }
});

app.get("/api/me/tournaments", requireAuth, async (req, res) => {
  try {
    const userId = (req as AuthedRequest).userId as string;
    const entries = await prisma.tournamentParticipant.findMany({
      where: { userId },
      include: {
        Tournament: {
          include: {
            User_Tournament_winnerIdToUser: { select: { id: true, username: true } },
            User_Tournament_creatorIdToUser: { select: { id: true, username: true } },
          },
        },
      },
      orderBy: { Tournament: { created_at: "desc" } },
    });

    const result = entries.map((entry) => ({
      tournamentId: entry.tournamentId,
      name: entry.Tournament.name,
      status: entry.Tournament.status,
      creator: entry.Tournament.User_Tournament_creatorIdToUser,
      userStatus:
        entry.Tournament.winnerId === userId
          ? "winner"
          : entry.eliminated || entry.Tournament.status === "finished"
          ? "eliminated"
          : "playing",
      eliminatedInRound: entry.eliminated_in_round,
      eliminated: entry.eliminated,
      seed: entry.seed,
      tournamentWinner: entry.Tournament.User_Tournament_winnerIdToUser,
      createdAt: entry.Tournament.created_at,
    }));

    return res.json(result);
  } catch {
    return res.status(500).json({ error: "Internal server error" });
  }
});

setupSocketHandlers(io);
setupTournamentHandlers(io);

httpServer.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});