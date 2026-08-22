'use client';

import React from 'react';

interface HumAiLogoProps {
  variant?: 'full' | 'horizontal' | 'icon';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  showTagline?: boolean;
  className?: string;
}

export default function HumAiLogo({
  variant = 'horizontal',
  size = 'md',
  showTagline = false,
  className = '',
}: HumAiLogoProps) {
  // Size mapping
  const iconDimensions = {
    xs: { w: 22, h: 22 },
    sm: { w: 28, h: 28 },
    md: { w: 36, h: 36 },
    lg: { w: 48, h: 48 },
    xl: { w: 64, h: 64 },
  }[size];

  const textSize = {
    xs: 'text-xs',
    sm: 'text-sm',
    md: 'text-lg',
    lg: 'text-2xl',
    xl: 'text-3xl',
  }[size];

  const taglineSize = {
    xs: 'text-[7px]',
    sm: 'text-[8px]',
    md: 'text-[9px]',
    lg: 'text-[11px]',
    xl: 'text-xs',
  }[size];

  // Official Vector Dual-Figure 'H' Emblem Mark
  const Emblem = ({ width, height }: { width: number; height: number }) => (
    <svg
      width={width}
      height={height}
      viewBox="0 0 60 56"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="shrink-0 transition-transform duration-300 group-hover:scale-105"
    >
      {/* Left Figure Head */}
      <circle
        cx="14"
        cy="10"
        r="5.5"
        className="fill-[#1F2937] dark:fill-slate-100"
      />
      {/* Left Figure Body */}
      <rect
        x="9"
        y="19"
        width="10"
        height="28"
        rx="5"
        className="fill-[#1F2937] dark:fill-slate-100"
      />

      {/* Right Figure Head */}
      <circle
        cx="46"
        cy="10"
        r="5.5"
        fill="#10B981"
      />
      {/* Right Figure Body */}
      <rect
        x="41"
        y="19"
        width="10"
        height="28"
        rx="5"
        fill="#10B981"
      />

      {/* Connecting Emerald Arc Bridge (Ribbon / Hands Joining) */}
      <path
        d="M 18 29 C 23 37, 37 37, 42 29 C 40 37, 20 37, 18 29 Z"
        fill="#10B981"
      />
      <path
        d="M 17 29.5 Q 30 40.5 43 29.5"
        stroke="#10B981"
        strokeWidth="5"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );

  if (variant === 'icon') {
    return (
      <div className={`inline-flex items-center justify-center ${className}`}>
        <Emblem width={iconDimensions.w} height={iconDimensions.h} />
      </div>
    );
  }

  return (
    <div className={`inline-flex flex-col select-none ${className}`}>
      <div className="flex items-center gap-2.5">
        <Emblem width={iconDimensions.w} height={iconDimensions.h} />

        {/* Wordmark: HUMΛI */}
        <div className="flex flex-col">
          <div
            className={`font-black tracking-tight flex items-baseline font-sans text-slate-900 dark:text-white ${textSize}`}
            style={{ letterSpacing: '0.04em' }}
          >
            <span>HUM</span>
            <span className="inline-block transform scale-y-95 mx-[0.5px]">Λ</span>
            <span className="relative">
              I
              <span className="absolute -top-1 right-0 w-1.5 h-1.5 rounded-full bg-[#10B981] inline-block" />
            </span>
          </div>

          {showTagline && (
            <div
              className={`font-bold tracking-wider uppercase text-slate-500 dark:text-slate-400 font-sans mt-0.5 flex items-center gap-1 truncate ${taglineSize}`}
            >
              <span>HR Automation</span>
              <span className="text-[#10B981]">•</span>
              <span>Blueprints</span>
              <span className="text-[#10B981]">•</span>
              <span>AI Assistant</span>
            </div>
          )}
        </div>
      </div>

      {variant === 'full' && !showTagline && (
        <div
          className={`font-bold tracking-wider uppercase text-slate-500 dark:text-slate-400 font-sans mt-1.5 flex items-center justify-center gap-1.5 ${taglineSize}`}
        >
          <span>HR AUTOMATION</span>
          <span className="text-[#10B981] font-black">•</span>
          <span>BLUEPRINTS</span>
          <span className="text-[#10B981] font-black">•</span>
          <span>AI ASSISTANT</span>
        </div>
      )}
    </div>
  );
}
