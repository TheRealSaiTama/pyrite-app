function read(names: string[]): string {
  const vite = import.meta.env as Record<string, string | undefined>;
  for (const name of names) {
    const fromVite = vite[name];
    if (fromVite) return fromVite;
  }
  if (typeof process !== "undefined") {
    for (const name of names) {
      const fromProcess = process.env[name];
      if (fromProcess) return fromProcess;
    }
  }
  return "";
}

export function getSupabaseUrl(): string {
  return read(["VITE_SUPABASE_URL", "SUPABASE_URL"]);
}

export function getSupabasePublishableKey(): string {
  return read([
    "VITE_SUPABASE_PUBLISHABLE_KEY",
    "VITE_SUPABASE_ANON_KEY",
    "SUPABASE_PUBLISHABLE_KEY",
    "SUPABASE_ANON_KEY",
  ]);
}

export function isSupabaseConfigured(): boolean {
  return Boolean(getSupabaseUrl() && getSupabasePublishableKey());
}
