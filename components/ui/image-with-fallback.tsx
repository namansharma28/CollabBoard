"use client";

import Image from 'next/image';
import { useState } from 'react';

interface ImageWithFallbackProps {
  src: string;
  fallbackSrc: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  priority?: boolean;
}

export function ImageWithFallback({ 
  src, 
  fallbackSrc, 
  alt, 
  className,
  width,
  height,
  priority
}: ImageWithFallbackProps) {
  const [currentSrc, setCurrentSrc] = useState(src);

  const handleError = () => {
    setCurrentSrc(fallbackSrc);
  };

  if (width && height) {
    return (
      <Image
        src={currentSrc}
        alt={alt}
        className={className}
        onError={handleError}
        width={width}
        height={height}
        priority={priority}
      />
    );
  }

  // If width and height are not provided, use a regular img tag
  // to allow for more flexible styling with Tailwind classes like h-6 w-auto
  // Note: Next/Image without width/height and with fill can be an option,
  // but requires the parent to have relative positioning.
  // Using <img> here for simplicity in this case.
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={currentSrc}
      alt={alt}
      className={className}
      onError={handleError}
    />
  );
} 