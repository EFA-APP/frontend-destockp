import React from "react";

const SkeletonProductoBusqueda = () => {
    return (
        <div className="px-3 py-3 border-b border-[var(--border-subtle)] last:border-0 rounded animate-pulse">
            <div className="flex justify-between items-start">
                <div className="flex flex-col gap-2 flex-1">
                    <div className="h-4 w-32 bg-white/10 rounded" />
                    <div className="h-2 w-48 bg-white/5 rounded" />
                </div>
                <div className="flex flex-col items-end gap-2">
                    <div className="h-4 w-16 bg-white/10 rounded" />
                    <div className="h-3 w-12 bg-white/5 rounded" />
                </div>
            </div>
        </div>
    );
};

export default SkeletonProductoBusqueda;
