import React, { useState, useEffect, useRef } from 'react';
import { computeOverridesFromMetrics } from '../calculator';
import { FontMetrics, SystemFallbackName } from '../metrics';

// Pre-extracted real metrics of popular Google Fonts for browser-side Storybook demo
const PRESET_WEB_FONTS: Record<string, { url: string; metrics: FontMetrics }> = {
  PlayfairDisplay: {
    url: 'https://fonts.gstatic.com/s/playfairdisplay/v37/nuFvD-vYSZviVYUb_rj3ij__anPXJzDwcbmjWBN2PKdFvXDXbtM.woff2',
    metrics: { familyName: 'Playfair Display', unitsPerEm: 1000, ascent: 1082, descent: -251, lineGap: 0, xWidthAvg: 485 },
  },
  SpaceGrotesk: {
    url: 'https://fonts.gstatic.com/s/spacegrotesk/v16/V8mQoQDjQSkFtoMM3T6r8E7mF71Q-gOoraIAEj7oUXskPMBBSSJLm2E.woff2',
    metrics: { familyName: 'Space Grotesk', unitsPerEm: 1000, ascent: 980, descent: -296, lineGap: 0, xWidthAvg: 518 },
  },
  Outfit: {
    url: 'https://fonts.gstatic.com/s/outfit/v11/QGYyz_MVcBeNP4NjuGObqx1XmO1I4TC1O4a0Ew.woff2',
    metrics: { familyName: 'Outfit', unitsPerEm: 1000, ascent: 1000, descent: -260, lineGap: 0, xWidthAvg: 492 },
  },
};

export interface FontSimulatorProps {
  presetFont: keyof typeof PRESET_WEB_FONTS;
  systemFallback: SystemFallbackName;
  networkDelayMs: number;
  xRayOverlay: boolean;
  sampleHeading: string;
  sampleBody: string;
}

