import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, CalendarDays, Crown, Dumbbell, Globe, LineChart, PlayCircle, Sparkles, User, type LucideIcon } from 'lucide-react';
import type { AppTab } from '../../types/wellness';
import { useApp } from '../../state/AppState';
import { Logo, LogoMark } from '../../components/brand/Logo';
import { FounderBadge } from '../../components/brand/Founder';
import { WorkoutScreen } from '../workout/WorkoutScreen';
import { TrendsScreen } from '../trends/TrendsScreen';
import { TodayScreen } from './TodayScreen';
import { ProfileScreen } from './ProfileScreen';
import { useIsDesktop } from './useMediaQuery';

const NAV: { id: AppTab; label: string; icon: LucideIcon }[] = [
  { id: 'today', label: 'Today', icon: CalendarDays },
  { id: 'workout', label: 'Workout', icon: Dumbbell },
  { id: 'trends', label: 'Trends', icon: LineChart },
  { id: 'profile', label: 'Profile', icon: User },
];

const UI_SPRING = { type: 'spring', stiffness: 420, damping: 30 } as const;

function todayLabel() {
  return new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
}

/* ------------------------------------------------------------------ */
/* Shared pills                                                        */
/* ------------------------------------------------------------------ */

function StreakPill() {
  const { streak, toast } = useApp();
  return (
    <button
      type="button"
      onClick={() =>
        toast({
          title: `🔥 ${streak}-day streak`,
          body: 'Your streak grows every day you check in. Recovery days count too — resting on a red day is part of the plan, not a break from it.',
          tone: 'info',
        })
      }
      className="inline-flex h-9 items-center gap-1.5 rounded-full border border-sun/30 bg-sun/10 px-3 text-xs font-bold text-sun transition hover:bg-sun/20 active:scale-[0.97]"
      aria-label={`${streak}-day streak. Tap to learn how streaks work.`}
    >
      🔥 {streak}-day streak
    </button>
  );
}

function PlanBadge() {
  const { plan, openTrial, toast } = useApp();
  if (plan === 'free') {
    return (
      <button
        type="button"
        onClick={() => openTrial()}
        className="inline-flex h-9 items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.05] px-3 text-xs font-semibold text-ink-300 transition hover:border-spark/50 hover:text-ink-100 active:scale-[0.97]"
        aria-label="Free plan. Start your Pro trial."
      >
        Free <span className="text-spark">· Try Pro</span>
      </button>
    );
  }
  const isTrial = plan === 'trial';
  return (
    <button
      type="button"
      onClick={() =>
        toast({
          title: isTrial ? 'Pro trial active' : 'DayGauge Pro',
          body: isTrial ? 'Every Pro feature is unlocked for 7 days. Cancel anytime from Profile.' : 'Thanks for being Pro! Manage billing from your Profile.',
          tone: 'info',
        })
      }
      className="inline-flex h-9 items-center gap-1.5 rounded-full border border-spark/40 bg-spark/15 px-3 text-xs font-bold text-spark transition hover:bg-spark/25 active:scale-[0.97]"
    >
      <Crown size={13} /> {isTrial ? 'Trial' : 'Pro'}
    </button>
  );
}

function Avatar({ size = 36 }: { size?: number }) {
  const { userName, setTab, tab } = useApp();
  return (
    <button
      type="button"
      onClick={() => setTab('profile')}
      aria-label="Open profile"
      className={`grid shrink-0 place-items-center rounded-full bg-gradient-to-br from-spark to-prime font-display font-extrabold text-ink-950 transition active:scale-95 ${
        tab === 'profile' ? 'ring-2 ring-white/70 ring-offset-2 ring-offset-ink-950' : 'hover:brightness-110'
      }`}
      style={{ width: size, height: size, fontSize: size * 0.4 }}
    >
      {userName.charAt(0).toUpperCase()}
    </button>
  );
}

/* ------------------------------------------------------------------ */
/* Desktop sidebar                                                     */
/* ------------------------------------------------------------------ */

