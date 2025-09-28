import { google } from "@ai-sdk/google";
import { convertToCoreMessages, streamText, type Message } from "ai";

const SYSTEM_PROMPT = `You're an empathetic AI teammate embedded in a recruitment demo. Be concise, cite the user's attachments when relevant, and explain how you derived your answer. If you can't parse an attachment, say so.`;

const model = google("gemini-2.5-flash-lite");

type IncomingAttachment = {
  name?: string;
  contentType?: string;
  url: string;
};

type AllowedRole = "system" | "user" | "assistant";

type IncomingMessage = {
  id?: string;
  role: AllowedRole | "tool" | "data";
  content: string;
  experimental_attachments?: IncomingAttachment[];
};

type ChatPayload = {
  messages: IncomingMessage[];
};

export async function POST(request: Request) {
  if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
    return new Response("GOOGLE_GENERATIVE_AI_API_KEY is not set", {
      status: 500,
    });
  }

  const body = (await request.json()) as ChatPayload;
  if (!body || !Array.isArray(body.messages)) {
    return new Response("Invalid payload.", { status: 400 });
  }

  const normalizedMessages = body.messages.filter(
    (message): message is IncomingMessage & { role: AllowedRole } =>
      message.role === "assistant" ||
      message.role === "user" ||
      message.role === "system"
  );

  try {
    const uiMessages: Array<Omit<Message, "id">> = normalizedMessages.map(
      (message) => ({
        role: message.role,
        content: message.content,
        experimental_attachments: message.experimental_attachments,
      })
    );

    const coreMessages = convertToCoreMessages(uiMessages);

    const result = streamText({
      model,
      system: SYSTEM_PROMPT,
      messages: coreMessages,
      onError: ({ error }) => {
        console.error("[api/chat] stream error", error);
      },
    });

    return result.toDataStreamResponse({
      getErrorMessage: (error) => {
        console.error("[api/chat] response stream failed", error);

        if (error instanceof Error) {
          return error.message;
        }

        if (typeof error === "string") {
          return error;
        }

        try {
          return JSON.stringify(error);
        } catch {
          return "The model failed to respond.";
        }
      },
    });
  } catch (error) {
    console.error("[api/chat] generation failed", error);
    return new Response("The model failed to respond.", { status: 500 });
  }
}
