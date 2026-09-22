import React, { createContext, useContext, useState, useCallback, ReactNode, useRef } from 'react';
import { DialogOverlay } from './DialogOverlay';
import { Button } from './ui/Button';

export interface ConfirmOptions {
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  isDestructive?: boolean;
}

export interface ConfirmDialogProps extends ConfirmOptions {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

/**
 * ConfirmDialog component built strictly on DialogOverlay
 */
export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  title,
  description,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  isDestructive = false,
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  return (
    <DialogOverlay
      isOpen={isOpen}
      onClose={onCancel}
      ariaLabelledBy="confirm-dialog-title"
      ariaDescribedBy="confirm-dialog-desc"
    >
      <div className="bg-[#F5F2EB] w-full max-w-md rounded-[28px] border border-black/10 shadow-2xl overflow-hidden p-6 animate-fadeIn">
        <h3 id="confirm-dialog-title" className="text-base font-extrabold text-[#1C1E22] mb-2">
          {title}
        </h3>
        <p id="confirm-dialog-desc" className="text-xs text-[#737882] leading-relaxed mb-6">
          {description}
        </p>

        <div className="flex items-center justify-end gap-2.5">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={onCancel}
          >
            {cancelText}
          </Button>
          <Button
            type="button"
            variant={isDestructive ? 'danger' : 'primary'}
            size="sm"
            onClick={onConfirm}
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </DialogOverlay>
  );
};

// ----------------------------------------------------------------------------
// Programmatic useConfirm Hook & Provider
// ----------------------------------------------------------------------------

type ConfirmFn = (options: ConfirmOptions) => Promise<boolean>;

const ConfirmContext = createContext<ConfirmFn | undefined>(undefined);

export const ConfirmProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [dialogState, setDialogState] = useState<ConfirmOptions & { isOpen: boolean }>({
    isOpen: false,
    title: '',
    description: '',
  });

  const resolverRef = useRef<((value: boolean) => void) | null>(null);

  const confirm = useCallback((options: ConfirmOptions): Promise<boolean> => {
    return new Promise<boolean>((resolve) => {
      resolverRef.current = resolve;
      setDialogState({
        isOpen: true,
        ...options,
      });
    });
  }, []);

  const handleConfirm = useCallback(() => {
    setDialogState((prev) => ({ ...prev, isOpen: false }));
    if (resolverRef.current) {
      resolverRef.current(true);
      resolverRef.current = null;
    }
  }, []);

  const handleCancel = useCallback(() => {
    setDialogState((prev) => ({ ...prev, isOpen: false }));
    if (resolverRef.current) {
      resolverRef.current(false);
      resolverRef.current = null;
    }
  }, []);

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      <ConfirmDialog
        isOpen={dialogState.isOpen}
        title={dialogState.title}
        description={dialogState.description}
        confirmText={dialogState.confirmText}
        cancelText={dialogState.cancelText}
        isDestructive={dialogState.isDestructive}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
    </ConfirmContext.Provider>
  );
};

export function useConfirm(): ConfirmFn {
  try {
    const ctx = useContext(ConfirmContext);
    if (!ctx) {
      return async () => true;
    }
    return ctx;
  } catch {
    return async () => true;
  }
}

export default ConfirmDialog;
