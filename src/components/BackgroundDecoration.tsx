import React from 'react';

export const BackgroundDecoration = () => {
  return (
    <div className="fixed inset-0 -z-10 h-full w-full bg-neutral-950">
      {/* Animated grid pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#222_1px,transparent_1px),linear-gradient(to_bottom,#222_1px,transparent_1px)] bg-[size:8rem_8rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_110%)]" 
        style={{
          animation: 'grid-fade 8s ease-in-out infinite alternate'
        }}
      />
      
      {/* Subtle animated dots */}
      <div className="absolute inset-0" 
        style={{ 
          backgroundImage: 'radial-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px)',
          backgroundSize: '38px 38px',
          animation: 'dots-fade 15s linear infinite'
        }}
      />
      
      {/* Top green radial glow with animation */}
      <div className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2"
        style={{
          animation: 'pulse 15s ease-in-out infinite alternate'
        }}
      >
        <div className="h-[45rem] w-[45rem] bg-contrast opacity-[0.15] blur-[128px] rounded-full" />
      </div>

      {/* Bottom left purple radial glow with animation */}
      <div className="absolute left-0 bottom-0 -translate-x-1/2 translate-y-1/2"
        style={{
          animation: 'pulse-delay 20s ease-in-out infinite alternate'
        }}
      >
        <div className="h-[40rem] w-[40rem] bg-purple-600 opacity-[0.10] blur-[128px] rounded-full" />
      </div>
      
      {/* Right subtle blue glow */}
      <div className="absolute right-0 top-1/2 translate-x-1/2 -translate-y-1/2"
        style={{
          animation: 'pulse-delay 18s ease-in-out infinite alternate-reverse'
        }}
      >
        <div className="h-[35rem] w-[35rem] bg-blue-600 opacity-[0.08] blur-[128px] rounded-full" />
      </div>
      
      {/* Animation keyframes defined in MobileAdaptation.css */}
    </div>
  );
};