function Sidebar() {
  const { tab, setTab, openCoach, openIntro, openTrial, plan, setView } = useApp();
  return (
    <aside className="sticky top-0 hidden h-[100dvh] w-[248px] shrink-0 flex-col border-r border-white/[0.06] bg-ink-900/60 px-4 py-6 backdrop-blur-xl md:flex lg:w-[264px]">
      <button type="button" onClick={() => setTab('today')} className="mb-8 self-start px-2" aria-label="DayGauge home">
        <Logo size={34} />
      </button>

      <nav aria-label="App" className="flex flex-col gap-1">
        {NAV.map(({ id, label, icon: Icon }) => {
          const active = tab === id;
          return (
            <button
              key={id}
              type="button"
              data-testid={`tab-${id}`}
              aria-current={active ? 'page' : undefined}
              onClick={() => setTab(id)}
              className={`relative flex h-11 items-center gap-3 rounded-full px-4 text-sm font-semibold transition-colors ${
                active ? 'text-ink-950' : 'text-ink-400 hover:bg-white/[0.04] hover:text-ink-100'
              }`}
            >
              {active && <motion.span layoutId="sidebar-active-pill" className="absolute inset-0 rounded-full bg-prime" transition={UI_SPRING} />}
              <Icon size={18} className="relative" />
              <span className="relative">{label}</span>
            </button>
          );
        })}
      </nav>

      <div className="mt-6 flex flex-col gap-2">
        <button
          type="button"
          onClick={() => openCoach()}
          className="btn w-full bg-gradient-to-r from-spark to-prime text-ink-950 shadow-[0_8px_30px_-10px_rgba(124,140,255,0.7)] hover:brightness-110"
        >
          <Sparkles size={16} /> Ask AI Coach
        </button>
        <button type="button" onClick={openIntro} className="btn-ghost w-full">
          <PlayCircle size={16} /> Watch 30s Intro
        </button>
      </div>

      {plan === 'free' && (
        <div className="relative mt-6 overflow-hidden rounded-3xl border border-spark/25 bg-gradient-to-br from-spark/15 via-ink-900 to-prime/10 p-4">
          <div className="absolute -right-6 -top-6 h-20 w-20 rounded-full bg-spark/30 blur-2xl" />
          <div className="relative">
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.14em] text-spark">
              <Crown size={13} /> DayGauge Pro
            </div>
            <p className="mt-2 text-sm leading-snug text-ink-300">Smart workouts, Burnout Shield history and unlimited AI Coach.</p>
            <button type="button" onClick={() => openTrial()} className="btn-primary btn-sm mt-3 w-full">
              Start 7-day free trial
            </button>
          </div>
        </div>
      )}

      <div className="mt-auto flex flex-col gap-4 pt-6">
        <button
          type="button"
          onClick={() => setView('landing')}
          className="inline-flex items-center gap-2 self-start rounded-full px-2 py-1 text-xs font-semibold text-ink-400 transition hover:text-ink-100"
        >
          <ArrowLeft size={14} /> Back to website
        </button>
        <FounderBadge className="px-2" />
      </div>
    </aside>
  );
}

/* ------------------------------------------------------------------ */
/* Top bar                                                             */
/* ------------------------------------------------------------------ */

