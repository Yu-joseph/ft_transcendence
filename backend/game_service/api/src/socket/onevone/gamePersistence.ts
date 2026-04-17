import prisma from "../../lib/prisma";
import { Match } from "../../types/game";

export async function createGameInDB(match: Match) {
  const boardStrings = match.board.map((cell) => cell ?? '');
  await prisma.game.create({
    data: {
      id: match.id,
      board: boardStrings,
      status: 'playing',
      result: 'PENDING',
      playerXId: match.players[0].id,
      playerOId: match.players[1].id,
      tournamentId: match.tournamentId ?? null,
      created_at: new Date(),
    },
  });
  console.log(`Game created in DB: ${match.id}`);
}

export async function updateGameInDB(match: Match) {
  const boardStrings = match.board.map((cell) => cell ?? '');
  await prisma.game.upsert({
    where: { id: match.id },
    update: {
      board: boardStrings,
      status: match.status,
    },
    create: {
      id: match.id,
      board: boardStrings,
      status: match.status,
      result: 'PENDING',
      playerXId: match.players[0].id,
      playerOId: match.players[1].id,
      tournamentId: match.tournamentId ?? null,
      created_at: new Date(),
    },
  });
}

export async function finalizeGame(match: Match) {
  const playerXId = match.players[0].id;
  const playerOId = match.players[1].id;

  const winnerId = match.winner ?? null;
  const result = winnerId === playerXId ? 'X_WIN' : 'O_WIN';

  const boardStrings = match.board.map((cell) => cell ?? '');

  await prisma.game.upsert({
    where: { id: match.id },
    update: {
      board: boardStrings,
      status: 'finished',
      result,
      winnerId,
    },
    create: {
      id: match.id,
      board: boardStrings,
      status: 'finished',
      result,
      winnerId,
      playerXId,
      playerOId,
      tournamentId: match.tournamentId ?? null,
      created_at: new Date(),
    },
  });

  if (match.tournamentId) {
    console.log(`Tournament game finished without W/L update: ${match.id}`);
    return;
  }

  if (winnerId) {
    const loserId = winnerId === playerXId ? playerOId : playerXId;
    await prisma.$transaction([
      prisma.user.update({ where: { id: winnerId }, data: { wins: { increment: 1 } } }),
      prisma.user.update({ where: { id: loserId }, data: { losses: { increment: 1 } } }),
    ]);

    console.log(
      `Game finished: ${result} | ${match.players[0].username} vs ${match.players[1].username}`,
    );
  }
}