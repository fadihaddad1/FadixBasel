import { Quote } from 'lucide-react';
import { FounderBadge } from '../../../components/brand/Founder';
import { Reveal } from '../shared';

export function FounderNote() {
  return (
    <section id="founder" className="scroll-mt-20 px-4 py-20 sm:px-6 sm:py-28">
      <Reveal className="mx-auto max-w-4xl">
        <div className="card relative overflow-hidden p-6 sm:p-10 md:p-12">
          <div aria-hidden className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-spark/20 blur-3xl" />
          <div aria-hidden className="pointer-events-none absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-prime/10 blur-3xl" />

          <div className="relative">
            <p className="eyebrow">Founder's Note</p>
            <h2 className="mt-3 font-display text-3xl font-extrabold leading-tight text-ink-100 sm:text-4xl">
              Why I built <span className="text-gradient">DayGauge</span>
            </h2>

            <div className="mt-8 grid gap-8 md:grid-cols-[auto_1fr] md:gap-10">
              <div className="flex items-center gap-4 md:flex-col md:items-start">
                <div className="relative">
                  <div aria-hidden className="absolute inset-0 rounded-full bg-gradient-to-br from-spark to-prime opacity-60 blur-xl" />
                  <div className="relative grid h-20 w-20 place-items-center rounded-full bg-gradient-to-br from-spark via-prime to-steady font-display text-2xl font-extrabold text-ink-950 ring-4 ring-ink-900 md:h-24 md:w-24 md:text-3xl">
                    FH
                  </div>
                </div>
                <div>
                  <div className="font-semibold text-ink-100">Fadi Haddad</div>
                  <div className="text-sm text-ink-400">Founder, DayGauge</div>
                </div>
              </div>

              <div className="space-y-4 text-base leading-relaxed text-ink-300 sm:text-lg">
                <Quote size={28} className="text-spark/60" aria-hidden />
                <p>
                  For years I lived in a loop: I'd go all in, train hard six days a week, feel amazing — and then crash. Sore,
                  exhausted, unmotivated. I'd quit for a month, feel guilty, and start the whole cycle again.
                </p>
                <p>
                  I bought the watch. It gave me numbers — heart rate, sleep stages, scores — but never a straight answer to the only
                  question I had every morning: <span className="font-semibold text-ink-100">"Should I push today, or should I rest?"</span>
                </p>
                <p>
                  So I built the thing I wished I had. Ten seconds, four honest questions, and a workout that fits the day you're
                  actually having. DayGauge is for everyday people who want to stay consistent without burning out —
                  because the best plan is the one you can keep showing up for.
                </p>
                <div className="pt-2">
                  <p
                    className="text-4xl text-ink-100 sm:text-5xl"
                    style={{ fontFamily: '"Segoe Script", "Snell Roundhand", "Brush Script MT", "Apple Chancery", cursive', transform: 'rotate(-3deg)', transformOrigin: 'left' }}
                    aria-label="Signed, Fadi Haddad"
                  >
                    Fadi Haddad
                  </p>
                  <FounderBadge className="mt-4" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
