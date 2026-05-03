import express, { NextFunction, Request, Response } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { createServer } from "http";
import { Server } from "socket.io";
import prisma from "./lib/prisma";
import {
  setupSocketHandlers,
} from "./socket/handlers";
import { setupTournamentHandlers } from "./socket/tournament/tournament";
import { setupTournamentHandlers } from "./socket/tournament/tournament";
import { getUserIdFromToken } from "./auth/identity";
import { getRankedUsers } from "./socket/onevone/leaderboardService";
import { isPlayerInActiveMatch } from "./socket/onevone/lobbyPresence";
import { players } from "./socket/onevone/onevoneState";
import { getRankedUsers } from "./socket/onevone/leaderboardService";
import { isPlayerInActiveMatch } from "./socket/onevone/lobbyPresence";
import { players } from "./socket/onevone/onevoneState";

const app = express();
const PORT = 3000;
const CORE = process.env.SECRET_KEY;
const corsOptions = {
  origin: [
    "http://localhost:8080",
    "http://localhost:5173",
    "http://localhost:5173",
    "https://localhost:8443",
    "https://10.30.246.78:8443",
    CORE,
  ],
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
    const ranked = await getRankedUsers();
    return res.json(ranked.slice(0, 20));
  } catch {
    return res.status(500).json({ error: "Internal server error" });
  }
});

// Private routes (no :id from client)
app.get("/api/me/stats", requireAuth, async (req, res) => {
  try {
    const userId = (req as AuthedRequest).userId;
    if (!userId) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const [ranked, tournamentWins] = await Promise.all([
      getRankedUsers(),
      prisma.tournament.count({
        where: { winnerId: userId, status: "finished" },
      }),
    ]);

    const me = ranked.find((u) => u.id === userId);
    if (!me) return res.status(404).json({ error: "User not found" });

    return res.json({
      ...me,
      tournamentWins,
    });
  } catch {
    return res.status(500).json({ error: "Internal server error" });
  }
});

app.get("/api/:id/games", requireAuth, async (req, res) => {
  try {
    const userId = req.params.id?.trim();
    if (!userId) {
      return res.status(400).json({ error: "User id is required" });
    }
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

app.get("/api/users/:id/status", async (req, res) => {
  try {
    const userId = req.params.id?.trim();
    if (!userId) {
      return res.status(400).json({ error: "User id is required" });
    }

    const [user, rankedUsers, tournamentJoined, tournamentWins] = await Promise.all([
      prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, username: true, status: true },
      }),
      getRankedUsers(),
      prisma.tournamentParticipant.count({
        where: { userId },
      }),
      prisma.tournament.count({
        where: { winnerId: userId, status: "finished" },
      }),
    ]);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const ranked = rankedUsers.find((u) => u.id === userId);

    const isPlaying = isPlayerInActiveMatch(userId);
    const isOnline = players.has(userId);

    const status = isPlaying
      ? "playing"
      : isOnline
      ? "online"
      : (user.status || "offline").toLowerCase();

    return res.json({
      id: user.id,
      username: user.username,
      status,
      rank: ranked?.rank ?? null,
      xp: ranked?.xp ?? 0,
      wins: ranked?.wins ?? 0,
      losses: ranked?.losses ?? 0,
      tournamentWins,
      tournamentJoined,
    });
  } catch {
    return res.status(500).json({ error: "Internal server error" });
  }
});

setupSocketHandlers(io);
setupTournamentHandlers(io);

httpServer.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});