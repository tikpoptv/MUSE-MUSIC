import { ImageResponse } from 'next/og';

export const size = {
  width: 64,
  height: 64,
};

export const contentType = 'image/png';

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #7B61FF, #FF8AE2)',
          borderRadius: '16px',
          color: '#fff',
          fontSize: 40,
          fontWeight: 600,
          fontFamily: '"Segoe UI Symbol", "Apple Color Emoji", "Noto Color Emoji", sans-serif',
        }}
      >
        ♫
      </div>
    ),
    size
  );
}

