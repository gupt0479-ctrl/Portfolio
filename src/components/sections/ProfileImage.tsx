"use client";
import Image from "next/image";

interface ProfileImageProps {
  imageUrl: string;
  firstName: string;
  lastName: string;
}

export function ProfileImage({
  imageUrl,
  firstName,
  lastName,
}: ProfileImageProps) {
  return (
    <div className="flex justify-center @3xl:justify-end">
      <div className="relative h-64 w-64 overflow-hidden rounded-xl @md/hero:h-80 @md/hero:w-80 @lg/hero:h-96 @lg/hero:w-96">
        <Image
          src={imageUrl}
          alt={`${firstName} ${lastName}`}
          fill
          className="object-cover"
          priority
        />
      </div>
    </div>
  );
}
