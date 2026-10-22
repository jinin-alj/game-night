import Image from "next/image";

type DecorativeArtProps = {
  src: string;
  width: number;
  height: number;
  className?: string;
  preload?: boolean;
};

/** An illustration from public/art that screen readers skip; text never goes on top of it. */
export function DecorativeArt({
  src,
  width,
  height,
  className,
  preload,
}: DecorativeArtProps) {
  return (
    <Image
      src={src}
      alt=""
      aria-hidden="true"
      width={width}
      height={height}
      // SVGs are already small and sharp at every size, so they skip image optimization.
      unoptimized
      preload={preload}
      className={className}
    />
  );
}
