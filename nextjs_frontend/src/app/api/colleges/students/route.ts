export async function GET() {
  const res = await fetch(`${process.env.DJANGO_API_BASE_URL}/api/colleges/students/`, {
    cache: "no-store",
  });
  const body = await res.json();
  return Response.json(body, { status: res.status });
}
