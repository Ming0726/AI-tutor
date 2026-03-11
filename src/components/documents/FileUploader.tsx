"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/Button";

type FileUploaderProps = {
  onUploaded: (payload: { documentId: string; fileName: string; status: string }) => void;
};

const MAX_FILE_SIZE = 10 * 1024 * 1024;

export function FileUploader({ onUploaded }: FileUploaderProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [dragging, setDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validateFile = (nextFile: File) => {
    const lower = nextFile.name.toLowerCase();
    if (!lower.endsWith(".txt") && !lower.endsWith(".pdf")) {
      return "Only .txt and .pdf files are supported";
    }
    if (nextFile.size > MAX_FILE_SIZE) {
      return "File too large (max 10MB)";
    }
    return null;
  };

  const upload = async () => {
    if (!file) return;

    setUploading(true);
    setError(null);

    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch("/api/documents/upload", {
      method: "POST",
      body: formData,
    });

    setUploading(false);

    if (!response.ok) {
      const body = await response.json().catch(() => null);
      setError(body?.error ?? "Upload failed");
      return;
    }

    const data = await response.json();
    onUploaded(data);
  };

  return (
    <div className="rounded-card bg-card p-6 shadow-card sm:p-8">
      <input
        ref={inputRef}
        type="file"
        accept=".txt,.pdf"
        className="hidden"
        onChange={(event) => {
          const nextFile = event.target.files?.[0];
          if (!nextFile) return;

          const validationError = validateFile(nextFile);
          if (validationError) {
            setError(validationError);
            return;
          }

          setError(null);
          setFile(nextFile);
        }}
      />

      <div
        onDragOver={(event) => {
          event.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(event) => {
          event.preventDefault();
          setDragging(false);
          const nextFile = event.dataTransfer.files?.[0];
          if (!nextFile) return;

          const validationError = validateFile(nextFile);
          if (validationError) {
            setError(validationError);
            return;
          }

          setError(null);
          setFile(nextFile);
        }}
        onClick={() => inputRef.current?.click()}
        className={`cursor-pointer rounded-card border-2 border-dashed p-6 text-center transition sm:p-10 ${
          dragging ? "border-accent bg-accent/5" : "border-card-border"
        }`}
      >
        <div className="mx-auto mb-3 h-10 w-10 text-accent">
          <svg viewBox="0 0 24 24" className="h-full w-full" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M8 17h8a4 4 0 0 0 .8-7.9A5 5 0 0 0 7 8.5 3.5 3.5 0 0 0 8 17Z" />
            <path d="m12 13-3-3m3 3 3-3m-3-3v6" />
          </svg>
        </div>
        <p className="text-text-primary">Drag & drop your file here</p>
        <p className="text-sm text-text-secondary">or click to browse</p>
      </div>

      {file ? (
        <div className="mt-4 flex items-center justify-between gap-3 rounded-card border border-card-border bg-cream p-3 text-sm">
          <div>
            <p className="font-semibold text-text-primary">{file.name}</p>
            <p className="text-text-secondary">{(file.size / 1024).toFixed(1)} KB</p>
          </div>
          <Button loading={uploading} onClick={upload}>
            Upload
          </Button>
        </div>
      ) : null}

      {error ? <p className="mt-3 text-sm font-semibold text-error">{error}</p> : null}
    </div>
  );
}
