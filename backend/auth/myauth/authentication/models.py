from django.db import models
from django.contrib.postgres.fields import ArrayField
import uuid


# ------------------------
# User model
# ------------------------
class User(models.Model):
    id = models.CharField(primary_key=True, max_length=255)  # Clerk user ID
    username = models.CharField(max_length=255)
    wins = models.IntegerField(default=0)
    losses = models.IntegerField(default=0)
    createdAt = models.DateTimeField(auto_now_add=True)
    updatedAt = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "User"


# ------------------------
# Game model
# ------------------------
class Game(models.Model):
    id = models.CharField(primary_key=True, default=uuid.uuid4, max_length=255)
    board = ArrayField(
        base_field=models.CharField(max_length=1, null=True, blank=True),
        size=9
    )
    status = models.CharField(max_length=50)
    result = models.CharField(max_length=50)

    playerX = models.ForeignKey(
        User,
        related_name="gamesAsPlayerX",
        on_delete=models.CASCADE,
        db_column="playerXId"
    )
    playerO = models.ForeignKey(
        User,
        related_name="gamesAsPlayerO",
        on_delete=models.CASCADE,
        db_column="playerOId"
    )
    winner = models.ForeignKey(
        User,
        related_name="wonGames",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        db_column="winnerId"
    )
    tournament = models.ForeignKey(
        "Tournament",
        related_name="games",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        db_column="tournamentId"
    )
    createdAt = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "Game"


# ------------------------
# Tournament model
# ------------------------
class Tournament(models.Model):
    id = models.CharField(primary_key=True, default=uuid.uuid4, max_length=255)
    name = models.CharField(max_length=255)
    status = models.CharField(max_length=50)

    creator = models.ForeignKey(
        User,
        related_name="createdTournaments",
        on_delete=models.CASCADE,
        db_column="creatorId"
    )
    winner = models.ForeignKey(
        User,
        related_name="wonTournaments",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        db_column="winnerId"
    )
    createdAt = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "Tournament"


# ------------------------
# TournamentParticipant model
# ------------------------
class TournamentParticipant(models.Model):
    id = models.CharField(primary_key=True, default=uuid.uuid4, max_length=255)
    tournament = models.ForeignKey(
        Tournament,
        related_name="players",
        on_delete=models.CASCADE,
        db_column="tournamentId"
    )
    user = models.ForeignKey(
        User,
        related_name="tournamentEntries",
        on_delete=models.CASCADE,
        db_column="userId"
    )
    seed = models.IntegerField()
    eliminated = models.BooleanField(default=False)
    eliminatedInRound = models.IntegerField(null=True, blank=True)

    class Meta:
        db_table = "TournamentParticipant"
        unique_together = ("tournament", "user")