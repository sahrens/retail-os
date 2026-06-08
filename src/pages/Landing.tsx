import shopConfig from '@/shop.config';

export default function Landing() {
  const { colors, landing, contact, location } = shopConfig;

  return (
    <div className="min-h-screen" style={{ background: colors.bg, color: colors.text }}>
      {/* Hero — full-bleed image with overlay */}
      <section className="relative h-[70vh] min-h-[480px] flex items-end">
        {landing.heroImage && (
          <img
            src={landing.heroImage}
            alt=""
            className="absolute inset-0 w-full h-full object-cover"
          />
        )}
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        {/* Content */}
        <div className="relative z-10 px-6 pb-12 md:pb-16 max-w-3xl mx-auto w-full">
          <h1 className="text-sm font-medium tracking-widest uppercase text-white/70 mb-3">
            {shopConfig.name}
          </h1>
          <h2 className="text-3xl md:text-5xl font-light leading-tight text-white">
            {landing.heroTitle}
          </h2>
          {landing.heroSubtitle && (
            <p className="mt-4 text-base md:text-lg text-white/80 max-w-xl leading-relaxed">
              {landing.heroSubtitle}
            </p>
          )}
        </div>
      </section>

      {/* Sections — alternating image/text layout */}
      {landing.sections && landing.sections.length > 0 && (
        <div className="max-w-5xl mx-auto px-6 py-16 md:py-24 space-y-20 md:space-y-32">
          {landing.sections.map((section, i) => (
            <section
              key={i}
              className={`flex flex-col gap-8 md:gap-12 ${
                i % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'
              } items-center`}
            >
              {/* Image */}
              {section.image && (
                <div className="w-full md:w-1/2 flex-shrink-0">
                  <img
                    src={section.image}
                    alt={section.title}
                    className="w-full h-64 md:h-80 object-cover rounded-2xl shadow-lg"
                  />
                </div>
              )}
              {/* Text */}
              <div className={`w-full ${section.image ? 'md:w-1/2' : ''}`}>
                <h3 className="text-2xl md:text-3xl font-light mb-2" style={{ color: colors.text }}>
                  {section.title}
                </h3>
                {section.subtitle && (
                  <p className="text-sm italic mb-4" style={{ color: colors.primary }}>
                    {section.subtitle}
                  </p>
                )}
                <p className="text-base leading-relaxed" style={{ color: colors.muted }}>
                  {section.body}
                </p>
              </div>
            </section>
          ))}
        </div>
      )}

      {/* Footer */}
      <footer
        className="border-t px-6 py-12 text-center"
        style={{ borderColor: `${colors.muted}22` }}
      >
        <h4 className="text-lg font-medium mb-2" style={{ color: colors.text }}>
          {shopConfig.name}
        </h4>
        {location && (
          <p className="text-sm" style={{ color: colors.muted }}>{location}</p>
        )}
        {contact?.instagram && (
          <p className="mt-3">
            <a
              href={`https://instagram.com/${contact.instagram}`}
              target="_blank"
              rel="noopener"
              className="text-sm hover:opacity-70 transition-opacity"
              style={{ color: colors.primary }}
            >
              @{contact.instagram}
            </a>
          </p>
        )}
        <p className="mt-6 text-xs" style={{ color: `${colors.muted}88` }}>
          &copy; {new Date().getFullYear()} {shopConfig.name}
        </p>
      </footer>
    </div>
  );
}
