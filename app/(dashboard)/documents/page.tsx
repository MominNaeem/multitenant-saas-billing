"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";

interface Document {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

interface DocumentsResponse {
  documents: Document[];
  total: number;
  limit: number;
  plan: string;
}

export default function DocumentsPage() {
  const { data: session } = useSession();
  const [data, setData] = useState<DocumentsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState("");

  async function fetchDocuments() {
    try {
      const res = await fetch("/api/documents");
      const json = await res.json();
      setData(json);
    } catch {
      setError("Failed to load documents.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchDocuments();
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!newTitle.trim()) return;
    setCreating(true);

    const res = await fetch("/api/documents", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: newTitle, content: "" }),
    });

    const json = await res.json();

    if (!res.ok) {
      setError(json.error ?? "Failed to create document.");
    } else {
      setNewTitle("");
      setShowForm(false);
      fetchDocuments();
    }

    setCreating(false);
  }

  const atLimit = data ? data.total >= data.limit : false;
  const nearLimit = data ? data.total >= data.limit * 0.8 : false;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Documents</h1>
          {data && (
            <p className="mt-1 text-sm text-gray-500">
              {data.total} of {data.limit === Infinity ? "unlimited" : data.limit} documents used
            </p>
          )}
        </div>
        <button
          onClick={() => setShowForm(true)}
          disabled={atLimit}
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          + New Document
        </button>
      </div>

      {nearLimit && !atLimit && (
        <div className="mb-6 rounded-md bg-yellow-50 border border-yellow-200 px-4 py-3 text-sm text-yellow-800">
          You are approaching your document limit ({data?.total}/{data?.limit}). Consider upgrading your plan.{" "}
          <a href="/dashboard/billing" className="font-medium underline">
            Upgrade now
          </a>
        </div>
      )}

      {atLimit && (
        <div className="mb-6 rounded-md bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-800">
          You have reached your document limit ({data?.total}/{data?.limit}).{" "}
          <a href="/dashboard/billing" className="font-medium underline">
            Upgrade your plan
          </a>{" "}
          to create more documents.
        </div>
      )}

      {error && (
        <div className="mb-6 rounded-md bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">{error}</div>
      )}

      {showForm && (
        <form
          onSubmit={handleCreate}
          className="mb-6 flex gap-3 rounded-lg border border-gray-200 bg-white p-4 shadow-sm"
        >
          <input
            type="text"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="Document title..."
            className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            autoFocus
          />
          <button
            type="submit"
            disabled={creating}
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60"
          >
            {creating ? "Creating..." : "Create"}
          </button>
          <button
            type="button"
            onClick={() => setShowForm(false)}
            className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
        </form>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
        </div>
      ) : data?.documents.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-gray-300 py-16 text-center">
          <p className="text-gray-500">No documents yet.</p>
          <button
            onClick={() => setShowForm(true)}
            className="mt-3 text-sm font-medium text-blue-600 hover:text-blue-700"
          >
            Create your first document
          </button>
        </div>
      ) : (
        <div className="grid gap-4">
          {data?.documents.map((doc) => (
            <div
              key={doc.id}
              className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-5 shadow-sm hover:shadow-md transition-shadow"
            >
              <div>
                <p className="font-medium text-gray-900">{doc.title}</p>
                <p className="mt-1 text-xs text-gray-400">
                  Updated {new Date(doc.updatedAt).toLocaleDateString()}
                </p>
              </div>
              <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">Open &rarr;</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
