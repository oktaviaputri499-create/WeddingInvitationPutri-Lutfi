'use client';

import { useState } from 'react';
import { BookOpen, X } from 'lucide-react';

export default function OurStoryButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed bottom-5 left-5 z-[60] flex items-center gap-2 rounded-full bg-dark-brown/90 px-4 py-3 text-white shadow-lg"
      >
        <BookOpen size={20} />
        Our Story
      </button>

      {open && (
        <div className="fixed inset-0 z-[70] bg-black/70">
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Close"
            className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-black"
          >
            <X size={20} />
          </button>
          <iframe
            src="/our-story.html"
            title="Our Story"
            className="h-full w-full border-0"
          />
        </div>
      )}
    </>
  );
}