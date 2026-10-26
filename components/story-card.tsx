import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { AuthorBadge } from "@/components/author-badge";
import { PostMeta } from "@/components/post-meta";
import { SmartImage } from "@/components/ui/smart-image";
import type { BlogPost } from "@/lib/posts";

export function StoryCard({
  post,
  featured,
}: {
  post: BlogPost;
  featured?: boolean;
}) {
  if (featured) {
    return (
      <Link
        href={`/blog/${post.slug}`}
        className="group grid grid-cols-1 overflow-hidden rounded-[26px] bg-white md:grid-cols-[1.15fr_1fr]"
      >
        <div className="relative min-h-[260px] overflow-hidden md:min-h-[400px]">
          <div className="absolute inset-0">
            <SmartImage
              src={post.imageUrl}
              alt={post.title}
              label="Story photo"
              tone="warm"
              sizes="(min-width: 768px) 640px, 100vw"
              className="h-full w-full transition-transform duration-500 group-hover:scale-[1.03]"
            />
          </div>
          <span className="absolute left-4 top-4 rounded-full bg-sa-ink px-3 py-1 text-[11.5px] font-semibold text-white">
            Latest story
          </span>
        </div>
        <div className="flex flex-col p-6 md:p-8 lg:p-10">
          <PostMeta post={post} />
          <h3 className="mt-5 font-hand text-[32px] leading-[1.05] text-sa-ink lg:text-[44px]">
            {post.title}
          </h3>
          <p className="mt-4 max-w-[460px] text-[14.5px] leading-relaxed text-sa-ink/65">
            {post.summary}
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-between gap-4 md:mt-auto md:pt-8">
            <AuthorBadge name={post.author} />
            <span className="inline-flex items-center gap-5 rounded-full bg-sa-ink py-1.5 pl-5 pr-1.5 text-[13px] font-semibold text-white transition-colors group-hover:bg-sa-blue">
              Read the story
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-sa-ink transition-transform group-hover:rotate-45">
                <ArrowUpRight size={15} />
              </span>
            </span>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group flex flex-col overflow-hidden rounded-[26px] bg-white transition-transform duration-300 hover:-translate-y-1"
    >
      <div className="relative h-[210px] overflow-hidden">
        <div className="absolute inset-0">
          <SmartImage
            src={post.imageUrl}
            alt={post.title}
            label="Story photo"
            tone="warm"
            sizes="(min-width: 1024px) 400px, (min-width: 640px) 50vw, 100vw"
            className="h-full w-full transition-transform duration-500 group-hover:scale-[1.03]"
          />
        </div>
      </div>
      <div className="flex flex-1 flex-col p-5 md:p-6">
        <PostMeta post={post} />
        <h3 className="mt-3 text-[19px] font-semibold leading-snug tracking-tight text-sa-ink">
          {post.title}
        </h3>
        <p className="mt-2 line-clamp-3 text-[13.5px] leading-relaxed text-sa-ink/60">
          {post.summary}
        </p>
        <div className="mt-auto flex items-center justify-between gap-4 pt-6">
          <AuthorBadge name={post.author} />
          <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-sa-ink text-white transition-[transform,background-color] duration-300 group-hover:rotate-45 group-hover:bg-sa-orange">
            <ArrowUpRight size={16} />
          </span>
        </div>
      </div>
    </Link>
  );
}

export default StoryCard;
