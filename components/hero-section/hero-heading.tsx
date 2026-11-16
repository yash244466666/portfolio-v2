interface HeroHeadingProps {
  greeting: string;
  firstLine: string;
  emphasis: string;
  fullName: string;
}

/**
 * The single stable h1 for the page. The visible name stays on one line
 * in uniform white, while `aria-label` keeps it readable as one continuous name.
 */
export function HeroHeading({
  greeting,
  firstLine,
  emphasis,
  fullName,
}: HeroHeadingProps) {
  return (
    <div className="animate-fade-in-up motion-reduce:animate-none">
      <p className="mb-2 text-base font-medium text-muted-foreground sm:text-lg md:text-xl">
        {greeting}
      </p>
      <h1
        aria-label={fullName}
        className="mb-4 whitespace-nowrap text-[clamp(1.125rem,5vw,1.875rem)] font-bold leading-tight text-foreground sm:text-4xl md:text-5xl"
      >
        {firstLine} {emphasis}
      </h1>
    </div>
  );
}

export default HeroHeading;
