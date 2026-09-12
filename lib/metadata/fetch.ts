import type { BookMetadata } from "@/lib/types";
import { computeInputCharCount } from "@/lib/analysis/result-state";

interface GoogleVolume {
  volumeInfo?: {
    title?: string;
    authors?: string[];
    description?: string;
    imageLinks?: { thumbnail?: string; smallThumbnail?: string };
    categories?: string[];
  };
}

interface OpenLibraryDoc {
  title?: string;
  authors?: { name: string }[];
  description?: string | { value: string };
  covers?: number[];
  subjects?: string[];
}

function normalizeIsbn(isbn: string): string {
  return isbn.replace(/[-\s]/g, "");
}

function stripHtml(text: string): string {
  return text.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

async function fetchGoogleBooks(isbn: string): Promise<Partial<BookMetadata>> {
  try {
    const res = await fetch(
      `https://www.googleapis.com/books/v1/volumes?q=isbn:${isbn}`,
      { next: { revalidate: 3600 } }
    );
    if (!res.ok) return {};
    const data = (await res.json()) as { items?: GoogleVolume[] };
    const item = data.items?.[0]?.volumeInfo;
    if (!item) return {};

    return {
      title: item.title ?? null,
      author: item.authors?.join(", ") ?? null,
      description: item.description ? stripHtml(item.description) : null,
      coverUrl:
        item.imageLinks?.thumbnail?.replace("http:", "https:") ??
        item.imageLinks?.smallThumbnail?.replace("http:", "https:") ??
        null,
      categories: item.categories ?? [],
    };
  } catch {
    return {};
  }
}

async function fetchOpenLibrary(isbn: string): Promise<Partial<BookMetadata>> {
  try {
    const res = await fetch(`https://openlibrary.org/isbn/${isbn}.json`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return {};
    const data = (await res.json()) as OpenLibraryDoc;

    let description: string | null = null;
    if (typeof data.description === "string") {
      description = stripHtml(data.description);
    } else if (data.description?.value) {
      description = stripHtml(data.description.value);
    }

    const coverId = data.covers?.[0];
    return {
      title: data.title ?? null,
      author: data.authors?.map((a) => a.name).join(", ") ?? null,
      description,
      coverUrl: coverId
        ? `https://covers.openlibrary.org/b/id/${coverId}-M.jpg`
        : null,
      categories: data.subjects?.slice(0, 10) ?? [],
    };
  } catch {
    return {};
  }
}

export async function fetchBookMetadata(
  rawIsbn: string,
  enrichmentText: string | null = null
): Promise<BookMetadata> {
  const isbn = normalizeIsbn(rawIsbn);

  const [google, openLib] = await Promise.all([
    fetchGoogleBooks(isbn),
    fetchOpenLibrary(isbn),
  ]);

  const description =
    (google.description && google.description.length >= (openLib.description?.length ?? 0)
      ? google.description
      : openLib.description) ?? google.description ?? openLib.description ?? null;

  const metadata: BookMetadata = {
    isbn,
    title: google.title ?? openLib.title ?? null,
    author: google.author ?? openLib.author ?? null,
    description,
    coverUrl: google.coverUrl ?? openLib.coverUrl ?? null,
    categories: [
      ...new Set([...(google.categories ?? []), ...(openLib.categories ?? [])]),
    ],
    enrichmentText,
    inputCharCount: 0,
  };

  metadata.inputCharCount = computeInputCharCount(
    metadata.description,
    metadata.enrichmentText
  );

  return metadata;
}
