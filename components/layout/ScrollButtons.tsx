'use client';
import { useState, useEffect } from 'react';
import { ThemeToggle } from './ThemeToggle';
import { MenuButton } from './MenuButton';
import { StatsScreen } from './StatsScreen';

export function ScrollButtons() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      if (currentScrollY > lastScrollY && currentScrollY > 50) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }
      
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  return (
    <>
      {/* Theme Toggle - скрывается */}
      <div 
        className="transition-transform duration-300"
        style={{
          transform: isVisible ? 'translateY(0)' : 'translateY(-100px)'
        }}
      >
        <ThemeToggle />
      </div>

      {/* Menu Button - скрывается но остаётся кликабельной */}
      <div 
        className="transition-transform duration-300"
        style={{
          transform: isVisible ? 'translateY(0)' : 'translateY(-100px)'
        }}
      >
        <MenuButton 
          isOpen={isMenuOpen}
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        />
      </div>

      {/* Stats Screen */}
      <StatsScreen 
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
      />
    </>
  );
}
