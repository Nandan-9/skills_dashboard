export async function GET() {
  const res = await fetch(`${process.env.DJANGO_API_BASE_URL}/api/sync/`, {
    cache: "no-store",
  });
  const body = await res.json();
  return Response.json(body, { status: res.status });
}

export async function POST() {
  const res = await fetch(`${process.env.DJANGO_API_BASE_URL}/api/sync/`, {
    method: "POST",
    headers: { "X-Sync-Key": process.env.SHEET_SYNC_API_KEY ?? "" },
  });
  const body = await res.json();
  return Response.json(body, { status: res.status });
}
