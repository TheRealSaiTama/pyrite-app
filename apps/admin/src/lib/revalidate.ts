export async function notifyStorefront(paths: string[]): Promise<void> {
  const url = process.env.STOREFRONT_REVALIDATE_URL;
  const secret = process.env.STOREFRONT_REVALIDATE_SECRET;
  if (!url || !secret) return;
  try {
    await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ secret, path: paths }),
    });
  } catch {
  }
}
