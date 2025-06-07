import React from 'react';
import Link from 'next/link';

export const Logo: React.FC = () => {
  return (
    <Link href="/" className="flex items-center gap-2 group">
      {/* <div className="relative h-9 w-9 md:h-10 md:w-10 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-lg shadow-lg overflow-hidden transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg">
        <div className="absolute inset-[1px] bg-black bg-opacity-80 rounded-[7px] flex items-center justify-center overflow-hidden">
          <div className="text-2xl md:text-3xl font-bold bg-gradient-to-br from-white to-neutral-400 bg-clip-text text-transparent animate-gradient">A</div>
          <div className="absolute w-full h-full bg-gradient-to-b from-transparent via-transparent to-indigo-600 opacity-30"></div>
        </div>
      </div> */}
      <div className="flex flex-col">
        <span className="text-base md:text-4xl italic tracking-tighter px-2 font-bold bg-gradient-to-br from-white to-neutral-400 bg-clip-text text-transparent whitespace-nowrap">
          AutoTP
        </span>
        {/* <span className="text-[10px] md:text-xs text-neutral-500 font-medium -mt-1">
          Solana Exit Strategy
        </span> */}
      </div>
    </Link>
  );
};
