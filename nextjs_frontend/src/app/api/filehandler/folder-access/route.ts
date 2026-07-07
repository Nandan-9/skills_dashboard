export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const folderId = searchParams.get("folder_id");

  const res = await fetch(
    `${process.env.DJANGO_API_BASE_URL}/api/filehandler/folder-access/?folder_id=${encodeURIComponent(folderId ?? "")}`,
    { cache: "no-store" }
  );
  const body = await res.json();
  return Response.json(body, { status: res.status });
}

export async function POST(request: Request) {
  const payload = await request.json();

  const res = await fetch(`${process.env.DJANGO_API_BASE_URL}/api/filehandler/folder-access/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const body = await res.json();
  return Response.json(body, { status: res.status });
}
