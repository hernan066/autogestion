import React, { useEffect, useState } from 'react';

const GOOGLE_CLIENT_ID = "654974527ae94fa111479ad5.apps.googleusercontent.com"; // Default local or placeholder client ID

export default function LoginView({ onLoginSuccess, refId }) {
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [sandboxEmail, setSandboxEmail] = useState('');
  const [showSandbox, setShowSandbox] = useState(false);

  useEffect(() => {
    // 1. Cargar el script de Google Identity Services de forma dinámica
    const scriptId = "google-gsi-client-script";
    let script = document.getElementById(scriptId);

    const initializeGoogleBtn = () => {
      if (window.google?.accounts?.id) {
        window.google.accounts.id.initialize({
          client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID || GOOGLE_CLIENT_ID,
          callback: handleGoogleCredentialResponse,
        });

        const btnElement = document.getElementById("google-signin-btn");
        if (btnElement) {
          window.google.accounts.id.renderButton(btnElement, {
            theme: "filled_blue",
            size: "large",
            width: "320",
            text: "continue_with",
            shape: "pill",
          });
        }
      }
    };

    if (!script) {
      script = document.createElement("script");
      script.id = scriptId;
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.defer = true;
      script.onload = () => {
        initializeGoogleBtn();
      };
      document.body.appendChild(script);
    } else {
      initializeGoogleBtn();
    }
  }, []);

  const handleGoogleCredentialResponse = async (response) => {
    setLoading(true);
    setErrorMsg('');
    try {
      // 2. Enviar el token al backend para validar e iniciar sesión / registrar cliente
      const apiBase = import.meta.env.VITE_API_URL || "http://localhost:4000";
      const payload = {
        token: response.credential,
        ref: refId || localStorage.getItem("pending_ref") || undefined,
        link: localStorage.getItem("pending_link") || undefined,
        tenant: localStorage.getItem("pending_tenant") || undefined
      };

      const res = await fetch(`${apiBase}/api/clients/auth/google`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (data.ok && data.data?.client) {
        // Guardar datos en localstorage y pasar al estado principal
        localStorage.setItem("autogestion_client", JSON.stringify(data.data.client));
        if (data.token) {
          localStorage.setItem("autogestion_token", data.token);
        }
        localStorage.removeItem("pending_ref");
        localStorage.removeItem("pending_link");
        localStorage.removeItem("pending_tenant");
        onLoginSuccess(data.data.client, data.token);
      } else {
        setErrorMsg(data.msg || "Ocurrió un error al verificar tu cuenta.");
      }
    } catch (err) {
      console.error(err);
      setErrorMsg("No se pudo conectar con el servidor de la distribuidora.");
    } finally {
      setLoading(false);
    }
  };

  // Login de pruebas para testing rápido
  const handleSandboxLogin = async (e) => {
    e.preventDefault();
    if (!sandboxEmail.trim()) return;
    setLoading(true);
    setErrorMsg('');
    try {
      const apiBase = import.meta.env.VITE_API_URL || "http://localhost:4000";
      const payload = {
        sandboxEmail: sandboxEmail.trim(),
        ref: refId || localStorage.getItem("pending_ref") || undefined,
        link: localStorage.getItem("pending_link") || undefined,
        tenant: localStorage.getItem("pending_tenant") || undefined
      };

      const res = await fetch(`${apiBase}/api/clients/auth/google`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      
      if (data.ok && data.data?.client) {
        localStorage.setItem("autogestion_client", JSON.stringify(data.data.client));
        if (data.token) {
          localStorage.setItem("autogestion_token", data.token);
        }
        localStorage.removeItem("pending_ref");
        localStorage.removeItem("pending_link");
        localStorage.removeItem("pending_tenant");
        onLoginSuccess(data.data.client, data.token);
      } else {
        setErrorMsg(data.msg || "Ocurrió un error al verificar tu cuenta.");
      }
    } catch (err) {
      console.error(err);
      setErrorMsg("Error de red en modo Sandbox.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-wrapper animate-fade-in">
      <div className="login-card glass-card">
        <div className="login-badge">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
          </svg>
          PROGRAMA DE RECOMPENSAS
        </div>

        <img src="/logo.png" className="login-logo" alt="Ringo Agromarket Logo" />
        
        <div>
          <h2 style={{ fontSize: '24px', fontWeight: 800, marginBottom: '6px' }}>Autogestión de Clientes</h2>
          <p className="login-tagline">
            Accede para ver tus puntos acumulados, canjear beneficios exclusivos, completar tus datos y recomendar amigos para ganar más recompensas.
          </p>
        </div>

        {refId && (
          <div style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)', padding: '10px 14px', borderRadius: '12px', fontSize: '13px', color: '#34d399', fontWeight: 500 }}>
            🎉 ¡Has sido invitado! Regístrate para recibir tus puntos de regalo en tu primera compra.
          </div>
        )}

        {errorMsg && (
          <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', padding: '10px 14px', borderRadius: '12px', fontSize: '13.5px', color: '#f87171' }}>
            ⚠️ {errorMsg}
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', marginTop: '10px' }}>
          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
              <div className="spinner" style={{ width: '28px', height: '28px', border: '3px solid rgba(255,255,255,0.1)', borderTopColor: '#06b6d4', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
              <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Conectando con Google...</span>
              <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
          ) : (
            <div id="google-signin-btn" className="google-button-container" />
          )}
        </div>

        <div style={{ marginTop: '20px', borderTop: '1px solid var(--border-light)', paddingTop: '16px' }}>
          <button 
            type="button" 
            className="btn-premium btn-outline" 
            style={{ fontSize: '13px', padding: '8px 16px', borderRadius: '8px' }}
            onClick={() => setShowSandbox(!showSandbox)}
          >
            {showSandbox ? "Ocultar Modo Sandbox" : "🔧 Modo de Prueba Local (Sandbox)"}
          </button>

          {showSandbox && (
            <form onSubmit={handleSandboxLogin} className="sandbox-banner animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '12px' }}>
              <p><strong>Modo Sandbox local:</strong> Ingresa un correo electrónico de un cliente ya existente en la base de datos para probar sin credenciales reales de Google.</p>
              <input 
                type="email" 
                placeholder="ej: juan.test@gmail.com" 
                value={sandboxEmail} 
                onChange={(e) => setSandboxEmail(e.target.value)}
                className="premium-input"
                style={{ padding: '8px 12px', fontSize: '13px' }}
                required
              />
              <button type="submit" className="btn-premium btn-cyan" style={{ padding: '8px 12px', fontSize: '13px', borderRadius: '8px' }} disabled={loading}>
                Ingresar como Test
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
