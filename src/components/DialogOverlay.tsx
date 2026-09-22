import React, { useEffect, useRef } from 'react';

export interface DialogOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
  backdropClassName?: string;
  ariaLabel?: string;
  ariaLabelledBy?: string;
  ariaDescribedBy?: string;
  closeOnBackdropClick?: boolean;
}

/**
 * DialogOverlay provides an accessible modal wrapper:
 * 1. Focus trap: keeps Tab and Shift+Tab navigation bounded inside the dialog.
 * 2. Escape key dismissal: triggers onClose when Escape is pressed.
 * 3. Body scroll lock: disables body scroll when active and restores on unmount.
 * 4. ARIA conformance: role="dialog" and aria-modal="true".
 */
export const DialogOverlay: React.FC<DialogOverlayProps> = ({
  isOpen,
  onClose,
  children,
  className = '',
  backdropClassName = 'bg-black/60 backdrop-blur-xs',
  ariaLabel,
  ariaLabelledBy,
  ariaDescribedBy,
  closeOnBackdropClick = true,
}) => {
  const dialogRef = useRef<HTMLDivElement>(null);
  const previouslyFocusedElementRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    // Save previous focus
    if (typeof document !== 'undefined') {
      previouslyFocusedElementRef.current = document.activeElement as HTMLElement | null;
      document.body.style.overflow = 'hidden';
    }

    // Auto-focus first focusable element or dialog container
    const timer = setTimeout(() => {
      if (dialogRef.current) {
        const focusable = dialogRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusable.length > 0) {
          focusable[0]?.focus();
        } else {
          dialogRef.current.focus();
        }
      }
    }, 50);

    // Keydown handler: Escape key & Focus Trap
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        onClose();
        return;
      }

      if (e.key === 'Tab' && dialogRef.current) {
        const focusables = Array.from(
          dialogRef.current.querySelectorAll<HTMLElement>(
            'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
          )
        ).filter((el) => el.offsetParent !== null); // Visible elements only

        if (focusables.length === 0) {
          e.preventDefault();
          return;
        }

        const first = focusables[0];
        const last = focusables[focusables.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === first || !dialogRef.current.contains(document.activeElement)) {
            e.preventDefault();
            last?.focus();
          }
        } else {
          if (document.activeElement === last || !dialogRef.current.contains(document.activeElement)) {
            e.preventDefault();
            first?.focus();
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('keydown', handleKeyDown);
      if (typeof document !== 'undefined') {
        document.body.style.overflow = '';
        if (previouslyFocusedElementRef.current && typeof previouslyFocusedElementRef.current.focus === 'function') {
          previouslyFocusedElementRef.current.focus();
        }
      }
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-fadeIn ${backdropClassName} ${className}`}
      onClick={(e) => {
        if (closeOnBackdropClick && e.target === e.currentTarget) {
          onClose();
        }
      }}
      role="dialog"
      aria-modal="true"
      aria-label={ariaLabel}
      aria-labelledby={ariaLabelledBy}
      aria-describedby={ariaDescribedBy}
      tabIndex={-1}
      ref={dialogRef}
    >
      {children}
    </div>
  );
};

export default DialogOverlay;
