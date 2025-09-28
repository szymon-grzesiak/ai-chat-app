# AI Chat App

I built this Next.js app for the recruitment task. It includes mocked login, a Gemini-powered streaming chat, file and image uploads with previews (max 8 MB), and a local profile editor.

## Setup

1. Install dependencies with `npm install`.
2. Create `.env.local` and add `GOOGLE_GENERATIVE_AI_API_KEY=your_key_here`.

## Run the app

1. Start the dev server: `npm run dev`.
2. Open <http://localhost:3000> and log in with `test@example.com` / `password123`.

## What you can do

- Chat with the AI and watch responses stream in real time.
- Attach images, PDFs, Office docs, text, or JSON files and reference them in the conversation.
- Edit your name, email, and avatar on the profile page; the data stays in the browser.

## Checks before submit

- `npm run lint`
- `npm run build`

## Submission steps

1. Commit the repo.
2. Run `git bundle create ai-chat-app.bundle --all` in the project root.
3. Send the `ai-chat-app.bundle` file through the form.
