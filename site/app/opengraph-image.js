import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'AI Builders Digest';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          background: '#faf8f5',
          fontFamily: 'Georgia, serif',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            padding: '60px',
          }}
        >
          <div
            style={{
              fontSize: 64,
              fontWeight: 700,
              color: '#1a1a1a',
              letterSpacing: '-0.02em',
            }}
          >
            AI Builders Digest
          </div>
          <div
            style={{
              fontSize: 28,
              color: '#c45d2c',
              marginTop: 20,
              fontWeight: 600,
            }}
          >
            Follow builders, not influencers.
          </div>
          <div
            style={{
              fontSize: 22,
              color: '#8a8279',
              marginTop: 16,
            }}
          >
            A daily summary of what matters in AI, written for humans.
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
