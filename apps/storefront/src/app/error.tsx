"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Storefront route error:", error?.message, error?.digest);
  }, [error]);

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center gap-4 px-6 text-center">
      <h1 className="text-2xl font-semibold text-gray-900">Something went wrong</h1>
      <p className="text-sm text-gray-600 max-w-md">
        This page hit an error while loading. You can try again or go back home.
      </p>
      {error?.digest && (
        <p className="text-xs text-gray-400 font-mono">Ref: {error.digest}</p>
      )}
      <div className="flex flex-wrap gap-3 justify-center">
        <button
          type="button"
          onClick={reset}
          className="rounded-full bg-[#0F172A] px-5 py-2.5 text-sm font-medium text-white hover:bg-[#1E293B] transition-colors"
        >
          Try again
        </button>
        <Link
          href="/"
          className="rounded-md border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-800 hover:bg-gray-50"
        >
          Home
        </Link>
        <Link
          href="/shop"
          className="rounded-md border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-800 hover:bg-gray-50"
        >
          Shop
        </Link>
      </div>
    </div>
  );
}
