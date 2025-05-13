
import React from 'react';

export const Logo: React.FC = () => {
  return (
    <div className="flex items-center cursor-pointer" onClick={() => window.location.reload()}>
      <img 
        src="/lovable-uploads/50ba7d2a-6fb7-4cdb-bded-a2296b3de220.png" 
        alt="AutoTP Logo" 
        className="h-[33px] w-auto"
      />
    </div>
  );
};
