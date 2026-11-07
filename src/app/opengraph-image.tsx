import { ImageResponse } from 'next/og';

export const alt = 'SQL Schemer — Generador de Diagramas UML desde SQL';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(135deg, #020617 0%, #0f172a 50%, #020617 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          padding: '60px',
          fontFamily: 'system-ui, -apple-system, sans-serif',
        }}
      >
        {/* Ambient Glows */}
        <div
          style={{
            position: 'absolute',
            top: '80px',
            left: '200px',
            width: '400px',
            height: '250px',
            background: 'rgba(99, 102, 241, 0.25)',
            filter: 'blur(100px)',
            borderRadius: '9999px',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: '80px',
            right: '200px',
            width: '350px',
            height: '250px',
            background: 'rgba(6, 182, 212, 0.2)',
            filter: 'blur(100px)',
            borderRadius: '9999px',
          }}
        />

        {/* Central Logo Box */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '20px',
            marginBottom: '28px',
          }}
        >
          {/* Database Squircle Icon */}
          <div
            style={{
              width: '84px',
              height: '84px',
              borderRadius: '24px',
              background: '#090d16',
              border: '2px solid rgba(99, 102, 241, 0.6)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 35px rgba(99, 102, 241, 0.4)',
            }}
          >
            <svg
              width="48"
              height="48"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#818cf8"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <ellipse cx="12" cy="5" rx="9" ry="3" />
              <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
              <path d="M3 12c0 1.66 4 3 9 3s9-1.34 9-3" />
            </svg>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span
              style={{
                fontSize: '52px',
                fontWeight: 900,
                color: '#ffffff',
                letterSpacing: '-1.5px',
              }}
            >
              SQL <span style={{ color: '#818cf8' }}>Schemer</span>
            </span>
            <span
              style={{
                fontSize: '14px',
                fontWeight: 600,
                color: '#94a3b8',
                letterSpacing: '2px',
                textTransform: 'uppercase',
              }}
            >
              SQL to Mermaid Engine
            </span>
          </div>
        </div>

        {/* Main Title */}
        <div
          style={{
            fontSize: '44px',
            fontWeight: 800,
            color: '#f8fafc',
            textAlign: 'center',
            lineHeight: 1.2,
            maxWidth: '960px',
            marginBottom: '20px',
            textShadow: '0 2px 10px rgba(0,0,0,0.5)',
          }}
        >
          Transforma esquemas SQL en diagramas Mermaid UML al instante
        </div>

        {/* Subtitle */}
        <div
          style={{
            fontSize: '22px',
            color: '#94a3b8',
            textAlign: 'center',
            maxWidth: '820px',
            marginBottom: '36px',
            lineHeight: 1.4,
          }}
        >
          Atributos tipados, relaciones de claves foráneas con cardinalidades y métodos CRUD listos para documentar.
        </div>

        {/* Feature Badges */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
          }}
        >
          <div
            style={{
              padding: '8px 18px',
              borderRadius: '9999px',
              background: 'rgba(16, 185, 129, 0.15)',
              border: '1px solid rgba(16, 185, 129, 0.4)',
              color: '#34d399',
              fontSize: '15px',
              fontWeight: 600,
            }}
          >
            🎁 100% Gratis & Open Source
          </div>

          <div
            style={{
              padding: '8px 18px',
              borderRadius: '9999px',
              background: 'rgba(99, 102, 241, 0.15)',
              border: '1px solid rgba(99, 102, 241, 0.4)',
              color: '#a5b4fc',
              fontSize: '15px',
              fontWeight: 600,
            }}
          >
            ⚡ Drag & Drop .sql
          </div>

          <div
            style={{
              padding: '8px 18px',
              borderRadius: '9999px',
              background: 'rgba(6, 182, 212, 0.15)',
              border: '1px solid rgba(6, 182, 212, 0.4)',
              color: '#67e8f9',
              fontSize: '15px',
              fontWeight: 600,
            }}
          >
            📥 Exporta .mmd & SVG
          </div>
        </div>

        {/* Domain Footer Pill */}
        <div
          style={{
            position: 'absolute',
            bottom: '26px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '6px 16px',
            borderRadius: '9999px',
            background: 'rgba(15, 23, 42, 0.85)',
            border: '1px solid rgba(99, 102, 241, 0.35)',
            color: '#cbd5e1',
            fontSize: '14px',
            fontWeight: 600,
            letterSpacing: '0.5px',
          }}
        >
          <div
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '9999px',
              background: '#10b981',
              boxShadow: '0 0 8px #10b981',
            }}
          />
          <span>sqlschemer.vercel.app</span>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
