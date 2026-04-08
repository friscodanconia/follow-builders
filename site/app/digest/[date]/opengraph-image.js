import { ImageResponse } from 'next/og';

export const alt = 'AI Builders Digest';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function Image({ params }) {
  const date = params.date;

  const formattedDate = new Date(`${date}T00:00:00`).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          background: '#faf8f5',
          padding: '60px',
          fontFamily: 'Georgia, serif',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div
            style={{
              fontSize: 48,
              fontWeight: 700,
              color: '#1a1a1a',
              letterSpacing: '-0.02em',
            }}
          >
            AI Builders Digest
          </div>
          <div
            style={{
              fontSize: 24,
              color: '#c45d2c',
              marginTop: 12,
              fontWeight: 600,
            }}
          >
            {formattedDate}
          </div>
        </div>

        <div
          style={{
            fontSize: 28,
            color: '#4a4540',
            lineHeight: 1.5,
          }}
        >
          A daily summary of what top AI builders are shipping.
        </div>

        <div
          style={{
            fontSize: 18,
            color: '#8a8279',
          }}
        >
          aiupdates.soumyosinha.com
        </div>
      </div>
    ),
    { ...size }
  );
}
