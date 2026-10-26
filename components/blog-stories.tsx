"use client";

import { useMemo, useState } from "react";
import { Newspaper } from "lucide-react";
import { EmptyState } from "@/components/empty-state";
import { StoryCard } from "@/components/story-card";
import { Eyebrow } from "@/components/ui/eyebrow";
import { cn } from "@/lib/utils";
import type { BlogPost } from "@/lib/posts";

export default function BlogStories({ posts }: { posts: BlogPost[] }) {
  const [category, setCategory] = useState<string | null>(null);

  const categories = useMemo(
    () =>
      Array.from(
        new Set(posts.map((post) => post.category).filter(Boolean)),
      ) as string[],
    [posts],
  );

  const [featured, ...rest] = category
    ? posts.filter((post) => post.category === category)
    : posts;

  const pillClass = (active: boolean) =>
    cn(
      "rounded-full border px-3.5 py-2 text-[13px] font-medium capitalize transition-colors",
      active
        ? "border-transparent bg-sa-ink text-white"
        : "border-sa-line text-sa-ink/75 hover:border-sa-orange hover:text-sa-orange",
    );

  return (
    <section
      id="stories"
      className="scroll-mt-4 px-3 pb-16 pt-24 md:px-5 lg:pb-24 lg:pt-28"
    >
      <div className="mx-auto max-w-[1280px]">
        <div className="flex flex-wrap items-end justify-between gap-6 px-2 lg:px-4">
          <div>
            <Eyebrow icon={Newspaper}>Latest stories</Eyebrow>
            <h2 className="mt-4 font-hand text-[38px] leading-[1.05] text-sa-ink sm:text-[48px] lg:text-[56px]">
              Notes from <span className="text-sa-ink/45">the field</span>
            </h2>
          </div>

          {categories.length > 1 && (
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                aria-pressed={!category}
                onClick={() => setCategory(null)}
                className={pillClass(!category)}
              >
                All
              </button>
              {categories.map((item) => (
                <button
                  key={item}
                  type="button"
                  aria-pressed={category === item}
                  onClick={() => setCategory(category === item ? null : item)}
                  className={pillClass(category === item)}
                >
                  {item}
                </button>
              ))}
            </div>
          )}
        </div>

        {featured ? (
          <div className="mt-8 flex flex-col gap-3">
            <StoryCard post={featured} featured />
            {rest.length > 0 && (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {rest.map((post) => (
                  <StoryCard key={post._id} post={post} />
                ))}
              </div>
            )}
          </div>
        ) : (
          <EmptyState />
        )}
      </div>
    </section>
  );
}
