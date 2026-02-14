'use client';

import { useState } from 'react';
import { Megaphone, X, Music } from 'lucide-react';

export default function ProjectUpdateAnnouncement() {
  const [isOpen, setIsOpen] = useState(true);

  const handleClose = () => {
    setIsOpen(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 dark:bg-black/50 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-in fade-in duration-300">
      <div className="bg-card text-card-foreground border border-border rounded-2xl mx-4 max-w-lg w-full shadow-2xl animate-bounce-in overflow-hidden">
        {/* Accent header */}
        <div className="bg-primary/10 dark:bg-primary/20 border-b border-border px-6 sm:px-8 pt-6 pb-4">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/20 dark:bg-primary/30 text-primary">
              <Megaphone className="h-6 w-6" />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-xl font-bold text-foreground">
                Project update
              </h2>
              <p className="text-sm text-muted-foreground mt-0.5 flex items-center gap-1.5">
                <Music className="h-3.5 w-3.5" />
                MUSE MUSIC
              </p>
            </div>
            <button
              type="button"
              onClick={handleClose}
              className="text-muted-foreground hover:text-foreground transition-colors p-1.5 rounded-lg hover:bg-accent"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="p-6 sm:p-8">
          <div className="text-muted-foreground text-sm leading-relaxed space-y-3">
            <p className="text-foreground/90">
              MUSE MUSIC has reached the end of its run, so we’ve turned off the <strong className="text-foreground">analysis</strong> feature.
            </p>
            <p>
              Any songs you translated earlier are still here — you can browse and use them as before.
            </p>
          </div>

          <div className="mt-6 flex justify-end">
            <button
              type="button"
              onClick={handleClose}
              className="px-5 py-2.5 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity font-medium shadow-sm"
            >
              Got it
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
