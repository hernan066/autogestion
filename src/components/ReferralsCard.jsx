import React, { useEffect, useState } from "react";

export default function ReferralsCard({ clientData }) {
  const clientId = clientData?._id;
  const [referrals, setReferrals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  // Enlace de referido basado en la URL actual
  const referralLink = `${window.location.origin}/?ref=${clientId}`;

  const fetchReferrals = async () => {
    if (!clientId) return;
    setLoading(true);
    try {
      const apiBase = import.meta.env.VITE_API_URL || "http://localhost:4000";
      const token = localStorage.getItem("autogestion_token") || "";
      const res = await fetch(
        `${apiBase}/api/recommendation/client/${clientId}`,
        {
          headers: {
            "x-token": token,
          },
        },
      );
      const data = await res.json();
      if (data.ok && data.data?.recommendation) {
        setReferrals(data.data.recommendation);
      }
    } catch (err) {
      console.error("Error al obtener referidos:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReferrals();
  }, [clientId]);

  const copyToClipboard = () => {
    navigator.clipboard
      .writeText(referralLink)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      })
      .catch((err) => console.error("Error al copiar:", err));
  };

  // Mensaje para compartir por WhatsApp
  const whatsappMessage = encodeURIComponent(
    `¡Hola! Te recomiendo Ringo Agromarket para tus compras diarias. Si te registras con mi enlace, podrás ganar puntos de descuento exclusivos y regalos con tus compras: ${referralLink}`,
  );
  const whatsappUrl = `https://api.whatsapp.com/send?text=${whatsappMessage}`;

  return (
    <div className="glass-card animate-fade-in" style={{ width: "100%" }}>
      <div className="section-title">Recomendar Amigos</div>

      <p
        style={{
          fontSize: "13px",
          color: "var(--text-secondary)",
          textAlign: "left",
          marginTop: "10px",
        }}
      >
        Comparte tu enlace de invitación único. Por cada amigo que se registre y
        realice compras, ¡recibirás puntos de descuento exclusivos!
      </p>

      {/* Referral Link Box */}
      <div className="referral-link-container">
        <span className="referral-url">{referralLink}</span>
        <button
          type="button"
          onClick={copyToClipboard}
          className="btn-icon-action"
          title="Copiar enlace"
        >
          {copied ? (
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#10b981"
              strokeWidth="3"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
          ) : (
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
            </svg>
          )}
        </button>
      </div>

      {copied && (
        <div className="custom-toast">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#06b6d4"
            strokeWidth="3"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
          <span style={{ fontSize: "13px", fontWeight: 600 }}>
            ¡Enlace copiado al portapapeles!
          </span>
        </div>
      )}

      {/* Share Buttons */}
      <div className="share-options">
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-premium btn-green"
          style={{ textDecoration: "none" }}
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            style={{ fill: "currentColor" }}
          >
            <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
          </svg>
          WhatsApp
        </a>
      </div>

      {/* Referrals Friend List */}
      <div
        style={{
          marginTop: "24px",
          borderTop: "1px solid var(--border-light)",
          paddingTop: "20px",
        }}
      >
        <h4
          style={{
            fontSize: "14px",
            fontWeight: 700,
            color: "#ffffff",
            textAlign: "left",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span>👥 Mis Amigos Invitados ({referrals.length})</span>
          <button
            onClick={fetchReferrals}
            style={{
              background: "none",
              border: "none",
              color: "var(--accent-cyan)",
              fontSize: "12px",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            🔄 Actualizar
          </button>
        </h4>

        {loading ? (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              padding: "20px 0",
            }}
          >
            <div
              className="spinner"
              style={{
                width: "20px",
                height: "20px",
                border: "2px solid rgba(255,255,255,0.1)",
                borderTopColor: "#06b6d4",
                borderRadius: "50%",
                animation: "spin 1s linear infinite",
              }}
            />
          </div>
        ) : referrals.length > 0 ? (
          <div className="friend-list">
            {referrals.map((ref) => {
              const name = ref.recommendedUser?.name || "Cliente";
              const lastName = ref.recommendedUser?.lastName || "Invitado";
              const avatar = ref.recommendedUser?.avatar;
              const pointsEarned = ref.points || 0;
              const initials =
                `${name[0] || ""}${lastName[0] || ""}`.toUpperCase();

              return (
                <div key={ref._id} className="friend-item">
                  <div className="friend-info">
                    {avatar ? (
                      <img
                        src={avatar}
                        className="friend-avatar"
                        alt={`${name} avatar`}
                      />
                    ) : (
                      <div
                        className="friend-avatar"
                        style={{
                          background: "var(--accent-purple-glow)",
                          color: "#c084fc",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "11px",
                          fontWeight: 700,
                        }}
                      >
                        {initials || "?"}
                      </div>
                    )}
                    <span className="friend-name">
                      {name} {lastName}
                    </span>
                  </div>
                  <span className="friend-points">
                    +{pointsEarned.toLocaleString()} pts
                  </span>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="empty-state">
            Aún no has recomendado a ningún amigo. ¡Envía invitaciones para
            empezar a acumular puntos extra!
          </div>
        )}
      </div>
    </div>
  );
}
