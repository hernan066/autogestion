import React, { useState } from "react";

export default function ProfileForm({ clientData, onUpdateSuccess }) {
  const userId = clientData?.user?._id || clientData?.user;
  const clientId = clientData?._id;

  const getInitialPhone = () => {
    const saved = clientData?.user?.phone || "";
    if (!saved) return "";
    return saved.startsWith("54") ? saved.slice(2) : saved;
  };

  const [formData, setFormData] = useState({
    name: clientData?.user?.name ? String(clientData.user.name) : "",
    lastName: clientData?.user?.lastName ? String(clientData.user.lastName) : "",
    phone: getInitialPhone(),
    cuit: clientData?.cuit !== undefined && clientData?.cuit !== null ? String(clientData.cuit) : "",
  });

  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "phone") {
      const numbersOnly = value.replace(/\D/g, "");
      setFormData((prev) => ({ ...prev, phone: numbersOnly }));
      return;
    }
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const nameStr = String(formData.name).trim();
    const lastNameStr = String(formData.lastName).trim();
    if (!nameStr || !lastNameStr) {
      setErrorMsg("Por favor, completa todos los campos obligatorios.");
      return;
    }

    setLoading(true);
    setSuccessMsg("");
    setErrorMsg("");

    try {
      const apiBase = import.meta.env.VITE_API_URL || "http://localhost:4000";
      const token = localStorage.getItem("autogestion_token") || "";

      // 1. Actualizar datos en el modelo User (Nombre, Apellido, Teléfono)
      const rawPhone = String(formData.phone).trim();
      const finalPhone = rawPhone
        ? rawPhone.startsWith("54")
          ? rawPhone
          : "54" + rawPhone
        : "";
      const userPayload = {
        name: nameStr,
        lastName: lastNameStr,
        phone: finalPhone,
      };

      const userRes = await fetch(`${apiBase}/api/user/${userId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "x-token": token,
        },
        body: JSON.stringify(userPayload),
      });

      const userData = await userRes.json();
      if (!userData.ok) {
        throw new Error(
          userData.msg || "Error al actualizar datos de usuario.",
        );
      }

      // 2. Actualizar CUIT/DNI en el modelo Client
      const clientPayload = {
        cuit: String(formData.cuit).trim(),
      };

      const clientRes = await fetch(`${apiBase}/api/clients/${clientId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "x-token": token,
        },
        body: JSON.stringify(clientPayload),
      });

      const clientDataResponse = await clientRes.json();
      if (!clientDataResponse.ok) {
        throw new Error(
          clientDataResponse.msg || "Error al actualizar datos de facturación.",
        );
      }

      // 3. Éxito: Notificar e invocar callback para refrescar estado en App
      setSuccessMsg("¡Tus datos han sido actualizados con éxito!");

      // Refrescar los datos llamando al callback
      if (onUpdateSuccess) {
        onUpdateSuccess();
      }

      setTimeout(() => setSuccessMsg(""), 4000);
    } catch (err) {
      console.error(err);
      setErrorMsg(
        err.message || "No se pudo actualizar tu perfil. Intenta de nuevo.",
      );
    } finally {
      setLoading(false);
    }
  };

  // Check if some critical info is missing:
  const isMissingInfo =
    !clientData?.user?.name || !clientData?.user?.lastName || !clientData?.cuit;

  return (
    <div
      className="glass-card profile-card animate-fade-in"
      style={{ width: "100%" }}
    >
      <div className="section-title">Mis Datos Personales</div>

      {isMissingInfo ? (
        <div
          style={{
            background: "rgba(245, 158, 11, 0.1)",
            border: "1px solid rgba(245, 158, 11, 0.3)",
            padding: "10px 14px",
            borderRadius: "12px",
            fontSize: "13px",
            color: "#fbbf24",
            textAlign: "left",
            lineHeight: "1.4",
          }}
        >
          💡 <strong>Completa tus datos:</strong> Tienes información faltante en
          tu perfil. Completa tu número de teléfono y CUIT/DNI para recibir
          promociones y facilitar la facturación de tus compras.
        </div>
      ) : (
        <p
          style={{
            fontSize: "13px",
            color: "var(--text-secondary)",
            textAlign: "left",
          }}
        >
          Mantén tus datos actualizados para recibir atención personalizada y
          agilizar tus compras en caja.
        </p>
      )}

      {successMsg && (
        <div
          style={{
            background: "rgba(16, 185, 129, 0.1)",
            border: "1px solid rgba(16, 185, 129, 0.3)",
            padding: "10px 14px",
            borderRadius: "12px",
            fontSize: "13.5px",
            color: "#34d399",
            textAlign: "left",
          }}
        >
          ✅ {successMsg}
        </div>
      )}

      {errorMsg && (
        <div
          style={{
            background: "rgba(239, 68, 68, 0.1)",
            border: "1px solid rgba(239, 68, 68, 0.3)",
            padding: "10px 14px",
            borderRadius: "12px",
            fontSize: "13.5px",
            color: "#f87171",
            textAlign: "left",
          }}
        >
          ⚠️ {errorMsg}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        style={{ display: "flex", flexDirection: "column", gap: "16px" }}
      >
        <div className="form-row">
          <div className="premium-input-group">
            <label htmlFor="name">Nombre *</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Tu nombre"
              className="premium-input"
              required
            />
          </div>
          <div className="premium-input-group">
            <label htmlFor="lastName">Apellido *</label>
            <input
              type="text"
              id="lastName"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              placeholder="Tu apellido"
              className="premium-input"
              required
            />
          </div>
        </div>

        <div className="premium-input-group">
          <label htmlFor="phone">Número de Teléfono</label>
          <div style={{ display: "flex", gap: "8px", width: "100%" }}>
            <input
              type="text"
              value="+54"
              readOnly
              disabled
              className="premium-input"
              style={{
                width: "80px",
                textAlign: "center",
                background: "rgba(20, 20, 20, 0.6)",
                cursor: "not-allowed",
                color: "var(--accent-yellow)",
                fontWeight: 700,
                borderColor: "var(--border-light)",
              }}
            />
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="ej: 116123456"
              className="premium-input"
              style={{ flexGrow: 1 }}
            />
          </div>
          <small
            style={{
              color: "var(--text-secondary)",
              fontSize: "11px",
              marginTop: "4px",
              display: "block",
              lineHeight: "1.4",
              textAlign: "left",
            }}
          >
            Carga tu número de teléfono con código de área sin el 0 y sin el 15.
            Ej: 116123456.
          </small>
        </div>

        <div className="premium-input-group">
          <label htmlFor="cuit">CUIT / DNI (Facturación)</label>
          <input
            type="text"
            id="cuit"
            name="cuit"
            value={formData.cuit}
            onChange={handleChange}
            placeholder="DNI o CUIT sin guiones"
            className="premium-input"
          />
        </div>

        <button
          type="submit"
          className="btn-premium btn-cyan"
          style={{ marginTop: "10px" }}
          disabled={loading}
        >
          {loading ? "Guardando cambios..." : "Guardar Información"}
        </button>
      </form>
    </div>
  );
}
