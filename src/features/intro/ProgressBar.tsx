import { useRef } from 'react';
import { SCENES, SCENE_COUNT, SCENE_MS, TOTAL_MS, clamp01, formatClock } from './introScript';

interface Props {
  elapsed: number;
  scene: number;
  accent: string;
  onSeek: (ms: number) => void;
}

/**
 * Segmented 4-part progress bar. A tap on a segment jumps to that scene; dragging scrubs.
 * Keyboard (←/→) is handled globally by the modal.
 */
export function ProgressBar({ elapsed, scene, accent, onSeek }: Props) {
  const barRef = useRef<HTMLDivElement>(null);
  const drag = useRef<{ x: number; moved: boolean; id: number } | null>(null);

  const msAt = (clientX: number) => {
    const el = barRef.current;
    if (!el) return 0;
    const r = el.getBoundingClientRect();
    return clamp01((clientX - r.left) / r.width) * TOTAL_MS;
  };

  return (
    <div className="w-full select-none">
      <div
        ref={barRef}
        data-testid="intro-progress"
        role="slider"
        aria-label="Intro progress"
        aria-valuemin={0}
        aria-valuemax={30}
        aria-valuenow={Math.round(elapsed / 1000)}
        aria-valuetext={`Scene ${scene + 1} of ${SCENE_COUNT}: ${SCENES[scene].label}, ${formatClock(elapsed)}`}
        className="group relative flex h-8 cursor-pointer touch-none items-center gap-1.5"
        onPointerDown={(e) => {
          if (e.button !== 0) return;
          drag.current = { x: e.clientX, moved: false, id: e.pointerId };
          try {
            e.currentTarget.setPointerCapture(e.pointerId);
          } catch {
            /* ignore */
          }
        }}
        onPointerMove={(e) => {
          const d = drag.current;
          if (!d || d.id !== e.pointerId) return;
          if (!d.moved && Math.abs(e.clientX - d.x) < 5) return;
          d.moved = true;
          onSeek(msAt(e.clientX));
        }}
        onPointerUp={(e) => {
          const d = drag.current;
          drag.current = null;
          if (!d) return;
          if (d.moved) onSeek(msAt(e.clientX));
          else onSeek(Math.min(SCENE_COUNT - 1, Math.floor(msAt(e.clientX) / SCENE_MS)) * SCENE_MS);
        }}
        onPointerCancel={() => {
          drag.current = null;
        }}
      >
        {SCENES.map((s, i) => {
          const fill = clamp01((elapsed - i * SCENE_MS) / SCENE_MS);
          const active = i === scene;
          return (
            <div key={s.label} className="relative h-full flex-1">
              <div
                className={`absolute inset-x-0 top-1/2 -translate-y-1/2 overflow-hidden rounded-full bg-white/10 transition-[height] duration-200 ${
                  active ? 'h-[6px]' : 'h-1 group-hover:h-[6px]'
                }`}
              >
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${fill * 100}%`,
                    background: active ? accent : 'rgba(238,240,245,0.75)',
                    boxShadow: active ? `0 0 12px ${accent}` : undefined,
                    transition: 'background 0.5s',
                  }}
                />
              </div>
            </div>
          );
        })}
        {/* Playhead */}
        <div
          className="pointer-events-none absolute top-1/2 h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-ink-950 bg-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100"
          style={{ left: `${(elapsed / TOTAL_MS) * 100}%` }}
        />
      </div>
      <div className="mt-0.5 hidden grid-cols-4 gap-1.5 sm:grid">
        {SCENES.map((s, i) => (
          <button
            key={s.label}
            type="button"
            tabIndex={-1}
            onClick={() => onSeek(i * SCENE_MS)}
            className={`truncate text-left text-[11px] font-semibold uppercase tracking-[0.14em] transition-colors ${
              i === scene ? 'text-ink-100' : 'text-ink-400 hover:text-ink-300'
            }`}
          >
            <span className="tabular-nums opacity-60">0{i + 1}</span> {s.label}
          </button>
        ))}
      </div>
    </div>
  );
}
