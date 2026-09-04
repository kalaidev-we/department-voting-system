import React from 'react';

export function SkeletonBox({ className = "h-4 w-full" }: { className?: string }) {
  return (
    <div className={`bg-slate-200/80 animate-pulse rounded-xl ${className}`} />
  );
}

export function SummaryCardsSkeleton() {
  return (
    <div className="grid grid-cols-3 gap-2.5 sm:gap-4 my-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="p-3.5 sm:p-4 rounded-2xl bg-white border border-slate-100 shadow-xs space-y-2">
          <SkeletonBox className="h-3 w-16" />
          <SkeletonBox className="h-6 w-20" />
          <SkeletonBox className="h-2 w-12" />
        </div>
      ))}
    </div>
  );
}

export function ElectionCardSkeleton() {
  return (
    <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-100 shadow-xs space-y-3">
      <div className="flex items-start justify-between">
        <div className="space-y-1.5 flex-1 mr-4">
          <SkeletonBox className="h-4 w-3/4" />
          <SkeletonBox className="h-3 w-1/3" />
        </div>
        <SkeletonBox className="h-5 w-16 rounded-full" />
      </div>

      <div className="pt-3 border-t border-slate-50 flex justify-between items-center">
        <SkeletonBox className="h-3 w-28" />
        <SkeletonBox className="h-3 w-20" />
      </div>
    </div>
  );
}
