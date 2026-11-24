import { useLayoutEffect, useRef, type PointerEvent, type ReactNode } from 'react';
import { PaperGrain } from './PebbleArt';

export function BottomSheet({ titleId, onDismiss, children }: {
  titleId: string;
  onDismiss: () => void;
  children: ReactNode;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const surface = useRef<HTMLDivElement>(null);
  const drag = useRef<{ start: number; at: number; moved: number } | null>(null);

  useLayoutEffect(() => {
    const node = dialog.current;
    const trigger = document.activeElement;
    if (!node) return;
    node.showModal();
    return () => {
      node.close();
      if (trigger instanceof HTMLElement && trigger.isConnected) trigger.focus({ preventScroll: true });
    };
  }, []);

  function startDrag(event: PointerEvent<HTMLDivElement>) {
    if (!event.isPrimary || event.button !== 0) return;
    drag.current = { start: event.clientY, at: performance.now(), moved: 0 };
    event.currentTarget.setPointerCapture(event.pointerId);
    surface.current?.classList.add('is-dragging');
  }

  function moveDrag(event: PointerEvent<HTMLDivElement>) {
    if (!drag.current) return;
    const distance = Math.max(0, event.clientY - drag.current.start);
    drag.current.moved = distance;
    surface.current?.style.setProperty('--drag-offset', `${distance}px`);
  }

  function finishDrag(event: PointerEvent<HTMLDivElement>) {
    const interaction = drag.current;
    if (!interaction) return;
    drag.current = null;
    surface.current?.classList.remove('is-dragging');
    surface.current?.style.removeProperty('--drag-offset');
    const quickPull = interaction.moved > 35 && performance.now() - interaction.at < 210;
    if (event.type === 'pointerup' && (interaction.moved > 80 || quickPull)) onDismiss();
  }

  return (
    <dialog ref={dialog} aria-labelledby={titleId} className="bottom-sheet"
      onCancel={(event) => { event.preventDefault(); onDismiss(); }}
      onClick={(event) => { if (event.target === event.currentTarget) onDismiss(); }}>
      <div ref={surface} className="sheet-surface">
        <PaperGrain />
        <div className="sheet-chrome">
          <div className="sheet-grip" aria-hidden="true" onPointerDown={startDrag}
            onPointerMove={moveDrag} onPointerUp={finishDrag} onPointerCancel={finishDrag}>
            <span />
          </div>
          <button className="icon-button sheet-close" type="button" autoFocus aria-label="Close sheet" onClick={onDismiss}>
            <svg viewBox="0 0 24 24" width="19" height="19" aria-hidden="true"><path d="m6 6 12 12m0-12L6 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
          </button>
        </div>
        {children}
      </div>
    </dialog>
  );
}
