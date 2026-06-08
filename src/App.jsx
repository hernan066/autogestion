import React, { useState, useEffect } from 'react';
import LoginView from './components/LoginView';
import DashboardView from './components/DashboardView';
import ProfileForm from './components/ProfileForm';
import ReferralsCard from './components/ReferralsCard';
import './App.css';

const preloadImages = (urls) => {
  return Promise.all(
    urls.map((url) => {
      return new Promise((resolve) => {
        if (!url) return resolve();
        const img = new Image();
        img.src = url;
        img.onload = () => resolve();
        img.onerror = () => resolve();
      });
    })
  );
};

export default function App() {
  const [session, setSession] = useState(null);
  const [clientData, setClientData] = useState(null);
  const [configData, setConfigData] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard', 'profile', 'referrals'
  const [refId, setRefId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [apiLoading, setApiLoading] = useState(false);

  // 1. Capturar código de referido, link o tenant al inicio desde los parámetros de la URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const ref = params.get('ref');
    const link = params.get('link');
    const tenant = params.get('tenant');

    if (ref) {
      setRefId(ref);
      localStorage.setItem("pending_ref", ref);
    }
    if (link) {
      localStorage.setItem("pending_link", link);
    }
    if (tenant) {
      localStorage.setItem("pending_tenant", tenant);
    }

    // Limpiar los parámetros de la URL de forma sutil
    if (ref || link || tenant) {
      window.history.replaceState({}, document.title, window.location.pathname);
    }

    // Cargar sesión persistida
    const storedClient = localStorage.getItem("autogestion_client");
    if (storedClient) {
      try {
        const parsed = JSON.parse(storedClient);
        setSession(parsed);
        setApiLoading(true); // Activar la carga general inmediatamente si ya hay sesión persistida
      } catch (err) {
        console.error("Error al parsear sesión guardada:", err);
      }
    }
    setLoading(false);
  }, []);

  // 2. Cargar detalles actualizados del cliente y configuración de puntos
  const fetchUpdatedDetails = async (clientRecord) => {
    const currentClient = clientRecord || session;
    if (!currentClient?._id) return;

    setApiLoading(true);
    try {
      const apiBase = import.meta.env.VITE_API_URL || "http://localhost:4000";
      
      // A. Cargar datos del cliente totalmente poblados (incluyendo puntos actualizados)
      const token = localStorage.getItem("autogestion_token");
      const clientRes = await fetch(`${apiBase}/api/clients/${currentClient._id}`, {
        headers: {
          "x-token": token || ""
        }
      });
      const clientJson = await clientRes.json();
      let updatedClient = null;
      if (clientJson.ok && clientJson.data?.client) {
        updatedClient = clientJson.data.client;
        setClientData(updatedClient);
        // Actualizar sesión guardada en localStorage
        localStorage.setItem("autogestion_client", JSON.stringify(updatedClient));
      }

      // B. Cargar la configuración general (para la conversión de puntos)
      const configRes = await fetch(`${apiBase}/api/config`, {
        headers: {
          "x-token": token || ""
        }
      });
      const configJson = await configRes.json();
      let latestConfig = null;
      if (configJson.ok) {
        const configObject = configJson.config || configJson.data?.config;
        if (configObject) {
          latestConfig = Array.isArray(configObject) 
            ? configObject[0] 
            : configObject;
          setConfigData(latestConfig);
        }
      }

      // C. Precargar banners y avatar
      const banners =
        latestConfig?.referralBanners && latestConfig.referralBanners.length > 0
          ? latestConfig.referralBanners
          : latestConfig?.referralBannerUrl
          ? [latestConfig.referralBannerUrl]
          : [];

      const avatarUrl = updatedClient?.user?.avatar || currentClient?.user?.avatar || null;
      const urlsToPreload = [...banners];
      if (avatarUrl) {
        urlsToPreload.push(avatarUrl);
      }

      if (urlsToPreload.length > 0) {
        await preloadImages(urlsToPreload);
      }
    } catch (err) {
      console.error("Error al cargar detalles de la distribuidora:", err);
    } finally {
      setApiLoading(false);
    }
  };

  useEffect(() => {
    if (session) {
      fetchUpdatedDetails();
    }
  }, [session]);

  const handleLoginSuccess = (clientRecord) => {
    setApiLoading(true); // Activar carga general en login exitoso
    setSession(clientRecord);
  };

  const handleLogout = () => {
    localStorage.removeItem("autogestion_client");
    setSession(null);
    setClientData(null);
    setConfigData(null);
    setActiveTab('dashboard');
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#080c18' }}>
        <div style={{ width: '36px', height: '36px', border: '3px solid rgba(255,255,255,0.1)', borderTopColor: '#ffcc00', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
      </div>
    );
  }

  // Loader general premium cuando se están consultando datos de API y precargando recursos
  if (session && apiLoading) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        height: '100svh',
        background: 'radial-gradient(circle at center, #1a1a1a 0%, #000000 100%)',
        gap: '24px',
        color: '#ffffff'
      }}>
        {/* Premium glowing spinner */}
        <div style={{ position: 'relative', width: '64px', height: '64px' }}>
          <div style={{
            position: 'absolute',
            inset: 0,
            border: '4px solid rgba(255, 204, 0, 0.1)',
            borderTopColor: 'var(--accent-yellow)',
            borderRadius: '50%',
            animation: 'spin 1.2s cubic-bezier(0.5, 0, 0.5, 1) infinite',
            boxShadow: '0 0 15px var(--accent-yellow-glow)'
          }} />
          <div style={{
            position: 'absolute',
            inset: '8px',
            border: '2px solid rgba(255, 255, 255, 0.05)',
            borderBottomColor: 'rgba(255, 255, 255, 0.4)',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite reverse'
          }} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
          <span style={{
            fontSize: '16px',
            fontWeight: 700,
            letterSpacing: '1px',
            textTransform: 'uppercase',
            background: 'linear-gradient(135deg, #ffffff 0%, var(--accent-yellow) 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            Ringo Club
          </span>
          <span style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 500 }}>
            Cargando tus beneficios...
          </span>
        </div>
      </div>
    );
  }

  // Si no hay sesión iniciada, mostrar la pantalla de bienvenida/login
  if (!session) {
    return <LoginView onLoginSuccess={handleLoginSuccess} refId={refId} />;
  }

  // Datos de fallback en caso de problemas de red
  const finalClientData = clientData || session;
  const userName = finalClientData?.user?.name || 'Cliente';
  const avatarUrl = finalClientData?.user?.avatar || null;
  const initials = userName[0] || 'C';

  return (
    <>
      <div className="app-container">
        <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px', flexGrow: 1, width: '100%' }}>
          {/* Header Premium */}
          <header className="app-header">
            <div className="header-logo-container">
              <img src="/logo.png" className="header-logo" alt="Ringo Agromarket Logo" />
              <span className="header-title">Ringo Agromarket</span>
            </div>

            <div className="header-user">
              <button 
                type="button" 
                onClick={handleLogout}
                className="btn-logout" 
                title="Cerrar sesión"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                  <polyline points="16 17 21 12 16 7"></polyline>
                  <line x1="21" y1="12" x2="9" y2="12"></line>
                </svg>
              </button>
            </div>
          </header>

          {/* Hola banner */}
          <div style={{ textAlign: 'left', padding: '0 4px' }}>
            <h3 style={{ fontSize: '20px', fontWeight: 800 }}>¡Hola, {userName}! 👋</h3>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Te damos la bienvenida a tu centro de beneficios.</p>
          </div>

          {/* Renders basados en Tabs de Navegación */}
          <main style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', gap: '20px', paddingBottom: '80px' }}>
            {activeTab === 'dashboard' && (
              <DashboardView 
                clientData={finalClientData} 
                configData={configData} 
              />
            )}
            
            {activeTab === 'profile' && (
              <ProfileForm 
                clientData={finalClientData} 
                onUpdateSuccess={() => fetchUpdatedDetails()} 
              />
            )}

            {activeTab === 'referrals' && (
              <ReferralsCard 
                clientData={finalClientData} 
                configData={configData}
              />
            )}
          </main>
        </div>
      </div>

      {/* Bottom Tab Bar navigation (Native Mobile style) */}
      <nav style={{
        position: 'fixed',
        bottom: 0,
        left: '50%',
        transform: 'translateX(-50%)',
        width: '100%',
        maxWidth: '480px',
        background: 'rgba(10, 10, 10, 0.96)',
        backdropFilter: 'blur(16px)',
        borderTop: '1px solid var(--border-light)',
        borderLeft: '1px solid var(--border-light)',
        borderRight: '1px solid var(--border-light)',
        borderRadius: '24px 24px 0 0',
        display: 'flex',
        justifyContent: 'space-around',
        padding: '12px 10px 24px',
        boxShadow: '0 -10px 30px rgba(0, 0, 0, 0.5)',
        zIndex: 999
      }}>
        {/* Tab Dashboard */}
        <button 
          onClick={() => setActiveTab('dashboard')}
          style={{
            background: 'none',
            border: 'none',
            color: activeTab === 'dashboard' ? 'var(--accent-cyan)' : 'var(--text-secondary)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '4px',
            cursor: 'pointer',
            fontSize: '11px',
            fontWeight: 600,
            transition: 'color 0.2s ease',
            flex: 1
          }}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ filter: activeTab === 'dashboard' ? 'drop-shadow(0 0 4px var(--accent-cyan-glow))' : 'none' }}>
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
          </svg>
          Puntos
        </button>

        {/* Tab Profile */}
        <button 
          onClick={() => setActiveTab('profile')}
          style={{
            background: 'none',
            border: 'none',
            color: activeTab === 'profile' ? 'var(--accent-cyan)' : 'var(--text-secondary)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '4px',
            cursor: 'pointer',
            fontSize: '11px',
            fontWeight: 600,
            transition: 'color 0.2s ease',
            flex: 1
          }}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ filter: activeTab === 'profile' ? 'drop-shadow(0 0 4px var(--accent-cyan-glow))' : 'none' }}>
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
          Mi Perfil
        </button>

        {/* Tab Referrals */}
        <button 
          onClick={() => setActiveTab('referrals')}
          style={{
            background: 'none',
            border: 'none',
            color: activeTab === 'referrals' ? 'var(--accent-cyan)' : 'var(--text-secondary)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '4px',
            cursor: 'pointer',
            fontSize: '11px',
            fontWeight: 600,
            transition: 'color 0.2s ease',
            flex: 1
          }}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ filter: activeTab === 'referrals' ? 'drop-shadow(0 0 4px var(--accent-cyan-glow))' : 'none' }}>
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
          Invitados
        </button>
      </nav>
    </>
  );
}
