'use client';

import { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

export function ScrollButtons() {
  const [showScrollDown, setShowScrollDown] = useState(true);
  const [showScrollUp, setShowScrollUp] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const scrollHeight = document.documentElement.scrollHeight;
      const clientHeight = window.innerHeight;
      const isScrollable = scrollHeight > clientHeight;
      if (!isScrollable) {
        setShowScrollDown(false);
        setShowScrollUp(false);
        return;
      }
      setShowScrollDown(scrollTop + clientHeight < scrollHeight - 100);
      setShowScrollUp(scrollTop > 100);
    };
    window.addEventListener('scroll', handleScroll);
    handleScroll();
    window.addEventListener('resize', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, []);

  const scrollDown = () => {
    window.scrollBy({ top: window.innerHeight * 0.8, behavior: 'smooth' });
  };

  const scrollUp = () => {
    window.scrollBy({ top: -window.innerHeight * 0.8, behavior: 'smooth' });
  };

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 'calc(48px + env(safe-area-inset-bottom, 0px))',
        right: '24px',
        zIndex: 99997,
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
      }}
    >
      {showScrollUp && (
        <button
          onClick={scrollUp}
          style={{
            width: '55px',
            height: '55px',
            borderRadius: '50%',
            background: 'rgba(139, 92, 246, 0.2)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(139, 92, 246, 0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'all 0.3s',
          }}
        >
          <ChevronUp className="text-purple-300" size={20} />
        </button>
      )}
      {showScrollDown && (
        <button
          onClick={scrollDown}
          style={{
            width: '55px',
            height: '55px',
            borderRadius: '50%',
            background: 'rgba(139, 92, 246, 0.2)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(139, 92, 246, 0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'all 0.3s',
          }}
        >
          <ChevronDown className="text-purple-300" size={20} />
        </button>
      )}
    </div>
  );
}
