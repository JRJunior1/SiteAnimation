import BlogStories from "@/components/blog-stories";
import { Hero } from "@/components/hero";
import { posts } from "@/lib/posts";

export default function HomePage() {
  return (
    <main>
      <Hero />
      <BlogStories posts={posts} />
    </main>
  );
}
