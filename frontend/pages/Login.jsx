import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "./styles.css";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (!data.ok) {
        setError(data.error || "Erreur connexion");
        return;
      }

      localStorage.setItem("smartsummary_user", JSON.stringify(data.user));
      localStorage.setItem("smartsummary_token", data.accessToken);
      navigate("/dashboard");
    } catch (err) {
      setError("Erreur serveur");
    }
  };

  return (
    <main className="container">
      <h1>SmartSummary</h1>
      <form onSubmit={handleLogin} className="card">
        <h2>Connexion</h2>
        {error && <p className="error">{error}</p>}
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Mot de passe"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit">Se connecter</button>
        <p>
          Pas encore de compte ? <Link to="/register">Inscription</Link>
        </p>
      </form>
    </main>
  );
}
