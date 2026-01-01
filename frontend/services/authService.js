import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import "./styles.css";

export default function VerifyEmail() {
  const [status, setStatus] = useState("Vérification en cours...");
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const email = searchParams.get("email");
    const token = searchParams.get("token");

    if (!email || !token) {
      setStatus("Erreur: Paramètres manquants");
      return;
    }

    fetch("/api/verify-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, token }),
    })
      .then((res) => res.json())
      .then((json) => {
        if (!json.ok) throw new Error(json.error || "Erreur");
        setStatus("✅ Email vérifié avec succès! Redirection vers la connexion...");
        setTimeout(() => navigate("/"), 2000);
      })
      .catch((err) => setStatus("❌ Erreur: " + (err.message || err)));
  }, [searchParams, navigate]);

  return (
    <main className="container">
      <header style={{ borderBottom: "none", marginBottom: "3rem" }}>
        <div className="logo-container">
          <h1>SmartSummary</h1>
        </div>
      </header>

      <section className="card">
        <h2>✉️ Vérification d'Email</h2>
        <div className={`result ${status.startsWith("❌") ? "error" : ""}`}>
          {status}
        </div>
      </section>
    </main>
  );
}
