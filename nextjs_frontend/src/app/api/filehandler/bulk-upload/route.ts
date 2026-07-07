export async function POST(request: Request) {
  const formData = await request.formData();

  const res = await fetch(`${process.env.DJANGO_API_BASE_URL}/api/filehandler/bulk-upload/`, {
    method: "POST",
    body: formData,
  });

  const body = await res.json();
  return Response.json(body, { status: res.status });
}
