import * as React from 'react';
import { IOverlayLifecycles, Overlay } from './overlay';
import { Popup, PopupProps } from './popup';

const animation = {
  in: Overlay.animations.linearZoomIn,
  out: Overlay.animations.linearZoomOut,
};

export interface TooltipProps
  extends Pick<
      PopupProps,
      | 'interactionKind'
      | 'flip'
      | 'placement'
      | 'renderTarget'
      | 'visible'
      | 'onRequestOpen'
      | 'onRequestClose'
      | 'usePortal'
      | 'attachOverlayManager'
    >,
    IOverlayLifecycles {
  /** 提示内容 */
  title?: React.ReactNode;

  /** 正文内容 */
  children?: React.ReactNode;
}

export function Tooltip({
  children,
  title,
  flip,
  interactionKind = 'hover',
  placement = 'top',
  ...others
}: TooltipProps) {
  return (
    <Popup
      animation={animation}
      animationDuration="100ms"
      hasArrow
      flip={flip}
      interactionKind={interactionKind}
      placement={placement}
      hoverDelay={60}
      target={children}
      {...others}
      renderChildren={({ ref, arrow }) => (
        <div ref={ref as React.RefObject<HTMLDivElement>} className="aro-tooltip">
          {arrow}
          {title}
        </div>
      )}
    />
  );
}
