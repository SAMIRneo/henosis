import {useLayoutEffect, useRef, type RefObject} from 'react';

export function useDialog(ref: RefObject<HTMLDialogElement | null>, open: boolean, fallbackSelector: string) {
  const trigger = useRef<HTMLElement | null>(null);
  useLayoutEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      trigger.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
      dialog.showModal();
      dialog.querySelector<HTMLElement>('[data-autofocus]')?.focus({preventScroll: true});
    } else if (!open && dialog.open) {
      dialog.close();
      const other = document.querySelector<HTMLDialogElement>('dialog[open]');
      if (other) {
        other.querySelector<HTMLElement>('[data-autofocus]')?.focus({preventScroll: true});
        return;
      }
      const previous = trigger.current;
      const usable = previous?.isConnected && !previous.closest('dialog:not([open])') && !previous.closest('[hidden]');
      const destination = usable ? previous : document.querySelector<HTMLElement>(fallbackSelector);
      destination?.focus({preventScroll: true});
    }
  }, [open, ref, fallbackSelector]);
}
