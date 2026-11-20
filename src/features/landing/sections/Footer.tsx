import { FounderBadge } from '../../../components/brand/Founder';
import { Logo } from '../../../components/brand/Logo';
import { useApp } from '../../../state/AppState';
import { scrollToId } from '../shared';

export function Footer() {
  const { setView, setTab, openIntro, openCoach, toast } = useApp();
  const soon = (what: string) => toast({ title: `${what} — coming soon`, body: "We're polishing this page. Thanks for your patience!", tone: 'info' });

  const groups: { title: string; links: { label: string; onClick: () => void }[] }[] = [
    {
      title: 'Product',
      links: [
        { label: 'How it works', onClick: () => scrollToId('how') },
        { label: 'Pricing', onClick: () => scrollToId('pricing') },
        {
          label: 'Open the app',
          onClick: () => {
            setView('app');
            setTab('today');
          },
        },
        { label: 'Watch the intro', onClick: openIntro },
      ],
    },
    {
      title: 'Company',
      links: [
        { label: "Founder's note", onClick: () => scrollToId('founder') },
        { label: 'Ask the coach', onClick: () => openCoach() },
        { label: 'Careers', onClick: () => soon('Careers') },
        { label: 'Contact', onClick: () => soon('Contact') },
      ],
    },
    {
      title: 'Legal',
      links: [
        { label: 'Privacy', onClick: () => soon('Privacy policy') },
        { label: 'Terms', onClick: () => soon('Terms of service') },
      ],
    },
  ];

  return (
    <footer className="border-t border-white/[0.06] px-4 pb-10 pt-14 sm:px-6">
      <div className="mx-auto max-w-[1200px]">
        <div className="grid gap-10 md:grid-cols-[1.4fr_2fr]">
          <div>
            <Logo size={34} />
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-ink-400">
              Know When to Push. Know When to Recover. No Smartwatch Required.
            </p>
            <FounderBadge className="mt-5" />
          </div>
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
            {groups.map((g) => (
              <div key={g.title}>
                <p className="eyebrow">{g.title}</p>
                <ul className="mt-3 space-y-1">
                  {g.links.map((l) => (
                    <li key={l.label}>
                      <button
                        type="button"
                        onClick={l.onClick}
                        className="min-h-[36px] text-left text-sm text-ink-300 transition hover:text-ink-100"
                      >
                        {l.label}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-white/[0.06] pt-6 text-center sm:flex-row sm:text-left">
          <p className="text-sm font-medium text-ink-300">
            © 2026 DayGauge. Founded by <span className="font-semibold text-ink-100">Fadi Haddad</span>.
          </p>
          <p className="text-xs text-ink-400">DayGauge offers general wellness guidance, not medical advice.</p>
        </div>
      </div>
    </footer>
  );
}
