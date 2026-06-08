import shopConfig from '@/shop.config';

export default function Landing() {
  const { colors, landing, contact, location } = shopConfig;

  return (
    <div className="min-h-screen" style={{ background: colors.bg, color: colors.text }}>
      {/* Hero — full-bleed image with overlay */}
      <section className="relative h-[75vh] min-h-[520px] flex items-end">
        {landing.heroImage && (
          <img
            src={landing.heroImage}
            alt=""
            className="absolute inset-0 w-full h-full object-cover"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        <div className="relative z-10 px-6 pb-14 md:pb-20 max-w-3xl mx-auto w-full">
          <h1 className="text-sm font-medium tracking-[0.2em] uppercase text-white/70 mb-3">
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

      {/* Sections */}
      {landing.sections && landing.sections.length > 0 && (
        <div className="max-w-6xl mx-auto px-6 py-16 md:py-24 space-y-24 md:space-y-36">
          {landing.sections.map((section, i) => (
            <section key={i}>
              {/* Main content row — alternating */}
              <div
                className={`flex flex-col gap-8 md:gap-14 ${
                  i % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'
                } items-center`}
              >
                {/* Primary image */}
                {section.image && (
                  <div className="w-full md:w-1/2 flex-shrink-0">
                    <img
                      src={section.image}
                      alt={section.title}
                      className="w-full h-72 md:h-96 object-cover rounded-2xl shadow-lg"
                    />
                  </div>
                )}
                {/* Text */}
                <div className={`w-full ${section.image ? 'md:w-1/2' : ''}`}>
                  <h3 className="text-2xl md:text-3xl font-light mb-2" style={{ color: colors.text }}>
                    {section.title}
                  </h3>
                  {section.subtitle && (
                    <p className="text-sm italic mb-4 tracking-wide" style={{ color: colors.primary }}>
                      {section.subtitle}
                    </p>
                  )}
                  <p className="text-base leading-relaxed" style={{ color: colors.muted }}>
                    {section.body}
                  </p>
                </div>
              </div>

              {/* Gallery row */}
              {section.gallery && section.gallery.length > 0 && (
                <div className="mt-8 md:mt-12 grid grid-cols-2 gap-4 md:gap-6">
                  {section.gallery.map((img, j) => (
                    <img
                      key={j}
                      src={img}
                      alt=""
                      className="w-full h-48 md:h-64 object-cover rounded-xl shadow-md"
                    />
                  ))}
                </div>
              )}
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
