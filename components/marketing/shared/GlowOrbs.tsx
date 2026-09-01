export function GlowOrbs() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden>
      <div className="blob-orb blob-orb-1" style={{ top: '-10%', left: '20%' }} />
      <div className="blob-orb blob-orb-2" style={{ top: '10%', right: '15%' }} />
      <div className="blob-orb blob-orb-3" style={{ bottom: '10%', left: '40%' }} />
    </div>
  );
}
