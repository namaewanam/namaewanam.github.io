import { getPostBySlug, getPostsByCategory, getCategories } from '@/lib/markdown';
import { notFound } from 'next/navigation';
import PostLayout from '@/components/PostLayout';

export async function generateStaticParams() {
  const categories = getCategories();
  const params: { category: string; slug: string }[] = [];

  categories.forEach((category) => {
    const posts = getPostsByCategory(category.slug);
    posts.forEach((post) => {
      params.push({
        category: category.slug,
        slug: post.slug,
      });
    });
  });

  return params;
}

export default function PostPage({
  params,
}: {
  params: { category: string; slug: string };
}) {
  const post = getPostBySlug(params.category, params.slug);

  if (!post) {
    notFound();
  }

  return <PostLayout post={post} />;
}
