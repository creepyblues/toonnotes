import { ImageResponse } from 'next/og';
import { createClient } from '@/lib/supabase/server';

export const runtime = 'edge';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const shareToken = searchParams.get('token');

  if (!shareToken) {
    return new Response('Missing token parameter', { status: 400 });
  }

  try {
    const supabase = await createClient();

    const { data, error } = await supabase.rpc('get_shared_note', {
      p_share_token: shareToken,
    });

    if (error || !data || data.length === 0) {
      // Return default OG image for not found
      return new ImageResponse(
        (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              width: '100%',
              height: '100%',
              backgroundColor: '#FAFAF9',
              fontFamily: 'Inter, sans-serif',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                marginBottom: '24px',
              }}
            >
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  backgroundColor: '#4C9C9B',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontSize: '28px',
                  fontWeight: 700,
                }}
              >
                T
              </div>
              <span style={{ fontSize: '36px', fontWeight: 700, color: '#4C9C9B' }}>
                ToonNotes
              </span>
            </div>
            <p style={{ fontSize: '24px', color: '#78716C' }}>Note not found</p>
          </div>
        ),
        {
          width: 1200,
          height: 630,
        }
      );
    }

    const note = data[0];
    const backgroundColor = note.design_background?.primaryColor || note.color || '#FFFFFF';
    const titleColor = note.design_colors?.titleText || '#1C1917';
    const bodyColor = note.design_colors?.bodyText || '#78716C';

    return new ImageResponse(
      (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            width: '100%',
            height: '100%',
            backgroundColor: backgroundColor,
            padding: '60px',
            fontFamily: 'Inter, sans-serif',
          }}
        >
          {/* ToonNotes logo */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              marginBottom: '40px',
            }}
          >
            <div
              style={{
                width: '40px',
                height: '40px',
                backgroundColor: '#4C9C9B',
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '24px',
                fontWeight: 700,
              }}
            >
              T
            </div>
            <span style={{ fontSize: '28px', fontWeight: 600, color: '#4C9C9B' }}>
              ToonNotes
            </span>
          </div>

          {/* Note content preview */}
          <div
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              backgroundColor: 'rgba(255, 255, 255, 0.9)',
              borderRadius: '24px',
              padding: '48px',
              boxShadow: '0 8px 30px rgba(0, 0, 0, 0.12)',
            }}
          >
            <h1
              style={{
                fontSize: '48px',
                fontWeight: 700,
                color: titleColor,
                marginBottom: '20px',
                lineHeight: 1.2,
              }}
            >
              {note.title || 'Shared Note'}
            </h1>
            <p
              style={{
                fontSize: '24px',
                color: bodyColor,
                lineHeight: 1.6,
                overflow: 'hidden',
                display: '-webkit-box',
                WebkitLineClamp: 4,
                WebkitBoxOrient: 'vertical',
              }}
            >
              {note.content?.slice(0, 200) || ''}
              {note.content && note.content.length > 200 ? '...' : ''}
            </p>

            {/* Labels */}
            {note.labels && note.labels.length > 0 && (
              <div
                style={{
                  display: 'flex',
                  gap: '8px',
                  marginTop: 'auto',
                  paddingTop: '24px',
                }}
              >
                {note.labels.slice(0, 3).map((label: string, i: number) => (
                  <span
                    key={i}
                    style={{
                      padding: '6px 16px',
                      borderRadius: '999px',
                      backgroundColor: 'rgba(76, 156, 155, 0.15)',
                      color: '#4C9C9B',
                      fontSize: '18px',
                      fontWeight: 500,
                    }}
                  >
                    #{label}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch {
    return new Response('Error generating image', { status: 500 });
  }
}
