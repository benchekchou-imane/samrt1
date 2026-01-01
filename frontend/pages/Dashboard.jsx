import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./styles.css";

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [summaries, setSummaries] = useState([]);
  const [audioFile, setAudioFile] = useState(null);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [summaryResult, setSummaryResult] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const userJson = localStorage.getItem("smartsummary_user");
    if (!userJson) return navigate("/");
    const currentUser = JSON.parse(userJson);
    setUser(currentUser);

    const allSummaries = JSON.parse(localStorage.getItem("smartsummary_summaries") || "[]");
    const userSummaries = allSummaries.filter(s => s.userEmail === currentUser.email);
    setSummaries(userSummaries);
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("smartsummary_user");
    localStorage.removeItem("smartsummary_token");
    navigate("/");
  };

  const handleAudioChange = (e) => {
    setAudioFile(e.target.files[0]);
  };

  const handleUploadAndSummarize = async () => {
    if (!audioFile) return alert("Choisis un fichier audio !");
    setSummaryLoading(true);

    try {
      const token = localStorage.getItem("smartsummary_token");
      const formData = new FormData();
      formData.append("audio", audioFile);

      // Upload audio
      const uploadRes = await fetch("/api/upload-audio", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const uploadData = await uploadRes.json();
      if (!uploadData.ok) throw new Error(uploadData.error || "Erreur upload");

      // Générer résumé
      const summaryRes = await fetch("/api/get-summary", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ email: user.email, sendEmail: false }),
      });
      const summaryData = await summaryRes.json();
      if (!summaryData.ok) throw new Error(summaryData.error || "Erreur résumé");

      const newSummary = {
        userEmail: user.email,
        title: audioFile.name,
        content: summaryData.summary,
        createdAt: Date.now(),
      };

      const updatedSummaries = [...summaries, newSummary];
      setSummaries(updatedSummaries);
      localStorage.setItem("smartsummary_summaries", JSON.stringify([...JSON.parse(localStorage.getItem("smartsummary_summaries") || "[]"), newSummary]));
      setSummaryResult(summaryData.summary);
      setAudioFile(null);
      document.getElementById("audioInput").value = "";
    } catch (err) {
      alert(err.message || "Erreur serveur");
    } finally {
      setSummaryLoading(false);
    }
  };

  if (!user) return <p>Chargement...</p>;

  return (
    <main className="container">
      <header>
        <div className="logo-container">
          <h1>SmartSummary</h1>
        </div>
        <div>
          <span>{user.name} ({user.email})</span>
          <button onClick={handleLogout}>Déconnexion</button>
        </div>
      </header>

      <section className="card">
        <h2>🎤 Upload Audio et Génération de Résumé</h2>
        <input id="audioInput" type="file" accept="audio/*" onChange={handleAudioChange} />
        <button onClick={handleUploadAndSummarize} disabled={summaryLoading}>
          {summaryLoading ? "Génération en cours..." : "Générer résumé"}
        </button>

        {summaryResult && (
          <div className="summary-result">
            <h3>Résumé généré :</h3>
            <p>{summaryResult}</p>
          </div>
        )}
      </section>

      <section className="card">
        <h2>📝 Mes Résumés</h2>
        <div className="items-grid">
          {summaries.length === 0 ? (
            <p className="empty-state">Aucun résumé pour le moment.</p>
          ) : (
            summaries.map((summary, idx) => (
              <div className="item-card" key={idx}>
                <h3>{summary.title || `Résumé ${idx + 1}`}</h3>
                <p className="item-date">{new Date(summary.createdAt).toLocaleString("fr-FR")}</p>
                <p className="item-preview">{summary.content.substring(0, 100)}...</p>
                <button onClick={() => alert(summary.content)}>Voir</button>
              </div>
            ))
          )}
        </div>
      </section>
    </main>
  );
}
