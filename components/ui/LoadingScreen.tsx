"use client";

import React from "react";

export function LoadingScreen({ message, fullScreen = true }: { message?: string; fullScreen?: boolean }) {
  const content = (
    <div className="flex flex-col items-center justify-center animate-in fade-in duration-500">
      <div className="relative w-16 h-16">
        <img 
          src="/logo.png" 
          alt="ChainVolio" 
          className="w-full h-full object-contain animate-spin-slow brightness-125" 
        />
      </div>
    </div>
  );

  if (fullScreen) {
    return (
      <main className="min-h-screen text-white flex items-center justify-center backdrop-blur-[2px]">
        {content}
      </main>
    );
  }

  return content;
}