function TopBar({ isDesktop }: { isDesktop: boolean }) {
  const { userName, openIntro, setView, setTab } = useApp();
  if (isDesktop) {
    return (
      <header className="sticky top-0 z-30 border-b border-white/[0.04] bg-ink-950/75 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1100px] items-center justify-between gap-4 px-6 py-4 lg:px-8">
          <div className="min-w-0">
            <h1 className="truncate font-display text-xl font-extrabold text-ink-100 lg:text-2xl">Good morning, {userName}</h1>
            <p className="text-sm text-ink-400">{todayLabel()}</p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <StreakPill />
            <PlanBadge />
            <Avatar size={38} />
          </div>
        </div>
      </header>
    );
  }
  return (
    <>
      <header className="sticky top-0 z-30 border-b border-white/[0.04] bg-ink-950/80 backdrop-blur-xl" style={{ paddingTop: 'env(safe-area-inset-top)' }}>
        <div className="flex items-center justify-between gap-2 px-4 py-2.5">
          <button type="button" onClick={() => setTab('today')} aria-label="DayGauge home" className="flex items-center gap-2">
            <LogoMark size={30} />
            <span className="font-display text-base font-extrabold tracking-tight text-ink-100">
              Day<span className="text-prime">Gauge</span>
            </span>
          </button>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={openIntro}
              aria-label="Watch 30s intro"
              className="grid h-10 w-10 place-items-center rounded-full bg-white/[0.06] text-ink-300 transition hover:text-ink-100 active:scale-95"
            >
              <PlayCircle size={18} />
            </button>
            <button
              type="button"
              onClick={() => setView('landing')}
              aria-label="Back to website"
              className="flex h-10 items-center gap-1 rounded-full bg-white/[0.06] px-3 text-xs font-semibold text-ink-300 transition hover:text-ink-100 active:scale-95"
            >
              <Globe size={15} /> Site
            </button>
            <Avatar size={36} />
          </div>
        </div>
      </header>
      <div className="px-4 pt-4">
        <h1 className="font-display text-2xl font-extrabold text-ink-100">Good morning, {userName}</h1>
        <p className="text-sm text-ink-400">{todayLabel()}</p>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <StreakPill />
          <PlanBadge />
        </div>
      </div>
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Mobile bottom tab bar                                               */
/* ------------------------------------------------------------------ */

function MobileTab({ id, label, icon: Icon }: { id: AppTab; label: string; icon: LucideIcon }) {
  const { tab, setTab } = useApp();
  const active = tab === id;
  return (
    <button
      type="button"
      data-testid={`tab-${id}`}
      aria-current={active ? 'page' : undefined}
      onClick={() => setTab(id)}
      className={`relative flex h-14 flex-1 flex-col items-center justify-center gap-0.5 text-[11px] font-semibold transition-colors ${
        active ? 'text-prime' : 'text-ink-400 active:text-ink-100'
      }`}
    >
      <span data-testid={`m-tab-${id}`} className="relative grid h-7 w-12 place-items-center">
        {active && <motion.span layoutId="mobile-active-pill" className="absolute inset-0 rounded-full bg-prime/15" transition={UI_SPRING} />}
        <Icon size={20} className="relative" />
      </span>
      {label}
    </button>
  );
}

function BottomTabBar() {
  const { openCoach } = useApp();
  const [today, workout, trends, profile] = NAV;
  return (
    <nav
      aria-label="App"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-white/[0.06] bg-ink-900/90 backdrop-blur-xl md:hidden"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="mx-auto flex max-w-md items-end px-2">
        <MobileTab {...today} />
        <MobileTab {...workout} />
        <div className="flex flex-1 flex-col items-center">
          <button
            type="button"
            onClick={() => openCoach()}
            aria-label="Ask AI Coach"
            data-testid="m-coach"
            className="-mt-6 grid h-14 w-14 place-items-center rounded-full bg-gradient-to-br from-spark to-prime text-ink-950 shadow-[0_10px_30px_-6px_rgba(124,140,255,0.75)] ring-4 ring-ink-950 transition active:scale-95"
          >
            <Sparkles size={24} />
          </button>
          <span className="mb-1.5 mt-0.5 text-[11px] font-semibold text-ink-300">Coach</span>
        </div>
        <MobileTab {...trends} />
        <MobileTab {...profile} />
      </div>
    </nav>
  );
}

/* ------------------------------------------------------------------ */
/* Shell                                                               */
/* ------------------------------------------------------------------ */

function ActiveScreen({ tab }: { tab: AppTab }) {
  switch (tab) {
    case 'workout':
      return <WorkoutScreen />;
    case 'trends':
      return <TrendsScreen />;
    case 'profile':
      return <ProfileScreen />;
    default:
      return <TodayScreen />;
  }
}

export function AppShell() {
  const { tab } = useApp();
  const isDesktop = useIsDesktop();
  return (
    <div data-testid="app-shell" className="bg-grain relative min-h-[100dvh] w-full overflow-x-clip bg-ink-950 md:flex">
      {isDesktop && <Sidebar />}
      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar isDesktop={isDesktop} />
        <main
          className="mx-auto w-full max-w-[1100px] flex-1 px-4 pt-5 md:px-6 md:pb-12 md:pt-6 lg:px-8"
          style={isDesktop ? undefined : { paddingBottom: 'calc(104px + env(safe-area-inset-bottom))' }}
        >
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={tab}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            >
              <ActiveScreen tab={tab} />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
      {!isDesktop && <BottomTabBar />}
    </div>
  );
}
