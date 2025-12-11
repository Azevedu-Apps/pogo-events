
import React from 'react';

// --- MAIN EVENT LIST SKELETON ---
export const EventCardSkeleton: React.FC = () => {
  return (
    <div className="bg-slate-800 rounded-xl overflow-hidden border border-slate-700 shadow-md flex flex-col h-full animate-pulse">
      {/* Image Placeholder */}
      <div className="h-40 bg-slate-700 relative">
        <div className="absolute top-2 right-2 flex flex-col gap-1 items-end">
            {/* Badges Placeholder */}
            <div className="h-5 w-20 bg-slate-600 rounded"></div>
            <div className="h-5 w-16 bg-slate-600 rounded"></div>
        </div>
      </div>
      
      <div className="p-5 flex-1 flex flex-col space-y-4">
        {/* Title Placeholder */}
        <div className="h-7 bg-slate-700 rounded w-3/4"></div>
        
        {/* Date/Time Placeholder */}
        <div className="flex items-center gap-2">
            <div className="h-4 w-4 bg-slate-700 rounded-full"></div>
            <div className="h-4 bg-slate-700 rounded w-1/2"></div>
        </div>
        
        {/* Spacer to push buttons down */}
        <div className="flex-1"></div>
        
        {/* Actions Placeholder */}
        <div className="border-t border-slate-700/50 pt-4 flex flex-col gap-2">
            {/* Catalog Button */}
            <div className="h-10 bg-slate-700 rounded-lg w-full"></div>
            
            <div className="flex justify-between items-center mt-2">
                {/* Delete Button */}
                <div className="h-6 w-16 bg-slate-700 rounded"></div>
                
                <div className="flex gap-2">
                    {/* Edit Icon */}
                    <div className="h-8 w-8 bg-slate-700 rounded"></div>
                    {/* Details Button */}
                    <div className="h-8 w-20 bg-slate-700 rounded-lg"></div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

// --- CATALOG ITEM SKELETON ---
export const CatalogCardSkeleton: React.FC = () => {
    return (
        <div className="bg-slate-800 rounded-xl p-4 flex flex-col items-center relative border border-slate-700 animate-pulse h-[260px]">
            {/* ID Watermark */}
            <div className="absolute top-2 left-2 h-6 w-10 bg-slate-700/50 rounded"></div>
            
            {/* Image Circle */}
            <div className="w-24 h-24 rounded-full bg-slate-700 mb-2 mt-4"></div>
            
            {/* Name Line */}
            <div className="h-5 w-3/4 bg-slate-700 rounded mb-2"></div>
            
            {/* Types Dots */}
            <div className="flex gap-1 mb-4">
                <div className="w-2.5 h-2.5 rounded-full bg-slate-600"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-slate-600"></div>
            </div>
            
            {/* Buttons Grid */}
            <div className="flex gap-1.5 flex-wrap justify-center mt-auto w-full">
                <div className="w-8 h-8 rounded-full bg-slate-700"></div>
                <div className="w-8 h-8 rounded-full bg-slate-700"></div>
                <div className="w-8 h-8 rounded-full bg-slate-700"></div>
                <div className="w-8 h-8 rounded-full bg-slate-700"></div>
                <div className="w-8 h-8 rounded-full bg-slate-700"></div>
            </div>
            
            {/* Shundo Button */}
            <div className="mt-2 w-full h-6 bg-slate-700 rounded"></div>
        </div>
    )
}

// --- RAID CARD SKELETON ---
export const RaidCardSkeleton: React.FC = () => {
    return (
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-3 flex flex-col items-center animate-pulse h-[160px]">
            {/* Tier Badge */}
            <div className="self-start h-4 w-12 bg-slate-700 rounded mb-4"></div>
            
            {/* Image */}
            <div className="w-20 h-20 bg-slate-700 rounded-full mb-2"></div>
            
            {/* Name */}
            <div className="h-4 w-20 bg-slate-700 rounded mt-auto"></div>
        </div>
    )
}
