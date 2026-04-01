import React from "react";

const SkeletonTarjeta = () => {
  return (
    <div className="group relative bg-[var(--surface)] border border-white/5 rounded-md p-4 flex flex-col h-full w-[280px] animate-pulse">
      <div className="flex flex-row md:flex-col gap-4 flex-grow">
        {/* Icon Section Skeleton */}
        <div className="relative flex flex-col items-center justify-start gap-2">
          <div className="w-14 h-14 md:w-16 md:h-16 rounded-md bg-white/5 border border-white/5" />
        </div>

        {/* Content Section Skeleton */}
        <div className="flex-1 flex flex-col justify-between md:justify-start">
          <div className="space-y-4">
            <div className="h-2 w-20 bg-white/5 rounded" />
            <div className="h-5 w-40 bg-white/10 rounded" />
          </div>

          {/* Meta info chips Skeleton */}
          <div className="flex flex-wrap gap-2 mt-4">
            <div className="h-6 w-20 bg-white/5 rounded border border-white/5" />
            <div className="h-6 w-20 bg-white/5 rounded border border-white/5" />
          </div>
        </div>
      </div>

      {/* Address & Contact Skeleton */}
      <div className="border-t border-white/5 pt-4 mt-4 space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-4 h-4 rounded-full bg-white/5" />
          <div className="h-3 w-48 bg-white/5 rounded" />
        </div>
        <div className="flex items-center gap-3">
          <div className="w-4 h-4 rounded-full bg-white/5" />
          <div className="h-3 w-32 bg-white/5 rounded" />
        </div>
      </div>

      {/* Action Bar Skeleton */}
      <div className="mt-6 flex items-center justify-between">
        <div className="h-5 w-24 bg-white/5 rounded border border-white/5" />
        <div className="h-9 w-28 bg-white/5 rounded-md border border-white/5" />
      </div>
    </div>
  );
};

export default SkeletonTarjeta;
