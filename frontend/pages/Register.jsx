import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "./styles.css";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("student");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, role, password }),
      });
      const data = await res.json();

      if (!data.ok) {
        setError(data.error || "Erreur inscription");
        return;
      }

      alert("Inscription réussie !");
      navigate("/");
    } catch (err) {
      setError("Erreur serveur");
    }
  };

  return (
    <main className="container">
      <h1>SmartSummary</h1>
      <form onSubmit={handleRegister} className="card">
        <h2>Inscription</h2>
        {error && <p className="error">{error}</p>}
        <input
          type="text"
          placeholder="Nom"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <select value={role} onChange={(e) => setRole(e.target.value)}>
          <option value="student">Étudiant</option>
          <option value="teacher">Enseignant</option>
        </select>
        <input
          type="password"
          placeholder="Mot de passe"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit">S’inscrire</button>
        <p>
          Déjà un compte ? <Link to="/">Connexion</Link>
        </p>
      </form>
    </main>
  );
}
