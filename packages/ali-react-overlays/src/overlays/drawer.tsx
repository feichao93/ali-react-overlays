import cx from 'classnames';
import * as React from 'react';
import { useOverlayBehavior } from '../context';
import { animations } from '../utils/animations';
import {
  IOverlayAnimationProps,
  IOverlayBackdropProps,
  IOverlayCloseActions,
  IOverlayLifecycles,
  IOverlayPortalProps,
  Overlay,
} from './overlay';

type DrawerInnerProps = Pick<DrawerProps, 'title' | 'content' | 'footer' | 'extra' | 'onRequestClose'>;

const DrawerInner = ({ title, footer, content, onRequestClose, extra }: DrawerInnerProps) => (
  <React.Fragment>
    {title == null ? null : <div className="aro-drawer-header">{title}</div>}
    <div className="aro-drawer-body">{content}</div>
    {footer == null ? footer : <div className="aro-drawer-footer">{footer}</div>}
    {extra}
  </React.Fragment>
);

export interface DrawerProps
  extends IOverlayCloseActions,
    IOverlayBackdropProps,
    IOverlayLifecycles,
    IOverlayAnimationProps,
    IOverlayPortalProps {
  style?: React.CSSProperties;
  className?: string;

  /** 抽屉是否显示 */
  visible?: boolean;

  /** 抽屉被关闭时的回调 */
  onRequestClose?(reason: any): void;

  /** 抽屉出现的位置 */
  placement?: 'left' | 'right' | 'top' | 'bottom';

  /** 抽屉标题 */
  title?: React.ReactNode;

  children?: React.ReactNode;
  content?: React.ReactNode;
  extra?: React.ReactNode;

  /** 使用 render prop 的形式指定弹层内容，用于精确控制 DOM 结构 */
  structure?(drawerProps: {
    ref: React.Ref<HTMLDivElement>;
    className: string;
    style: React.CSSProperties;
    'data-placement': DrawerProps['placement'];
  }): React.ReactNode;

  /** 弹窗页脚 */
  footer?: React.ReactNode;

  wrapperRef?: React.Ref<HTMLDivElement>;
}

function resolveDrawerAnimation(
  animationProp: IOverlayAnimationProps['animation'],
  placement: DrawerProps['placement'],
) {
  let animation = animationProp;
  if (animation == null) {
    if (placement === 'right') {
      animation = { in: animations.slideInRight, out: animations.slideOutRight };
    } else if (placement === 'left') {
      animation = { in: animations.slideInLeft, out: animations.slideOutLeft };
    } else if (placement === 'top') {
      animation = { in: animations.slideInTop, out: animations.slideOutTop };
    } else {
      animation = { in: animations.slideInBottom, out: animations.slideOutBottom };
    }
  }

  return animation;
}

export function Drawer({
  style: styleProp,
  className: classNameProp,
  visible,
  children: _children,
  content = _children,
  structure,
  title,
  footer,
  placement = 'right',
  onRequestClose,
  hasBackdrop = true,
  backdropClassName,
  backdropStyle,
  canCloseByEsc = true,
  canCloseByOutSideClick = true,
  usePortal,
  portalContainer: portalContainerProp,
  disableScroll = true,
  wrapperRef,
  animation,
  ...lifecycles
}: DrawerProps) {
  const overlayBehavior = useOverlayBehavior();
  const portalContainer = portalContainerProp ?? overlayBehavior.portalContainer;

  const className = cx('aro-drawer', classNameProp);
  const style: React.CSSProperties = Overlay.isCustomPortalContainer(portalContainer)
    ? { position: 'absolute', ...styleProp }
    : styleProp;

  return (
    <Overlay
      visible={visible}
      onRequestClose={onRequestClose}
      hasBackdrop={hasBackdrop}
      backdropClassName={backdropClassName}
      backdropStyle={backdropStyle}
      canCloseByEsc={canCloseByEsc}
      canCloseByOutSideClick={canCloseByOutSideClick}
      animation={resolveDrawerAnimation(animation, placement)}
      usePortal={usePortal}
      portalContainer={portalContainer}
      disableScroll={disableScroll}
      wrapperRef={wrapperRef}
      {...lifecycles}
      renderChildren={({ ref: _ref }) => {
        const ref = _ref as React.Ref<HTMLDivElement>;

        if (structure != null) {
          if (typeof structure !== 'function') {
            console.warn('[ali-react-overlays] Drawer props.structure 必须为回调函数');
            return <div ref={ref} />;
          }
          return structure({ ref, className, style, 'data-placement': placement });
        }

        return (
          <div ref={ref} style={style} className={className} data-placement={placement}>
            <DrawerInner title={title} content={content} footer={footer} onRequestClose={onRequestClose} />
          </div>
        );
      }}
    />
  );
}
