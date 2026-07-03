export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.text();

  const res = await fetch(`${process.env.DJANGO_API_BASE_URL}/api/applications/${id}/approval/`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body,
  });

  const responseBody = await res.json();
  return Response.json(responseBody, { status: res.status });
}
