import * as React from 'react';
import { DialogProps } from './dialog';

type DialogInnerProps = Pick<
  DialogProps,
  'footer' | 'onOk' | 'onCancel' | 'onRequestClose' | 'title' | 'content' | 'extra'
>;

export const DialogInner = (props: DialogInnerProps) => {
  const { footer, onOk, onCancel, onRequestClose, title, content, extra } = props;

  const handleCancel = () => {
    onCancel();
    onRequestClose('cancel');
  };

  const handleOk = () => {
    onOk();
    onRequestClose('ok');
  };

  return (
    <>
      {title == null ? null : <div className="aro-dialog-header">{title}</div>}

      <div className="aro-dialog-body">{content}</div>

      {footer === undefined && (
        <div className="aro-dialog-footer">
          <button data-action="cancel" onClick={handleCancel}>
            取消
          </button>
          <button data-action="confirm" onClick={handleOk}>
            确认
          </button>
        </div>
      )}

      {React.isValidElement(footer) && <div className="aro-dialog-footer">{footer}</div>}

      {extra}
    </>
  );
};
