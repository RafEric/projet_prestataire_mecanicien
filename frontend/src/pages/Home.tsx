import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { mechanicsApi } from "../api/mechanics";
import LoadingSpinner from "../components/common/LoadingSpinner";
import LandingMapSection from "../components/landing/LandingMapSection";
import MechanicCard from "../components/mechanics/MechanicCard";
import { useAuth } from "../contexts/AuthContext";
import { useGeolocation } from "../hooks/useGeolocation";
import type { MechanicProfile } from "../types/mechanic";
import { getDashboardPath } from "../utils/roles";

const STEPS = [
  {
    icon: "🔍",
    title: "Trouvez un pro",
    description: "Parcourez les mécaniciens vérifiés près de chez vous, selon leurs spécialités et leurs avis.",
  },
  {
    icon: "📋",
    title: "Créez votre demande",
    description: "Décrivez votre problème, choisissez un créneau et envoyez votre demande en quelques clics.",
  },
  {
    icon: "✅",
    title: "Suivez l'intervention",
    description: "Échangez en direct avec le mécanicien et suivez l'avancement jusqu'à la finalisation.",
  },
];

export default function Home() {
  const { isAuthenticated, user } = useAuth();
  const { position, error: geoError, loading: geoLoading, refresh: refreshGeo } = useGeolocation();
  const [mechanics, setMechanics] = useState<MechanicProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const featuredMechanics = useMemo(() => mechanics.slice(0, 6), [mechanics]);

  useEffect(() => {
    const loadMechanics = async () => {
      try {
        const data = await mechanicsApi.list({
          is_verified: true,
          is_available: true,
          ordering: "-average_rating",
        });
        setMechanics(data.results);
      } catch {
        setMechanics([]);
      } finally {
        setLoading(false);
      }
    };
    loadMechanics();
  }, []);

  return (
    <div className="landing-page">
      <section className="landing-hero">
        <div className="landing-hero-content">
          <span className="landing-badge">Plateforme de mise en relation</span>
          <h1>Votre mécanicien de confiance, à portée de clic</h1>
          <p className="landing-hero-subtitle">
            Prestataire de Service Mécanicien vous connecte avec des professionnels qualifiés.
            Consultez les profils, comparez les avis et lancez votre demande d&apos;intervention en toute simplicité.
          </p>
          <div className="hero-actions">
            {isAuthenticated && user ? (
              <Link to={getDashboardPath(user.role)} className="btn-primary">
                Accéder à mon espace
              </Link>
            ) : (
              <>
                <Link to="/register" className="btn-primary">
                  Commencer gratuitement
                </Link>
                <Link to="/login" className="btn-secondary btn-on-hero">
                  Se connecter
                </Link>
              </>
            )}
            <a href="#map" className="btn-ghost btn-on-hero">
              Voir la carte ↓
            </a>
          </div>
          <div className="landing-stats">
            <div className="landing-stat">
              <strong>{loading ? "—" : mechanics.length > 0 ? `${mechanics.length}+` : "0"}</strong>
              <span>Mécaniciens disponibles</span>
            </div>
            <div className="landing-stat">
              <strong>100%</strong>
              <span>Profils vérifiés</span>
            </div>
            <div className="landing-stat">
              <strong>24/7</strong>
              <span>Suivi en temps réel</span>
            </div>
          </div>
        </div>
      </section>

      <LandingMapSection
        mechanics={mechanics}
        loading={loading}
        userPosition={position}
        geoLoading={geoLoading}
        geoError={geoError}
        onRefreshGeo={refreshGeo}
      />

      <section id="how-it-works" className="landing-section landing-section-alt">
        <div className="landing-section-header">
          <h2>Comment ça marche ?</h2>
          <p>Trois étapes simples pour obtenir l&apos;aide dont vous avez besoin.</p>
        </div>
        <div className="landing-steps">
          {STEPS.map((step, index) => (
            <article key={step.title} className="landing-step">
              <span className="landing-step-number">{index + 1}</span>
              <span className="landing-step-icon">{step.icon}</span>
              <h3>{step.title}</h3>
              <p>{step.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="mechanics" className="landing-section">
        <div className="landing-section-header">
          <h2>Nos mécaniciens recommandés</h2>
          <p>Découvrez dès maintenant les professionnels disponibles sur la plateforme.</p>
        </div>

        {loading ? (
          <LoadingSpinner label="Chargement des mécaniciens..." />
        ) : featuredMechanics.length === 0 ? (
          <div className="empty-state">
            <h3>Aucun mécanicien disponible pour le moment</h3>
            <p>Revenez bientôt ou inscrivez-vous pour être notifié des nouveaux profils.</p>
            {!isAuthenticated && (
              <Link to="/register" className="btn-primary btn-sm">Créer un compte</Link>
            )}
          </div>
        ) : (
          <>
            <div className="mechanics-grid">
              {featuredMechanics.map((mechanic) => (
                <MechanicCard key={mechanic.id} mechanic={mechanic} to={`/mechanics/${mechanic.id}`} />
              ))}
            </div>
            {!isAuthenticated && (
              <p className="landing-mechanics-hint">
                <Link to="/register">Inscrivez-vous</Link> pour contacter un mécanicien et créer une demande d&apos;intervention.
              </p>
            )}
          </>
        )}
      </section>

      <section className="landing-section">
        <div className="landing-features">
          <div className="feature-card">
            <span>🔍</span>
            <h3>Recherche géolocalisée</h3>
            <p>Trouvez les mécaniciens les plus proches de votre position.</p>
          </div>
          <div className="feature-card">
            <span>📋</span>
            <h3>Suivi des demandes</h3>
            <p>De la création à la finalisation, gardez le contrôle.</p>
          </div>
          <div className="feature-card">
            <span>💬</span>
            <h3>Messagerie intégrée</h3>
            <p>Échangez directement avec votre mécanicien en temps réel.</p>
          </div>
          <div className="feature-card">
            <span>⭐</span>
            <h3>Avis vérifiés</h3>
            <p>Consultez les retours d&apos;autres clients avant de choisir.</p>
          </div>
        </div>
      </section>

      {!isAuthenticated && (
        <section className="landing-cta">
          <div className="landing-cta-content">
            <h2>Prêt à trouver votre mécanicien ?</h2>
            <p>Rejoignez la plateforme en quelques secondes et lancez votre première demande.</p>
            <div className="hero-actions">
              <Link to="/register" className="btn-primary">Créer mon compte</Link>
              <Link to="/login" className="btn-secondary btn-on-cta">J&apos;ai déjà un compte</Link>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}