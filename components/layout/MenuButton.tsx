'use client';

interface MenuButtonProps {
  isOpen: boolean;
  onClick: () => void;
}

export function MenuButton({ isOpen, onClick }: MenuButtonProps) {
  return (
    <button
      onClick={onClick}
      style={{
        position: 'fixed',
        top: '32px',
        right: '32px',
        width: '48px',
        height: '48px',
        background: 'transparent',
        border: 'none',
        cursor: 'pointer',
        zIndex: 50,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 0
      }}
      aria-label="Menu"
    >
      {isOpen ? (
        // X когда открыто
        <>
          <div
            style={{
              position: 'absolute',
              width: '28px',
              height: '4px',
              background: 'white',
              borderRadius: '9999px',
              transform: 'rotate(45deg)',
              transition: 'all 0.3s ease'
            }}
          />
          <div
            style={{
              position: 'absolute',
              width: '28px',
              height: '4px',
              background: 'white',
              borderRadius: '9999px',
              transform: 'rotate(-45deg)',
              transition: 'all 0.3s ease'
            }}
          />
        </>
      ) : (
        // 3 линии когда закрыто
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <div
            style={{
              width: '28px',
              height: '3px',
              background: 'white',
              borderRadius: '9999px',
              transition: 'all 0.3s ease'
            }}
          />
          <div
            style={{
              width: '28px',
              height: '3px',
              background: 'white',
              borderRadius: '9999px',
              transition: 'all 0.3s ease'
            }}
          />
          <div
            style={{
              width: '28px',
              height: '3px',
              background: 'white',
              borderRadius: '9999px',
              transition: 'all 0.3s ease'
            }}
          />
        </div>
      )}
    </button>
  );
}
