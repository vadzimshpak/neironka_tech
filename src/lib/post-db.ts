import { prisma } from "@/lib/prisma";

export const POSTS_INDEX_PAGE_SIZE = 10;

export async function getPostBySlug(slug: string) {
  return prisma.feedArticle.findUnique({
    where: { slug },
  });
}

export async function getArticleBodyImageIds(articleId: string) {
  const rows = await prisma.articleBodyImage.findMany({
    where: { articleId },
    select: { id: true },
    orderBy: { createdAt: "asc" },
  });
  return rows.map((r) => r.id);
}

export async function getAllPostSlugs() {
  return prisma.feedArticle.findMany({
    select: { slug: true },
    orderBy: { publishedAt: "desc" },
  });
}

export async function getPostsIndex() {
  return prisma.feedArticle.findMany({
    orderBy: { publishedAt: "desc" },
    select: {
      id: true,
      slug: true,
      title: true,
      excerpt: true,
      publishedAt: true,
    },
  });
}

export type PostsIndexPageResult = {
  posts: Awaited<ReturnType<typeof getPostsIndex>>;
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

export async function getPostsIndexPage(requestedPage: number): Promise<PostsIndexPageResult> {
  const pageSize = POSTS_INDEX_PAGE_SIZE;
  const total = await prisma.feedArticle.count();
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const page = Math.min(Math.max(1, requestedPage), totalPages);

  const posts = await prisma.feedArticle.findMany({
    orderBy: { publishedAt: "desc" },
    skip: (page - 1) * pageSize,
    take: pageSize,
    select: {
      id: true,
      slug: true,
      title: true,
      excerpt: true,
      publishedAt: true,
    },
  });

  return { posts, total, page, pageSize, totalPages };
}
