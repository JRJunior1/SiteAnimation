import { Clock } from "lucide-react";
import type { BlogPost } from "@/lib/posts";

export function PostMeta({ post }: { post: BlogPost }) {
  return (
    <span className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[12px] text-sa-ink/55">
      {post.category && (
        <span className="font-semibold uppercase tracking-[0.14em] text-sa-orange">
          {post.category}
        </span>
      )}
      {post.category && <span className="text-sa-ink/25">/</span>}
      <span>{post.dateLabel}</span>
      <span className="text-sa-ink/25">/</span>
      <span className="flex items-center gap-1">
        <Clock size={12} /> {post.minutes} min read
      </span>
    </span>
  );
}

export default PostMeta;
