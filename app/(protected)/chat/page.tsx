"use client";

import Image from "next/image";
import { useState } from "react";
import { useChat } from "ai/react";
import { ExternalLink, Loader2, Paperclip, Send, Trash2 } from "lucide-react";

import { useAuth } from "@/contexts/auth-context";
import { fileToDataUrl } from "@/lib/files";

const MAX_FILE_SIZE_MB = 8;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

const READABLE_FILE_TYPES = [
  "image/",
  "text/",
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument",
  "application/json",
  "application/rtf",
  "application/vnd.ms-powerpoint",
  "application/vnd.ms-excel",
];

type DraftAttachment = {
  id: string;
  name: string;
  size: number;
  type: string;
  dataUrl: string;
  textPreview?: string;
};

function isSupportedType(type: string) {
  return READABLE_FILE_TYPES.some((prefix) => type.startsWith(prefix));
}

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getTextPreview(dataUrl: string) {
  try {
    const [, base64] = dataUrl.split(",");
    if (!base64) return "";
    const decoded = atob(base64);
    const trimmed = decoded.slice(0, 280);
    return trimmed.trim();
  } catch (error) {
    console.warn("Could not generate text preview", error);
    return "";
  }
}

export default function ChatPage() {
  const { user } = useAuth();
  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
    stop,
  } = useChat({
    api: "/api/chat",
    initialMessages: [
      {
        id: "welcome",
        role: "assistant",
        content: `Hey ${
          user?.name ?? "there"
        }! I\'m your AI teammate. Attach documents or images and I\'ll reason about them in real-time.`,
      },
    ],
  });

  const [attachments, setAttachments] = useState<DraftAttachment[]>([]);
  const [attachmentError, setAttachmentError] = useState<string | null>(null);

  async function handleFilesSelected(files: FileList | null) {
    if (!files?.length) return;

    setAttachmentError(null);
    const fileArray = Array.from(files);
    const nextAttachments: DraftAttachment[] = [];

    for (const file of fileArray) {
      if (file.size > MAX_FILE_SIZE_BYTES) {
        setAttachmentError(
          `"${file.name}" jest większy niż ${MAX_FILE_SIZE_MB}MB.`
        );
        continue;
      }

      if (!isSupportedType(file.type)) {
        setAttachmentError(`"${file.name}" ma nieobsługiwany typ.`);
        continue;
      }

      const dataUrl = await fileToDataUrl(file);
      const preview =
        file.type.startsWith("text/") || file.type.includes("json")
          ? getTextPreview(dataUrl)
          : "";

      nextAttachments.push({
        id: crypto.randomUUID(),
        name: file.name,
        size: file.size,
        type: file.type,
        dataUrl,
        textPreview: preview || undefined,
      });
    }

    if (nextAttachments.length) {
      setAttachments((previous) => [...previous, ...nextAttachments]);
    }
  }

  function removeAttachment(id: string) {
    setAttachments((previous) => previous.filter((item) => item.id !== id));
  }

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    const hasAttachments = attachments.length > 0;
    setAttachmentError(null);

    handleSubmit(event, {
      allowEmptySubmit: hasAttachments,
      experimental_attachments: attachments.map(({ name, type, dataUrl }) => ({
        name,
        contentType: type,
        url: dataUrl,
      })),
    });

    setAttachments([]);
  }

  return (
    <div className="flex flex-1 flex-col gap-6 pb-14">
      <section className="rounded-3xl border border-slate-800/80 bg-slate-900/70 p-6 shadow-lg shadow-sky-950/20">
        <header className="mb-4 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-white">
              Workspace chat
            </h1>
            <p className="text-sm text-slate-400">
              Ask questions, brainstorm ideas, or drop files—I&apos;ll stream
              insights as they arrive.
            </p>
          </div>
          {isLoading ? (
            <button
              type="button"
              onClick={stop}
              className="flex items-center gap-2 rounded-full border border-slate-600/70 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-300 transition hover:border-rose-500/60 hover:text-rose-200"
            >
              <Loader2 className="h-4 w-4 animate-spin" />
              stop
            </button>
          ) : null}
        </header>

        <div className="flex flex-col gap-5">
          <div className="flex max-h-[55vh] flex-col gap-4 overflow-y-auto pr-2">
            {messages.map((message) => (
              <article
                key={message.id}
                className={`flex items-start gap-3 rounded-2xl border border-transparent px-4 py-3 ${
                  message.role === "assistant"
                    ? "bg-slate-900/80 border-slate-800/80 shadow-inner shadow-slate-950/40"
                    : "bg-slate-900/40 border-slate-800/60"
                }`}
              >
                <div
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-sm font-semibold ${
                    message.role === "assistant"
                      ? "bg-sky-500/20 text-sky-200"
                      : "bg-slate-700/60 text-slate-200"
                  }`}
                >
                  {message.role === "assistant"
                    ? "AI"
                    : user?.name?.slice(0, 2).toUpperCase() ?? "You"}
                </div>
                <div className="flex flex-1 flex-col gap-2 text-sm leading-relaxed text-slate-200">
                  <div className="whitespace-pre-wrap text-slate-200">
                    {message.content}
                  </div>

                  {message.experimental_attachments?.length ? (
                    <div className="flex flex-wrap gap-3">
                      {message.experimental_attachments.map((attachment) => {
                        const isImage =
                          attachment.contentType?.startsWith("image/");
                        const isText =
                          attachment.contentType?.startsWith("text/") ||
                          attachment.contentType?.includes("json");
                        return (
                          <div
                            key={`${message.id}-${attachment.url}`}
                            className="flex w-full max-w-xs flex-col gap-2 rounded-2xl border border-slate-800/70 bg-slate-900/40 p-3 text-xs text-slate-300"
                          >
                            {isImage ? (
                              <Image
                                src={attachment.url}
                                alt={attachment.name ?? "Attachment"}
                                width={256}
                                height={256}
                                unoptimized
                                className="h-32 w-full rounded-xl object-cover"
                              />
                            ) : isText ? (
                              <pre className="max-h-32 overflow-y-auto rounded-xl bg-slate-950/80 p-2 text-left text-[11px] leading-snug text-slate-200">
                                {getTextPreview(attachment.url)}
                              </pre>
                            ) : (
                              <a
                                href={attachment.url}
                                target="_blank"
                                rel="noreferrer"
                                className="flex items-center gap-2 text-sky-300 hover:text-sky-200"
                              >
                                <ExternalLink className="h-3 w-3" />
                                Open attachment
                              </a>
                            )}
                            <span className="truncate text-slate-400">
                              {attachment.name ?? "Attachment"}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  ) : null}
                </div>
              </article>
            ))}
          </div>

          <form
            onSubmit={onSubmit}
            className="flex flex-col gap-4 rounded-2xl border border-slate-800/80 bg-slate-950/60 p-4"
          >
            {attachmentError ? (
              <p className="rounded-xl border border-rose-500/50 bg-rose-500/10 px-4 py-2 text-sm text-rose-100">
                {attachmentError}
              </p>
            ) : null}

            {attachments.length ? (
              <div className="flex flex-wrap gap-3">
                {attachments.map((attachment) => (
                  <div
                    key={attachment.id}
                    className="flex w-full max-w-xs flex-col gap-2 rounded-2xl border border-slate-800/70 bg-slate-900/50 p-3 text-xs text-slate-300"
                  >
                    {attachment.type.startsWith("image/") ? (
                      <Image
                        src={attachment.dataUrl}
                        alt={attachment.name}
                        width={256}
                        height={256}
                        unoptimized
                        className="h-32 w-full rounded-xl object-cover"
                      />
                    ) : attachment.textPreview ? (
                      <pre className="max-h-32 overflow-y-auto rounded-xl bg-slate-950/80 p-2 text-left text-[11px] leading-snug text-slate-200">
                        {attachment.textPreview}
                        {attachment.textPreview.length >= 280 ? "…" : ""}
                      </pre>
                    ) : (
                      <a
                        href={attachment.dataUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-2 text-sky-300 hover:text-sky-200"
                      >
                        <ExternalLink className="h-3 w-3" />
                        Podgląd w nowej karcie
                      </a>
                    )}
                    <div className="flex items-center justify-between gap-2 text-[11px] text-slate-400">
                      <span className="truncate" title={attachment.name}>
                        {attachment.name}
                      </span>
                      <span>{formatSize(attachment.size)}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeAttachment(attachment.id)}
                      className="flex items-center gap-2 rounded-full border border-slate-700 px-3 py-1 text-[11px] font-medium text-slate-300 transition hover:border-rose-500/60 hover:text-rose-200"
                    >
                      <Trash2 className="h-3 w-3" /> Usuń
                    </button>
                  </div>
                ))}
              </div>
            ) : null}

            <div className="flex items-center gap-3">
              <label className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-xl border border-slate-700 bg-slate-900/60 text-slate-300 transition hover:border-sky-500/60 hover:text-sky-100">
                <input
                  type="file"
                  multiple
                  className="hidden"
                  onChange={(event) => handleFilesSelected(event.target.files)}
                  accept=".png,.jpg,.jpeg,.gif,.pdf,.txt,.md,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.json,.rtf"
                />
                <Paperclip className="h-5 w-5" />
              </label>

              <textarea
                value={input}
                onChange={handleInputChange}
                placeholder="Ask me anything…"
                className="min-h-[52px] flex-1 resize-none rounded-xl border border-slate-700 bg-slate-900/60 px-4 py-3 text-base text-slate-100 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-500/40"
                rows={2}
              />

              <button
                type="submit"
                disabled={isLoading && messages.length > 0}
                className="flex h-12 w-12 items-center justify-center rounded-xl bg-sky-500 text-slate-950 transition hover:bg-sky-400 disabled:cursor-not-allowed disabled:bg-slate-700"
              >
                <Send className="h-5 w-5" />
                <span className="sr-only">Send message</span>
              </button>
            </div>
          </form>
        </div>
      </section>
    </div>
  );
}
