import { useState, useEffect } from 'react';
import { LandingPage } from './pages/LandingPage';
import { AuditFormPage } from './pages/AuditFormPage';
import { ResultsPage } from './pages/ResultsPage';
import { SharedAuditPage } from './pages/SharedAuditPage';
import { PricingPage } from './pages/PricingPage';

type Page = 'landing' | 'form' | 'results' | 'pricing';

function getAuditIdFromPath(): string | null {
  const match = window.location.pathname.match(/^\/audit\/([a-f0-9-]{36})$/);
  return match ? match[1] : null;
}

export default function App() {
  const [page, setPage] = useState<Page>('landing');
  const [auditId, setAuditId] = useState<string | null>(null);
  const sharedId = getAuditIdFromPath();

  useEffect(() => {
    const handlePop = () => {
      const id = getAuditIdFromPath();
      if (!id) setPage('landing');
    };
    window.addEventListener('popstate', handlePop);
    return () => window.removeEventListener('popstate', handlePop);
  }, []);

  if (sharedId) {
    return <SharedAuditPage auditId={sharedId} />;
  }

  if (page === 'landing') {
    return (
      <LandingPage
        onStart={() => setPage('form')}
        onPricing={() => setPage('pricing')}
      />
    );
  }

  if (page === 'pricing') {
    return <PricingPage onBack={() => setPage('landing')} />;
  }

  if (page === 'form') {
    return (
      <AuditFormPage
        onBack={() => setPage('landing')}
        onComplete={(id) => {
          setAuditId(id);
          setPage('results');
          window.history.pushState({}, '', `/audit/${id}`);
        }}
      />
    );
  }

  return (
    <ResultsPage
      auditId={auditId!}
      onNewAudit={() => {
        setPage('form');
        window.history.pushState({}, '', '/');
      }}
    />
  );
}
