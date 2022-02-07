import * as React from 'react';
import { DialogProps } from './dialog';

type DialogInnerProps = Pick<
  DialogProps,
  'footer' | 'onOk' | 'onCancel' | 'onRequestClose' | 'title' | 'content' | 'canCloseByIcon'
>;

export const DialogInner = (props: DialogInnerProps) => {
  const { footer, onOk, onCancel, onRequestClose, title, content, canCloseByIcon } = props;

  return (
    <>
      {title && <div className="aro-dialog-header">{title}</div>}

      <div className="aro-dialog-body">{content}</div>

      <DialogFooter footer={footer} onOk={onOk} onCancel={onCancel} onRequestClose={onRequestClose} />

      {canCloseByIcon && (
        <button className="aro-dialog-close" onClick={onRequestClose}>
          close
        </button>
      )}
    </>
  );
};

export function DialogFooter({
  footer,
  onRequestClose,
  onCancel,
  onOk,
  className = 'aro-dialog-footer',
}: Pick<DialogProps, 'footer' | 'onOk' | 'onCancel' | 'onRequestClose' | 'className'>) {
  if (footer === null) {
    return null;
  }

  if (footer === undefined) {
    const handleCancel = () => {
      onCancel();
      onRequestClose('cancel');
    };

    const handleOk = () => {
      onOk();
      onRequestClose('ok');
    };

    return (
      <div className={className}>
        <button data-action="cancel" onClick={handleCancel}>
          取消
        </button>
        <button data-action="confirm" onClick={handleOk}>
          确认
        </button>
      </div>
    );
  }

  return <div className={className}>{footer}</div>;
}
