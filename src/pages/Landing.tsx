import { Link } from 'wouter';
import shopConfig from '@/shop.config';

export default function Landing() {
  const { colors, landing, contact, location } = shopConfig;

  return (
    <div className="min-h-screen" style={{ background: colors.bg, color: colors.text }}>
      {/* Header */}
      <header className="px-6 py-4 flex items-center justify-between max-w-4xl mx-auto">
        <h1 className="text-lg font-semibold" style={{ color: colors.primary }}>{shopConfig.name}</h1>
        <Link href="/login" className="text-sm px-4 py-2 rounded-lg border transition-opacity hover:opacity-80"
          style={{ borderColor: colors.primary, color: colors.primary }}>
          Team
        </Link>
      </header>

      {/* Hero */}
      <section className="px-6 py-20 text-center max-w-2xl mx-auto">
        <h2 className="text-4xl font-light leading-tight" style={{ color: colors.text }}>
          {landing.heroTitle}
        </h2>
        {landing.heroSubtitle && (
          <p className="mt-4 text-lg" style={{ color: colors.muted }}>{landing.heroSubtitle}</p>
        )}
      </section>

      {/* Sections */}
      {landing.sections && landing.sections.length > 0 && (
        <div className="max-w-2xl mx-auto px-6 pb-20 space-y-16">
          {landing.sections.map((section, i) => (
            <section key={i}>
              <h3 className="text-xl font-medium mb-3" style={{ color: colors.text }}>{section.title}</h3>
              <p className="leading-relaxed" style={{ color: colors.muted }}>{section.body}</p>
            </section>
          ))}
        </div>
      )}

      {/* Footer */}
      <footer className="border-t px-6 py-8 text-center text-sm" style={{ borderColor: `${colors.muted}22`, color: colors.muted }}>
        {location && <p>{location}</p>}
        {contact?.instagram && (
          <p className="mt-2">
            <a href={`https://instagram.com/${contact.instagram}`} target="_blank" rel="noopener"
              className="hover:opacity-70 transition-opacity" style={{ color: colors.primary }}>
              @{contact.instagram}
            </a>
          </p>
        )}
        <p className="mt-4 text-xs opacity-60">&copy; {new Date().getFullYear()} {shopConfig.name}</p>
      </footer>
    </div>
  );
}
