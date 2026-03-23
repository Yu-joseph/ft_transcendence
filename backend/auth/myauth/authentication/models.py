from django.db import models
from django.contrib.postgres.fields import ArrayField

class FriendsStatus(models.TextChoices):
    PENDING  = "PENDING",  "Pending"
    ACCEPTED = "ACCEPTED", "Accepted"
    REJECTED = "REJECTED", "Rejected"

class User(models.Model):
    id         = models.CharField(max_length=255, primary_key=True)
    username   = models.CharField(max_length=255, unique=True, blank=False,null=False)
    email      = models.CharField(max_length=255, unique=True, blank=False,null=False)
    fullname   = models.CharField(max_length=255, blank=True)
    password   = models.CharField(max_length=255, blank=False, null=False)
    created_at = models.DateTimeField(auto_now_add=True)   
    updated_at = models.DateTimeField(auto_now=True)   
    avatar     = models.ImageField(upload_to='images/', blank=True,null=True)
    status     = models.CharField(max_length=50, default="Online")
    role       = models.CharField(max_length=50, default="user") 
    wins       = models.IntegerField(default=0)
    losses     = models.IntegerField(default=0)

    class Meta:
        db_table = "User"

    def __str__(self):
        return self.username

class Friend(models.Model):
    requester  = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="sent_requests",
        db_column="requesterId",
    )
    receiver   = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="received_requests",
        db_column="receiverId",
    )
    status     = models.CharField(
        max_length=50,
        choices=FriendsStatus.choices,
        default=FriendsStatus.PENDING,
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "Friend"
        indexes = [
            models.Index(fields=["requester"]),
            models.Index(fields=["receiver"]),
            models.Index(fields=["status"]),
        ]

    def __str__(self):
        return f"{self.requester} → {self.receiver} ({self.status})"

class Conversation(models.Model):
    user1      = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="conversations_as_user1",
        db_column="user1Id",
    )
    user2      = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="conversations_as_user2",
        db_column="user2Id",
    )
    created_at = models.DateTimeField(auto_now_add=True)   
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "Conversation"
        unique_together = [("user1", "user2")]
        indexes = [
            models.Index(fields=["user1"]),
            models.Index(fields=["user2"]),
            models.Index(fields=["created_at"]),
            models.Index(fields=["updated_at"]),
        ]

    def __str__(self):
        return f"Conversation({self.user1} ↔ {self.user2})"


class Message(models.Model):
    content      = models.TextField()
    sender       = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="sent_messages",
        db_column="senderId",
    )
    conversation = models.ForeignKey(
        Conversation,
        on_delete=models.CASCADE,
        related_name="messages",
        db_column="conversationId",
    )
    created_at   = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "Message"
        indexes = [
            models.Index(fields=["sender"]),
            models.Index(fields=["conversation"]),
            models.Index(fields=["created_at"]),
        ]

    def __str__(self):
        return f"Message({self.sender}, {self.created_at:%Y-%m-%d %H:%M})"

class Game(models.Model):
    id         = models.CharField(max_length=255, primary_key=True)
    board      = ArrayField(models.CharField(max_length=1), size=9)
    status     = models.CharField(max_length=50)
    result     = models.CharField(max_length=50)
    created_at = models.DateTimeField(auto_now_add=True)
    player_x   = models.ForeignKey(
        User,
        on_delete=models.DO_NOTHING,
        related_name="games_as_x",
        db_column="playerXId",
    )
    player_o   = models.ForeignKey(
        User,
        on_delete=models.DO_NOTHING,
        related_name="games_as_o",
        db_column="playerOId",
    )
    winner     = models.ForeignKey(
        User,
        on_delete=models.DO_NOTHING,
        related_name="games_won",
        null=True,
        blank=True,
        db_column="winnerId",
    )
    tournament = models.ForeignKey(
        "Tournament",
        on_delete=models.DO_NOTHING,
        related_name="games",
        null=True,
        blank=True,
        db_column="tournamentId",
    )

    class Meta:
        db_table = "Game"
        indexes = [
            models.Index(fields=["player_x"]),
            models.Index(fields=["player_o"]),
            models.Index(fields=["winner"]),
            models.Index(fields=["tournament"]),
        ]

    def __str__(self):
        return f"Game({self.id}, {self.status})"

class Tournament(models.Model):
    id         = models.CharField(max_length=255, primary_key=True)
    name       = models.CharField(max_length=255)
    status     = models.CharField(max_length=50)
    created_at = models.DateTimeField(auto_now_add=True)
    creator    = models.ForeignKey(
        User,
        on_delete=models.DO_NOTHING,
        related_name="tournaments_created",
        db_column="creatorId",
    )
    winner     = models.ForeignKey(
        User,
        on_delete=models.DO_NOTHING,
        related_name="tournaments_won",
        null=True,
        blank=True,
        db_column="winnerId",
    )

    class Meta:
        db_table = "Tournament"
        indexes = [
            models.Index(fields=["creator"]),
            models.Index(fields=["winner"]),
        ]

    def __str__(self):
        return f"Tournament({self.name}, {self.status})"

class TournamentParticipant(models.Model):
    id                  = models.CharField(max_length=255, primary_key=True)
    seed                = models.IntegerField()
    eliminated          = models.BooleanField(default=False)
    eliminated_in_round = models.IntegerField(null=True, blank=True)
    tournament          = models.ForeignKey(
        Tournament,
        on_delete=models.DO_NOTHING,
        related_name="participants",
        db_column="tournamentId",
    )
    user                = models.ForeignKey(
        User,
        on_delete=models.DO_NOTHING,
        related_name="tournament_entries",
        db_column="userId",
    )

    class Meta:
        db_table = "TournamentParticipant"
        unique_together = [("tournament", "user")]
        indexes = [
            models.Index(fields=["tournament"]),
            models.Index(fields=["user"]),
        ]

    def __str__(self):
        return f"TournamentParticipant({self.user} in {self.tournament}, seed={self.seed})"