export const FontCLSSimulator: React.FC<FontSimulatorProps> = ({
  presetFont = 'PlayfairDisplay',
  systemFallback = 'Arial',
  networkDelayMs = 1200,
  xRayOverlay = false,
  sampleHeading,
  sampleBody,
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [unoptimizedShiftPx, setUnoptimizedShiftPx] = useState(0);
  const [optimizedShiftPx, setOptimizedShiftPx] = useState(0);

  const unoptRef = useRef<HTMLDivElement>(null);
  const optRef = useRef<HTMLDivElement>(null);
  const initialHeights = useRef<{ unopt: number; opt: number }>({ unopt: 0, opt: 0 });

  const selected = PRESET_WEB_FONTS[presetFont];
  const calculated = computeOverridesFromMetrics(
    selected.metrics,
    systemFallback,
    `${selected.metrics.familyName}-ZeroCLS`,
    selected.url
  );

  const triggerNetworkSimulation = () => {
    setIsLoaded(false);
    setUnoptimizedShiftPx(0);
    setOptimizedShiftPx(0);

    requestAnimationFrame(() => {
      if (unoptRef.current && optRef.current) {
        initialHeights.current = {
          unopt: unoptRef.current.getBoundingClientRect().height,
          opt: optRef.current.getBoundingClientRect().height,
        };
      }
    });

    const timer = setTimeout(() => {
      setIsLoaded(true);
      requestAnimationFrame(() => {
        if (unoptRef.current && optRef.current) {
          const newUnopt = unoptRef.current.getBoundingClientRect().height;
          const newOpt = optRef.current.getBoundingClientRect().height;
          setUnoptimizedShiftPx(Math.abs(Math.round(newUnopt - initialHeights.current.unopt)));
          setOptimizedShiftPx(Math.abs(Math.round(newOpt - initialHeights.current.opt)));
        }
      });
    }, networkDelayMs);

    return () => clearTimeout(timer);
  };

  useEffect(() => {
    return triggerNetworkSimulation();
  }, [presetFont, systemFallback, networkDelayMs]);

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', padding: '20px', maxWidth: '1100px' }}>
      <style>{calculated.css}</style>

      {/* Top Controls & Telemetry Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', background: '#0f172a', color: '#fff', padding: '16px 20px', borderRadius: '10px' }}>
        <div>
          <span style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px', color: '#94a3b8' }}>
            Network State ({networkDelayMs}ms Swap)
          </span>
          <div style={{ fontSize: '18px', fontWeight: 700, marginTop: '4px', color: isLoaded ? '#4ade80' : '#facc15' }}>
            {isLoaded ? `● Web Font Active (${selected.metrics.familyName})` : `◌ Rendering Fallback (${systemFallback})`}
          </div>
        </div>
        <button
          onClick={triggerNetworkSimulation}
          style={{ background: '#3b82f6', color: '#fff', border: 'none', padding: '10px 18px', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}
        >
          ↻ Replay Font Swap
        </button>
      </div>

      {/* Side-by-Side Comparison OR X-Ray Superimpose */}
      <div style={{ display: 'grid', gridTemplateColumns: xRayOverlay ? '1fr' : '1fr 1fr', gap: '24px' }}>
        {/* 1. Standard Unoptimized Fallback */}
        <div style={{ border: '2px solid #ef4444', borderRadius: '10px', padding: '20px', background: '#fff' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', borderBottom: '1px solid #fee2e2', paddingBottom: '8px' }}>
            <strong style={{ color: '#dc2626' }}>❌ Without zero-cls-font</strong>
            <span style={{ background: '#fee2e2', color: '#991b1b', padding: '2px 8px', borderRadius: '4px', fontSize: '13px', fontWeight: 600 }}>
              Layout Jump: {unoptimizedShiftPx}px
            </span>
          </div>
          <div
            ref={unoptRef}
            style={{
              fontFamily: isLoaded ? `'${selected.metrics.familyName}'` : `'${systemFallback}'`,
              lineHeight: 1.5,
            }}
          >
            <h2 style={{ fontSize: '32px', margin: '0 0 12px 0' }}>{sampleHeading}</h2>
            <p style={{ fontSize: '18px', margin: 0, color: '#334155' }}>{sampleBody}</p>
          </div>
          <div style={{ marginTop: '16px', padding: '12px', background: '#f1f5f9', borderRadius: '6px', fontSize: '13px' }}>
            👇 <strong>CTA Button below text</strong> (Watch me jump when font loads!)
          </div>
        </div>

        {/* 2. Zero-CLS Metric Override Fallback */}
        <div style={{ border: '2px solid #22c55e', borderRadius: '10px', padding: '20px', background: '#fff' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', borderBottom: '1px solid #dcfce7', paddingBottom: '8px' }}>
            <strong style={{ color: '#16a34a' }}>✅ With zero-cls-font</strong>
            <span style={{ background: '#dcfce7', color: '#166534', padding: '2px 8px', borderRadius: '4px', fontSize: '13px', fontWeight: 600 }}>
              Layout Jump: {optimizedShiftPx}px
            </span>
          </div>
          <div
            ref={optRef}
            style={{
              fontFamily: isLoaded ? `'${selected.metrics.familyName}'` : `'${calculated.fallbackName}'`,
              lineHeight: 1.5,
            }}
          >
            <h2 style={{ fontSize: '32px', margin: '0 0 12px 0' }}>{sampleHeading}</h2>
            <p style={{ fontSize: '18px', margin: 0, color: '#334155' }}>{sampleBody}</p>
          </div>
          <div style={{ marginTop: '16px', padding: '12px', background: '#f1f5f9', borderRadius: '6px', fontSize: '13px' }}>
            🔒 <strong>CTA Button below text</strong> (Locked in place!)
          </div>
        </div>
      </div>

      {/* Live Generated CSS Output */}
      <div style={{ marginTop: '24px', background: '#1e293b', color: '#e2e8f0', padding: '16px', borderRadius: '8px', fontSize: '13px' }}>
        <div style={{ color: '#38bdf8', fontWeight: 600, marginBottom: '8px' }}>
          Generated Zero-Runtime CSS Overrides:
        </div>
        <pre style={{ margin: 0, overflowX: 'auto' }}>{calculated.css}</pre>
      </div>
    </div>
  );
};
