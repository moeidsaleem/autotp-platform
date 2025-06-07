import React from 'react';
import { GridBackground } from './ui/backgrounds';

export function GridTest() {
  return (
    <div className="w-full h-screen">
      <GridBackground className="w-full h-full">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-white">Grid Test</h1>
          <p className="text-gray-300">You should see a grid pattern behind this text</p>
          <div className="w-20 h-20 bg-red-500 mx-auto rounded"></div>
        </div>
      </GridBackground>
    </div>
  );
} 