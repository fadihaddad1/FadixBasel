import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, Info, AlertTriangle, X } from 'lucide-react';
import { useApp } from '../../state/AppState';

export function Toasts() {
  const { toasts, dismissToast } = useApp();
  return (
    <div className="pointer-events-none fixed inset-x-0 top-4 z-[90] flex flex-col items-center gap-2 px-4">
      <AnimatePresence>
        {toasts.map((t) => {
          const Icon = t.tone === 'warn' ? AlertTriangle : t.tone === 'info' ? Info : CheckCircle2;
          const color = t.tone === 'warn' ? 'text-steady' : t.tone === 'info' ? 'text-spark' : 'text-prime';
          return (
            <motion.div
              key={t.id}
              layout
              initial={{ y: -30, opacity: 0, scale: 0.95 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: -20, opacity: 0, scale: 0.95 }}
              className="pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-2xl border border-white/10 bg-ink-800/95 p-3.5 shadow-2xl backdrop-blur-xl"
            >
              <Icon className={`mt-0.5 shrink-0 ${color}`} size={18} />
              <div className="min-w-0 flex-1">
                <div className="text-sm font-semibold text-ink-100">{t.title}</div>
                {t.body && <div className="mt-0.5 text-xs text-ink-400">{t.body}</div>}
              </div>
              <button aria-label="Dismiss" onClick={() => dismissToast(t.id)} className="text-ink-400 hover:text-ink-100">
                <X size={16} />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
