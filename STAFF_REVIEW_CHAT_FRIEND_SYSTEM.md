# Evaluation & Staff Review Guide: Chat & Friend System
**Role**: Project Manager (PM) & Full-Stack Developer
**Stack**: React, TailwindCSS, Express.js (Node), Prisma ORM, PostgreSQL, Socket.io
**Domain**: Chat System & Friend System

This guide explains *what* you built, *how* it works, and *why* you chose this design. Learn this to perfectly answer any questions from the campus staff during your evaluation.

---

## Module 1: System Design & Architecture (Why did we choose this?)

### 1. The Technology Choices
*   **Express.js + Node:** Node.js is asynchronous and event-driven. Real-time apps (like chat) require keeping thousands of WebSocket connections open simultaneously. Node does this elegantly on a single thread without consuming massive RAM, unlike traditional blocking languages (like standard Python/Django setups).
*   **React + Tailwind:** React acts as the View layer. The virtual DOM easily updates exactly what changes (e.g., appending a single message to a chat box) without reloading the page. Tailwind speeds up styling without leaving the component file.
*   **Prisma + PostgreSQL:** PostgreSQL handles highly relational data (Users, Friends, Messages, Conversations) with ACID compliance. Prisma provides strict TypeScript types, meaning a typo in fetching a Database field (`username` instead of `userName`) is caught by the compiler, effectively preventing 50% of runtime backend crashes.

### 2. Database Schema Design (Your Domain)
*   **Friends (`Friend`):** This is a many-to-many relationship, typically mapped as a join table holding `requesterId`, `receiverId`, and `status` (`PENDING`, `ACCEPTED`, `REJECTED`, `BLOCKED`).
*   **Conversations (`Conversation`):** Holds Direct Messages. It links `user1Id` and `user2Id`.
*   **Messages:** Belongs to a `Conversation`, sent by a `User`, containing text or metadata, and a timestamp.

*Question they might ask:* "How do you fetch a user's friends efficiently?"
*Your answer:* "Using Prisma's `include` property. Instead of fetching the Friend table, then doing a loop of queries to find user data, I do a single query `prisma.friend.findMany({ include: { User_Friend_receiverIdToUser: true } })` which translates under the hood to a highly optimized SQL `JOIN`."

---

## Module 2: The Real-Time WebSocket Engine

The most critical part of your implementation is the `socket/index.ts` file. 

### 1. Connection & Authentication
Whenever a user opens your React app:
1. React initiates a socket connection `io(URL, { credentials: true })`.
2. Backend catches this at `io.use(socketAuthenticate)`. You do not blindly accept sockets. You verify their JWT token first.
3. If valid, you immediately assign the user to a unique personal room: `socket.join(authentUser.user_id)`.

**Why the "Personal Room"?**
If a user is logged in on their phone AND their laptop simultaneously, both devices open a socket. By making both sockets join the room named after their `user_id`, you can emit a notification like a Friend Request (`notification:friend_update`) to that room, and BOTH devices receive it instantly.

### 2. Events & Rooms (The Chat)
*   **Joining a Chat:** `socket.join(room_id)`. Rooms are independent communication channels provided uniquely by `Socket.io`.
*   **Typing Indicators:** You implemented `typing:start` and `typing:stop`. You emit it using `socket.to(friendId).emit(...)`. 
*   **Why `socket.to()`?** This broadcasts the event to everyone in the room/friend EXCEPT the sender.

### 3. Managing Online Presence (Lifecycle Hooks)
In `io.on('connection')`, you immediately update the user's DB status to `"Online"`, then iterate through their friends and emit `status:update`.
On `disconnect`, you do NOT just set them offline. You explicitly check:
`const connectedSockets = await io.in(authentUser.user_id).fetchSockets();`
*Why?* Because if they just closed a tab, but their other tab is still open, they are still online! You only set `"Offline"` if `connectedSockets.length === 0`.

---

## Module 3: Security & Edge Cases (The Defensive Shield)

Evaluators will try to break your app based on edge cases. You've protected against them:

1.  **Adding yourself as a friend:**
    In `friend.service.ts`: `if (data.requesterId === frId.id) throw new AppError('Cannot add yourself')`.
2.  **Duplicate Friend Requests:**
    You check if a request exists. If it does and status is `PENDING`, you gracefully reject spam: `throw new AppError('Friend request already sent...')`.
3.  **Cross-Site Scripting (XSS):**
    If a user sends a chat message `<script>alert(1)</script>`, React by default escapes injected strings. However, your backend should ideally sanitize text going into PostgreSQL (or rely exclusively on React's HTML escaping for display).
4.  **Zod validation for Sockets:**
    In your socket logic, you don't trust incoming socket data. You use `z.object({...}).safeParse(data)`. This ensures nobody can inject malicious JSON packets directly into your open socket ports.

---

## Module 4: The React Frontend Flow

### 1. Project Manager Perspective
As a PM, you ensure features are isolated. React perfectly aligns with this. You break features down:
*   `FriendList` component
*   `ChatWindow` component
*   `Profile` component

### 2. Socket Listeners (useEffect)
Evaluators love asking about React lifecycle components and WebSockets.
*   *Question:* "What happens if a user navigates away from the chat screen?"
*   *Your Answer:* "When the component mounts, a `useEffect` attaches socket listeners. When the user navigates away, the component unmounts, and the `useEffect` cleanup function fires to `socket.off('message')`. If I didn't do this, multiple navigations would cause duplicated listeners, crashing the browser or showing the same message 5 times."

---

## SUMMARY CHECKLIST FOR THE DAY OF EVALUATION

1. [ ] **Demonstrate Deployment:** Run `docker compose up --build` with one command without touching any configs manually.
2. [ ] **Zero Console Errors:** Open the dev tools network tab. Point out to the evaluator that the console is perfectly clear (you resolved the Vite websocket and sourcemap headers by properly configuring Vite's `allowedHosts`).
3. [ ] **Cross-Browser Verification:** Run the game side-by-side with Chrome and Firefox (or two different users) and show that standard sockets instantly communicate state across boundaries.
4. [ ] **Demonstrate Edge Cases:**
    *   Try adding yourself as a friend. Show the error toast.
    *   Log out and show the realtime status update changing to "Offline" on the other user's screen.