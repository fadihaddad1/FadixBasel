import { Star, Timer, WatchIcon } from 'lucide-react';
import { Reveal } from '../shared';

const ITEMS = [
  { icon: Star, value: '4.8★', label: 'from 2,100+ beta users', color: '#FFB547' },
  { icon: Timer, value: '10 sec', label: 'average daily check-in', color: '#2EE6A6' },
  { icon: WatchIcon, value: '0', label: 'wearables required', color: '#7C8CFF' },
];

export function SocialProof() {
  return (
    <section aria-label="Social proof" className="px-4 sm:px-6">
      <Reveal className="mx-auto max-w-[1200px]">
        <div className="card grid divide-y divide-white/[0.06] sm:grid-cols-3 sm:divide-x sm:divide-y-0">
          {ITEMS.map(({ icon: Icon, value, label, color }) => (
            <div key={label} className="flex items-center gap-4 px-6 py-5 sm:justify-center">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl" style={{ background: `${color}1F`, color }}>
                <Icon size={20} />
              </span>
              <div>
                <div className="font-display text-2xl font-extrabold text-ink-100">{value}</div>
                <div className="text-sm text-ink-400">{label}</div>
              </div>
            </div>
          ))}
        </div>
      </Reveal>
    </section>
  );
}
