interface HeroTypewriterTitleProps {
  title: string;
}

/**
 * Decorative rotating role labels. The full-stack role is stated in the hero
 * paragraph, so this element is hidden from assistive technology and may
 * cycle freely without changing the accessible name of the page.
 */
export function HeroTypewriterTitle({ title }: HeroTypewriterTitleProps) {
  return (
    <div
      aria-hidden="true"
      className="animate-fade-in-up motion-reduce:animate-none"
      style={{ animationDelay: "120ms" }}
    >
      <p className="mb-6 min-h-[60px] text-3xl font-bold leading-tight text-white sm:min-h-[80px] sm:text-4xl md:min-h-[120px] md:text-6xl">
        <span className="bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
          {title}
        </span>
        <span className="ml-1 animate-pulse text-purple-400">|</span>
      </p>
    </div>
  );
}

export default HeroTypewriterTitle;
