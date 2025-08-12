import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './dialog';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void | Promise<void>;
  onOpenChange: (open: boolean) => void;
  children?: React.ReactNode;
  confirmDisabled?: boolean;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  open,
  title,
  description,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  onOpenChange,
  children,
  confirmDisabled,
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        {children}
        <div className="flex justify-end gap-2">
          <button type="button" className="rounded-md bg-gray-100 px-4 py-2 text-gray-700 hover:bg-gray-200" onClick={() => onOpenChange(false)}>
            {cancelText}
          </button>
          <button
            type="button"
            className="rounded-md bg-red-600 px-4 py-2 text-white hover:bg-red-700"
            disabled={!!confirmDisabled}
            onClick={async () => {
              await onConfirm();
              onOpenChange(false);
            }}
          >
            {confirmText}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ConfirmDialog;



