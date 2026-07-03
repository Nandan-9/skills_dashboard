export async function POST() {
  const res = await fetch(`${process.env.DJANGO_API_BASE_URL}/api/sync-sheet/`, {
    method: "POST",
    headers: { "X-Sync-Key": process.env.SHEET_SYNC_API_KEY ?? "" },
  });
  const body = await res.json();
  return Response.json(body, { status: res.status });
}
