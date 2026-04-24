import React from "react";

const SkeletonFilaTabla = () => {
    return (
        <div className="bg-[#181818] rounded-2xl border border-black/10 overflow-hidden shadow-2xl flex flex-col ">
            {/* Product Identity Header Skeleton */}
            <div className="p-4 bg-gradient-to-br from-white/[0.06] to-transparent border-b border-black/5">
                <div className="flex items-start justify-between gap-4 mb-2">
                    <div className="flex flex-col gap-3 min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                            <div className="h-4 w-12 bg-black/5 rounded" />
                            <div className="h-4 w-10 bg-black/5 rounded" />
                        </div>
                        <div className="h-6 w-48 bg-black/10 rounded" />
                        <div className="h-3 w-32 bg-black/5 rounded mt-1" />
                    </div>
                    <div className="shrink-0">
                        <div className="w-10 h-10 rounded-xl bg-black/5 border border-black/10 shadow-inner" />
                    </div>
                </div>
            </div>

            {/* Warehouse Breakdown Skeleton */}
            <div className="p-3 bg-black/30 flex flex-col gap-2">
                <div className="px-1 mb-1">
                    <div className="h-3 w-20 bg-black/5 rounded" />
                </div>

                {Array.from({ length: 3 }).map((_, i) => (
                    <div
                        key={i}
                        className="flex items-center justify-between p-3.5 rounded-xl bg-white/[0.02] border border-transparent"
                    >
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                            <div className="w-1.5 h-1.5 rounded-full bg-black/10" />
                            <div className="h-3 w-24 bg-black/5 rounded" />
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="h-5 w-10 bg-black/5 rounded" />
                            <div className="w-4 h-4 bg-black/5 rounded" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default SkeletonFilaTabla;
