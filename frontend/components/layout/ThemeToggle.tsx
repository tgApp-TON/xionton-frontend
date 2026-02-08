'use client';
import { useEffect, useState } from 'react';
export function ThemeToggle() {
  const [isGrayscale, setIsGrayscale] = useState(false);
  useEffect(() => {
    const saved = localStorage.getItem('theme-grayscale');
    if (saved === 'true') {
      setIsGrayscale(true);
      document.documentElement.classList.add('grayscale-mode');
    }
  }, []);
  const toggleTheme = () => {
    const newValue = !isGrayscale;
    setIsGrayscale(newValue);
    if (newValue) {
      document.documentElement.classList.add('grayscale-mode');
      localStorage.setItem('theme-grayscale', 'true');
    } else {
      document.documentElement.classList.remove('grayscale-mode');
      localStorage.setItem('theme-grayscale', 'false');
    }
  };
  return (
    <button 
      onClick={toggleTheme}
      style={{
        position: 'fixed',
        top: '32px',
        left: '32px',
        zIndex: 50,
        width: '48px',
        height: '48px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'transparent',
        border: 'none',
        cursor: 'pointer',
        padding: '0'
      }}
      title={isGrayscale ? 'Color Mode' : 'Black & White Mode'}
    >
      <div style={{
        width: '28px',
        height: '4px',
        background: isGrayscale 
          ? 'linear-gradient(to right, #06b6d4, #8b5cf6, #ec4899)' 
          : 'white',
        borderRadius: '9999px',
        transition: 'background 0.3s ease'
      }}></div>
    </button>
  );
}
