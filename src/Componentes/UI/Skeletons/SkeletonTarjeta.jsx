import React from "react";

const SkeletonTarjeta = () => {
  return (
    <div className="group relative bg-[var(--surface)] border border-black/5 rounded-md p-4 flex flex-col h-full w-[280px] ">
      <div className="flex flex-row md:flex-col gap-4 flex-grow">
        {/* Icon Section Skeleton */}
        <div className="relative flex flex-col items-center justify-start gap-2">
          <div className="w-14 h-14 md:w-16 md:h-16 rounded-md bg-black/5 border border-black/5 overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full animate-[shimmer_1.5s_infinite]" />
          </div>
        </div>

        {/* Content Section Skeleton */}
        <div className="flex-1 flex flex-col justify-between md:justify-start">
          <div className="space-y-4">
            <div className="h-2 w-20 bg-black/5 rounded overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full animate-[shimmer_1.5s_infinite]" />
            </div>
            <div className="h-5 w-40 bg-black/10 rounded overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full animate-[shimmer_1.5s_infinite]" />
            </div>
          </div>

          {/* Meta info chips Skeleton */}
          <div className="flex flex-wrap gap-2 mt-4">
            <div className="h-6 w-20 bg-black/5 rounded border border-black/5 overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full animate-[shimmer_1.5s_infinite]" />
            </div>
            <div className="h-6 w-20 bg-black/5 rounded border border-black/5 overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full animate-[shimmer_1.5s_infinite]" />
            </div>
          </div>
        </div>
      </div>

      {/* Address & Contact Skeleton */}
      <div className="border-t border-black/5 pt-4 mt-4 space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-4 h-4 rounded-full bg-black/5 overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full animate-[shimmer_1.5s_infinite]" />
          </div>
          <div className="h-3 w-48 bg-black/5 rounded overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full animate-[shimmer_1.5s_infinite]" />
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-4 h-4 rounded-full bg-black/5 overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full animate-[shimmer_1.5s_infinite]" />
          </div>
          <div className="h-3 w-32 bg-black/5 rounded overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full animate-[shimmer_1.5s_infinite]" />
          </div>
        </div>
      </div>

      {/* Action Bar Skeleton */}
      <div className="mt-6 flex items-center justify-between">
        <div className="h-5 w-24 bg-black/5 rounded border border-black/5 overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full animate-[shimmer_1.5s_infinite]" />
        </div>
        <div className="h-9 w-28 bg-black/5 rounded-md border border-black/5 overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full animate-[shimmer_1.5s_infinite]" />
        </div>
      </div>
    </div>
  );
};

export default SkeletonTarjeta;
