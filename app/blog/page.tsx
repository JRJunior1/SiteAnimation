import BlogStories from "@/components/blog-stories";
import { posts } from "@/lib/posts";

export default function BlogPage() {
  return (
    <main>
      <BlogStories posts={posts} />
    </main>
  );
}
