"use client";

import Image from "next/image";
import { useState } from "react";
import { SITE_PROFILE } from "@/lib/site-config";

export default function Headshot() {
  const [failed, setFailed] = useState(false);

  return (
    <div className="relative shrink-0 w-24 h-24 rounded-full overflow-hidden bg-gray-200 dark:bg-neutral-800">
      <div
        className="absolute inset-0 flex items-center justify-center text-xl font-bold text-gray-500 dark:text-gray-400 select-none"
        aria-hidden={!failed}
      >
        {SITE_PROFILE.initials}
      </div>
      {!failed && (
        <Image
          src={SITE_PROFILE.assets.headshotPath}
          alt={SITE_PROFILE.siteName}
          width={96}
          height={96}
          className="relative w-full h-full object-cover"
          onError={() => setFailed(true)}
        />
      )}
    </div>
  );
}
