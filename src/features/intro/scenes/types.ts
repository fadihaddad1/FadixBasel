export interface SceneProps {
  /** Local progress through this scene, 0..1 (driven by the intro clock). */
  t: number;
  /** true at md+ widths: side-by-side layouts and larger visuals. */
  wide: boolean;
}
