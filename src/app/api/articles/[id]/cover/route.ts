import { prisma } from "@/lib/prisma";

function detectMime(buf: Uint8Array): string {
  if (buf.length >= 2 && buf[0] === 0xff && buf[1] === 0xd8) {
    return "image/jpeg";
  }
  if (
    buf.length >= 8 &&
    buf[0] === 0x89 &&
    buf[1] === 0x50 &&
    buf[2] === 0x4e &&
    buf[3] === 0x47
  ) {
    return "image/png";
  }
  if (buf.length >= 12 && buf[0] === 0x52 && buf[1] === 0x49 && buf[2] === 0x46 && buf[3] === 0x46) {
    return "image/webp";
  }
  return "application/octet-stream";
}

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;

  const article = await prisma.feedArticle.findUnique({
    where: { id },
    select: { coverImage: true },
  });

  if (!article?.coverImage) {
    return new Response(null, { status: 404 });
  }

  const body = new Uint8Array(article.coverImage);
  const contentType = detectMime(body);

  return new Response(body, {
    headers: {
      "Content-Type": contentType,
      "Cache-Control": "public, max-age=86400",
    },
  });
}
