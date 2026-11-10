interface HeroDescriptionProps {
  tagline: string;
}

export function HeroDescription({ tagline }: HeroDescriptionProps) {
  return (
    <div
      className="animate-fade-in-up motion-reduce:animate-none"
      style={{ animationDelay: "240ms" }}
    >
      <p className="mx-auto mb-6 max-w-3xl px-4 text-base leading-relaxed text-gray-300 sm:mb-8 sm:px-0 sm:text-lg md:text-xl">
        {tagline}
      </p>
    </div>
  );
}

export default HeroDescription;
