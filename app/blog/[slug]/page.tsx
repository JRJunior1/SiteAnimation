import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Clock } from "lucide-react";
import { AuthorBadge } from "@/components/author-badge";
import { SmartImage } from "@/components/ui/smart-image";
import { posts } from "@/lib/posts";

export const dynamicParams = false;

export function generateStaticParams() {
  return posts.map((post) => ({ slug: post.slug }));
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = posts.find((item) => item.slug === slug);

  if (!post) notFound();

  return (
    <main className="px-3 pb-16 pt-10 md:px-5">
      <article className="mx-auto max-w-[900px] overflow-hidden rounded-[34px] bg-white">
        <div className="relative h-[280px] md:h-[380px]">
          <SmartImage
            src={post.imageUrl}
            alt={post.title}
            label="Story photo"
            tone="warm"
            sizes="(min-width: 900px) 900px, 100vw"
            priority
            className="h-full w-full"
          />
        </div>

        <div className="p-6 md:p-10 lg:p-12">
          <Link
            href="/blog"
            className="inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-sa-ink/55 transition-colors hover:text-sa-orange"
          >
            <ArrowLeft size={14} />
            All stories
          </Link>

          <div className="mt-5 flex flex-wrap items-center gap-x-2 gap-y-1 text-[12px] text-sa-ink/55">
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
          </div>

          <h1 className="mt-5 font-hand text-[40px] leading-[1.02] text-sa-ink sm:text-[54px]">
            {post.title}
          </h1>

          <p className="mt-5 text-[16px] leading-relaxed text-sa-ink/70">
            {post.summary}
          </p>

          <div className="mt-8 space-y-4 border-t border-sa-ink/10 pt-8 text-[14.5px] leading-relaxed text-sa-ink/65">
            <p>
              This is a preview article for the SEEDAfrique stories section.
              The full write-up will appear here once the team publishes it.
            </p>
            <p>
              In the meantime, the programmes, events, and photo galleries are
              the best way to see what students are building across the
              continent.
            </p>
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-sa-ink/10 pt-6">
            <AuthorBadge name={post.author} />
            <Link
              href="/joinus"
              className="text-[13px] font-semibold text-sa-orange transition-colors hover:text-sa-ink"
            >
              Join the community
            </Link>
          </div>
        </div>
      </article>
    </main>
  );
}
