/** Floating "spotlight" stats card, pulled up over the hero/content
 * boundary with a negative top margin. */
export function StatsCard() {
  const tags = ["React", "Node.js", "TypeScript"];

  return (
    <div className="relative z-[5] mx-auto -mt-16 w-full max-w-[860px] px-6">
      <div className="flex flex-wrap items-center justify-between gap-6 rounded-md border border-white/12 border-t-2 border-t-primary bg-[rgba(20,20,19,0.72)] px-7 py-6 backdrop-blur-[20px]">
        <div>
          <div className="text-2xl font-bold text-white">3+</div>
          <div className="text-[13px] text-white/60">Years of experience</div>
        </div>
        <div className="w-px self-stretch bg-white/15" />
        <div>
          <div className="text-2xl font-bold text-white">5</div>
          <div className="text-[13px] text-white/60">Developers led</div>
        </div>
        <div className="w-px self-stretch bg-white/15" />
        <div>
          <div className="text-base font-bold text-white">FPT Software</div>
          <div className="text-[13px] text-white/60">Current company</div>
        </div>
        <div className="w-px self-stretch bg-white/15" />
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <span
              key={tag}
              className="rounded-sm bg-white/10 px-2.5 py-1 text-xs font-semibold text-white/85"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
