import React, { useState, useEffect } from 'react';

export default function DashboardView({ clientData, configData }) {
  const points = clientData?.points || 0;
  const conversionRate = configData?.pointsConversionRate || 10; // e.g. 10 points = $1
  
  // Calculate local cash value equivalent:
  // pointsDiscount = points / pointsConversionRate
  const cashEquivalent = points / conversionRate;

  // Let's create an interactive calculator
  const [calcPoints, setCalcPoints] = useState(points || 0);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(true);

  const banners =
    configData?.referralBanners && configData.referralBanners.length > 0
      ? configData.referralBanners
      : configData?.referralBannerUrl
      ? [configData.referralBannerUrl]
      : [];

  useEffect(() => {
    if (banners.length <= 1) return;
    const interval = setInterval(() => {
      setIsTransitioning(true);
      setCurrentSlide((prev) => prev + 1);
    }, 4000);
    return () => clearInterval(interval);
  }, [banners.length]);

  const handleTransitionEnd = () => {
    if (currentSlide === banners.length) {
      setIsTransitioning(false);
      setCurrentSlide(0);
    }
  };

  const handleDotClick = (idx) => {
    setIsTransitioning(true);
    setCurrentSlide(idx);
  };

  const handleSliderChange = (e) => {
    setCalcPoints(Number(e.target.value));
  };

  return (
    <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: "20px" }}>
      {banners.length > 0 && (
        <div
          className="glass-card animate-fade-in"
          style={{
            width: "100%",
            padding: 0,
            overflow: "hidden",
            aspectRatio: "16/9",
            border: "1px solid var(--border-light)",
            position: "relative"
          }}
        >
          <div
            onTransitionEnd={handleTransitionEnd}
            style={{
              display: "flex",
              width: "100%",
              height: "100%",
              transition: isTransitioning ? "transform 0.5s ease-in-out" : "none",
              transform: `translateX(-${currentSlide * 100}%)`
            }}
          >
            {(banners.length > 1 ? [...banners, banners[0]] : banners).map((url, idx) => (
              <img
                key={`${url}-${idx}`}
                src={url}
                alt={`Promoción ${idx + 1}`}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  flexShrink: 0
                }}
              />
            ))}
          </div>

          {banners.length > 1 && (
            <div
              style={{
                position: "absolute",
                bottom: "12px",
                left: "50%",
                transform: "translateX(-50%)",
                display: "flex",
                gap: "8px",
                zIndex: 10
              }}
            >
              {banners.map((_, idx) => {
                const isActive = idx === (currentSlide % banners.length);
                return (
                  <button
                    key={idx}
                    onClick={() => handleDotClick(idx)}
                    style={{
                      width: "8px",
                      height: "8px",
                      borderRadius: "50%",
                      background: isActive ? "var(--accent-yellow)" : "rgba(255, 255, 255, 0.4)",
                      border: "none",
                      padding: 0,
                      cursor: "pointer",
                      transition: "background 0.3s, transform 0.2s",
                      transform: isActive ? "scale(1.2)" : "scale(1)",
                      boxShadow: "0 1px 3px rgba(0,0,0,0.3)"
                    }}
                    title={`Ver imagen ${idx + 1}`}
                  />
                );
              })}
            </div>
          )}
        </div>
      )}
      <div className="points-widget glass-card animate-fade-in" style={{ width: '100%' }}>
        <div className="section-title" style={{ width: '100%', marginBottom: '16px' }}>
        Mi Saldo de Beneficios
      </div>

      <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '12px' }}>
        ¡Felicidades! Acumulas puntos automáticos con cada una de tus compras pagadas en nuestro local.
      </p>

      {/* Glowing Circle ring */}
      <div className="points-ring-container">
        <div className="points-ring-glow"></div>
        <div className="points-circle">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--accent-green)" strokeWidth="2.5" style={{ marginBottom: '4px', filter: 'drop-shadow(0 0 4px var(--accent-green))' }}>
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
          </svg>
          <span className="points-value">{points.toLocaleString()}</span>
          <span className="points-label">Puntos</span>
        </div>
      </div>

      <div className="cash-conversion">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <line x1="12" y1="1" x2="12" y2="23"></line>
          <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
        </svg>
        Equivale a: <strong>${cashEquivalent.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>
      </div>

      <div style={{ marginTop: '24px', width: '100%', borderTop: '1px solid var(--border-light)', paddingTop: '20px' }}>
        <h4 style={{ fontSize: '14px', fontWeight: 700, color: '#ffffff', textAlign: 'left', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span>🎛️</span> Calculadora de Canje
        </h4>
        <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', textAlign: 'left', marginBottom: '14px' }}>
          Desliza para simular cuántos puntos deseas canjear y ver tu descuento equivalente en pesos:
        </p>

        {points > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <input 
              type="range" 
              min="0" 
              max={points} 
              value={calcPoints} 
              onChange={handleSliderChange}
              style={{
                width: '100%',
                height: '6px',
                background: 'rgba(255, 255, 255, 0.1)',
                borderRadius: '5px',
                outline: 'none',
                accentColor: 'var(--accent-green)',
                cursor: 'pointer'
              }}
            />
            
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 600 }}>
              <span>0 pts</span>
              <span style={{ color: 'var(--accent-green)', background: 'rgba(16, 185, 129, 0.1)', padding: '2px 8px', borderRadius: '6px' }}>
                {calcPoints} pts simulados
              </span>
              <span>{points} pts</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', background: 'rgba(6, 182, 212, 0.06)', border: '1px dashed rgba(6, 182, 212, 0.2)', padding: '12px', borderRadius: '12px', marginTop: '6px' }}>
              <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Obtienes un descuento de:</span>
              <strong style={{ fontSize: '16px', color: 'var(--accent-cyan)' }}>
                ${(calcPoints / conversionRate).toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </strong>
            </div>
          </div>
        ) : (
          <div className="empty-state" style={{ padding: '12px', background: 'rgba(255,255,255,0.02)', borderRadius: '12px' }}>
            No tienes puntos suficientes para simular un canje. ¡Realiza tu primera compra para acumular!
          </div>
        )}
      </div>
    </div>
   </div>
  );
}
