import React, { useState, useMemo } from 'react';
import Overview from './pages/Overview';
import Analysis from './pages/Analysis';
import Comparison from './pages/Comparison';
import Report from './pages/Report';
import { candidateCities } from './data/cities';

const NAV_ITEMS = [
  { id: 'overview',    label: 'Overview',    icon: '🏠', badge: null },
  { id: 'analysis',   label: 'Map Analysis', icon: '🗺️', badge: 'Live' },
  { id: 'comparison', label: 'Comparison',   icon: '📊', badge: null },
  { id: 'report',     label: 'Report',       icon: '📋', badge: 'AI' },
];

export default function App() {
  const [activePage, setActivePage] = useState('overview');
  const [selectedCityId, setSelectedCityId] = useState(1);
  const [weights, setWeights] = useState({ demographics: 25, competition: 25, infrastructure: 25, spending: 25 });
  const [pageKey, setPageKey] = useState(0); // used to trigger re-animation on nav

  const normalizedWeights = useMemo(() => {
    const total = Object.values(weights).reduce((a, b) => a + b, 0) || 1;
    return Object.fromEntries(Object.entries(weights).map(([k, v]) => [k, v / total]));
  }, [weights]);

  const scoredCities = useMemo(() =>
    candidateCities.map(city => ({
      ...city,
      totalScore:
        (city.demographics * normalizedWeights.demographics) +
        ((100 - city.competition) * normalizedWeights.competition) +
        (city.infrastructure * normalizedWeights.infrastructure) +
        (city.spending * normalizedWeights.spending),
    })).sort((a, b) => b.totalScore - a.totalScore),
    [normalizedWeights]
  );

  const selectedCity = scoredCities.find(c => c.id === selectedCityId) || scoredCities[0];

  const handleNavigate = (pageId) => {
    if (pageId === activePage) return;
    setActivePage(pageId);
    setPageKey(k => k + 1);
  };

  const renderPage = () => {
    switch (activePage) {
      case 'overview':
        return <Overview onNavigate={handleNavigate} setSelectedCityId={setSelectedCityId} />;
      case 'analysis':
        return <Analysis selectedCityId={selectedCityId} setSelectedCityId={setSelectedCityId} weights={weights} setWeights={setWeights} />;
      case 'comparison':
        return <Comparison weights={weights} />;
      case 'report':
        return <Report weights={weights} />;
      default:
        return null;
    }
  };

  return (
    <div className="app-shell">
      {/* ─── Sidebar ─────────────────────────────────────── */}
      <nav className="sidebar slide-right">
        {/* Brand */}
        <div className="sidebar-brand">
          <div className="sidebar-logo">
            <img
              src="/logo.png"
              alt="LocateIQ Logo"
              style={{ width: 38, height: 38, borderRadius: 8, objectFit: 'cover', flexShrink: 0 }}
            />
            <div>
              <div className="sidebar-title">LocateIQ</div>
            </div>
          </div>
          <div className="sidebar-subtitle">Site Selection Platform</div>
        </div>

        {/* Main Navigation */}
        <div className="nav-section">
          <div className="nav-section-label">Main Menu</div>
          {NAV_ITEMS.map(item => (
            <button
              key={item.id}
              className={`nav-item ${activePage === item.id ? 'active' : ''}`}
              onClick={() => handleNavigate(item.id)}
              id={`nav-${item.id}`}
            >
              <span className="nav-icon">{item.icon}</span>
              <span>{item.label}</span>
              {item.badge && <span className="nav-badge">{item.badge}</span>}
            </button>
          ))}
        </div>

        <div className="sidebar-divider" />

        {/* City Quick-Select */}
        <div className="nav-section">
          <div className="nav-section-label">Quick Select City</div>
          {scoredCities.map(city => (
            <button
              key={city.id}
              className={`sidebar-city-btn ${selectedCity.id === city.id ? 'active' : ''}`}
              onClick={() => { setSelectedCityId(city.id); handleNavigate('analysis'); }}
            >
              <span className="city-dot" style={{ background: city.color }} />
              <span>{city.name}</span>
              <span className="city-score-pill">{city.totalScore.toFixed(0)}</span>
            </button>
          ))}
        </div>

        {/* Footer info */}
        <div style={{ padding: '16px 20px', borderTop: '1px solid var(--border)', marginTop: 'auto' }}>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-500)', lineHeight: 1.7 }}>
            <div style={{ fontWeight: 700, color: 'var(--text-300)', marginBottom: 4 }}>India Expansion Series</div>
            5 cities · 4 metrics · Real-time scoring
          </div>
        </div>
      </nav>

      {/* ─── Page Area ───────────────────────────────────── */}
      <div className="page-area">
        <div className="page-transition" key={pageKey}>
          {renderPage()}
        </div>
      </div>
    </div>
  );
}
