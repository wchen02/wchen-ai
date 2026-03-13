import type { ImgHTMLAttributes } from "react";

export default function MdxImage({
  src,
  alt,
  title,
  className = "",
  ...rest
}: ImgHTMLAttributes<HTMLImageElement>) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt ?? ""}
      title={title}
      loading="lazy"
      className={`max-w-full h-auto rounded-lg ${className}`.trim()}
      {...rest}
    />
  );
}
