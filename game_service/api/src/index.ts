import express, { Request, Response } from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { setupSocketHandlers } from './socket/handlers';
import prisma from './lib/prisma';
import { setupTournamentHandlers } from './socket/tournament';

const app = express();

const PORT = process.env.PORT || 3000;

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

app.use(cors());
app.use(express.json());

app.get('/', (req: Request, res: Response) => {
  res.json({ message: 'Welcome to the API' });
});

app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'ok' });
});

// Get user stats (wins, losses, draws)
app.get('/api/users/:id/stats', async (req: Request, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.params.id as string},
      select: { id: true, username: true, wins: true, losses: true },
    });
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get user's game history
app.get('/api/users/:id/games', async (req: Request, res: Response) => {
  try {
    const games = await prisma.game.findMany({
      where: {
        OR: [{ playerXId: req.params.id as string}, { playerOId: req.params.id as string}],
      },
      include: {
        User_Game_playerXIdToUser: { select: { id: true, username: true } },
        User_Game_playerOIdToUser: { select: { id: true, username: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(games);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});
// Get user's tournament history
app.get('/api/users/:id/tournaments', async (req: Request, res: Response) => {
  try {
    const entries = await prisma.tournamentParticipant.findMany({
      where: { userId: req.params.id as string},
      include: {
<<<<<<<< HEAD:backend/game_service/api/src/index.ts
        Tournament: {
          include: {
            User_Tournament_winnerIdToUser: {select: {id: true, username: true}},
            User_Tournament_creatorIdToUser : {select: {id: true, username: true}},
          }
        }
      },
      orderBy: { Tournament: {createdAt: 'desc'} },
    });
    const result = entries.map(entry => ({
      tournamentId: entry.tournamentId,
      name: entry.Tournament.name,
      status: entry.Tournament.status,
      creator: entry.Tournament.User_Tournament_creatorIdToUser,
      userStatus: entry.Tournament.winnerId === req.params.id
        ? 'winner'
          : entry.eliminated
            ? 'eliminated'
            : entry.Tournament.status === 'finished'
========
        tournament: {
          include: {
            winner: {select: {id: true, username: true}},
            creator: {select: {id: true, username: true}},
          }
        }
      },
      orderBy: { tournament: {createdAt: 'desc'} },
    });
    const result = entries.map(entry => ({
      tournamentId: entry.tournamentId,
      name: entry.tournament.name,
      status: entry.tournament.status,
      creator: entry.tournament.creator,
      userStatus: entry.tournament.winnerId === req.params.id
        ? 'winner'
          : entry.eliminated
            ? 'eliminated'
            : entry.tournament.status === 'finished'
>>>>>>>> 1ce0a68 (put the game service in a container):game_service/api/src/index.ts
              ? 'eliminated'
              : 'playing',
      eliminatedInRound: entry.eliminatedInRound,
      eliminated : entry.eliminated,
      seed: entry.seed,
<<<<<<<< HEAD:backend/game_service/api/src/index.ts
      tournamentWinner: entry.Tournament.User_Tournament_winnerIdToUser,
      createdAt: entry.Tournament.createdAt,
========
      tournamentWinner: entry.tournament.winner,
      createdAt: entry.tournament.createdAt,
>>>>>>>> 1ce0a68 (put the game service in a container):game_service/api/src/index.ts
    }));
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get leaderboard
app.get('/api/leaderboard', async (req: Request, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      select: { id: true, username: true, wins: true, losses: true },
      orderBy: { wins: 'desc' },
      take: 20,
    });
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});


// Setup socket handlers
setupSocketHandlers(io);
setupTournamentHandlers(io);

httpServer.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});