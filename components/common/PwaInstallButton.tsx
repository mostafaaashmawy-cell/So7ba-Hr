'use client';

import React, { useState, useEffect } from 'react';
import { Download, Smartphone } from 'lucide-react';
import { useLanguage } from '@/lib/context/LanguageContext';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

interface PwaInstallButtonProps {
  className?: string;
  variant?: 'header' | 'drawer' | 'banner';
}

export default function PwaInstallButton({ className = '', variant = 'header' }: PwaInstallButtonProps) {
  const { isRtl } = useLanguage();
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if app is already running as standalone PWA
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;

    if (isStandalone) {
      setIsInstalled(true);
      return;
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setIsInstallable(true);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setIsInstallable(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) {
      // Fallback for iOS or already triggered browsers
      alert(
        isRtl
          ? 'لتثبيت التطبيق على هاتفك: اضغط على زر المشاركة (Share) في المتصفح ثم اختر "إضافة إلى الشاشة الرئيسية" (Add to Home Screen).'
          : 'To install on your mobile device: tap your browser Share/Menu button and select "Add to Home Screen".'
      );
      return;
    }

    try {
      await deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === 'accepted') {
        setIsInstallable(false);
        setIsInstalled(true);
      }
      setDeferredPrompt(null);
    } catch (err) {
      console.warn('PWA installation prompt error:', err);
    }
  };

  // If already installed or desktop screen, can hide or show minimal
  if (isInstalled) return null;

  if (variant === 'drawer') {
    return (
      <button
        type="button"
        onClick={handleInstall}
        className={`w-full flex items-center justify-center gap-2 p-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 active:scale-98 text-white text-xs font-bold shadow-xs transition-all cursor-pointer ${className}`}
      >
        <Download className="w-4 h-4" />
        <span>{isRtl ? 'تثبيت تطبيق الهاتف' : 'Install Mobile App'}</span>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleInstall}
      className={`md:hidden flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-white text-[11px] font-bold shadow-xs transition-all animate-pulse shrink-0 cursor-pointer ${className}`}
      title={isRtl ? 'تثبيت التطبيق على الهاتف' : 'Install App on Phone'}
    >
      <Download className="w-3.5 h-3.5" />
      <span>{isRtl ? 'تثبيت التطبيق' : 'Install App'}</span>
    </button>
  );
}
