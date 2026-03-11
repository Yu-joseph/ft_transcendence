## Modular Design for Chat System

🟢 1️⃣ User Module

Purpose:

Represent a person using the platform.

Responsibilities:

Create user

View profile

Update profile

Get user by ID

Why separate this?

Because user identity is its own domain.
It should not be mixed with friends or chat.

🟡 2️⃣ Friend Module

Purpose:

Manage relationships between users.

Responsibilities:

Send friend request

Accept friend request

Remove friend

List friends

Check if two users are friends

Why separate?

Because friendship is a relationship between two users.
It has its own rules and states.

Example state machine:

pending → accepted → removed

That’s business logic, not user logic.

🔵 3️⃣ Conversation Module

Purpose:

Represent a chat container between participants.

Responsibilities:

Create conversation

Add participants

Get user conversations

Validate participant membership

Why needed?

Because:

Messages should belong to conversations.
Not directly to users.

Even in 1-to-1 chat:

User A + User B → Conversation #123

This allows:

Group chat later

Cleaner data model

Better scaling

🟣 4️⃣ Message Module

Purpose:

Handle message logic.

Responsibilities:

Create message

Get messages by conversation

Mark message as read

Validate sender belongs to conversation

Message logic should not know about friend logic.
It only cares about conversation membership.