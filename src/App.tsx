import { AnimatePresence, motion } from 'framer-motion';
import { useApp } from './state/AppState';
import { IntroModal } from './features/intro/IntroModal';
import { LandingPage } from './features/landing/LandingPage';
import { AppShell } from './features/app/AppShell';
import { TrialModal } from './features/trial/TrialModal';
import { CoachDrawer } from './features/coach/CoachDrawer';
import { LogEffortModal } from './features/workout/LogEffortModal';
import { Toasts } from './components/ui/Toasts';

export default function App() {
  const { view } = useApp();
  return (
    <>
      <AnimatePresence mode="wait">
        <motion.div
          key={view}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        >
          {view === 'landing' ? <LandingPage /> : <AppShell />}
        </motion.div>
      </AnimatePresence>
      <CoachDrawer />
      <LogEffortModal />
      <TrialModal />
      <IntroModal />
      <Toasts />
    </>
  );
}
