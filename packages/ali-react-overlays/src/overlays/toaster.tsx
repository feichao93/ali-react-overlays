import cx from 'classnames';
import * as _ from 'lodash-es';
import memoizeOne from 'memoize-one';
import * as React from 'react';
import { useRef } from 'react';
import { noop } from 'rxjs';
import { OverlayBehaviorContext, OverlayBehaviorContextType } from '../context';
import { mergeRefs } from '../utils/common';
import { makeDetachedRenderContainer, RenderContainer } from '../utils/render-containers';
import { IOverlayAnimationProps, IOverlayPortalProps, Overlay, OverlayProps } from './overlay';
import { Position, PositionOffset, PositionPlacement } from './position';
import { Toast, ToastConfig, ToastConfigCommon, ToastRequest } from './toast';

let nextToastId = 1;

function getUniqueToastKey() {
  return `toast-${nextToastId++}`;
}

interface ToastListProps extends IOverlayPortalProps, IOverlayAnimationProps {
  placement: PositionPlacement;
  offset?: PositionOffset;
  style?: React.CSSProperties;
  className?: string;
  duration?: number;

  toaster: Toaster;
  items: ToastConfig[];
}

class ToastList extends React.Component<ToastListProps> {
  static readonly contextType = OverlayBehaviorContext;
  readonly context: OverlayBehaviorContextType;

  static defaultProps = {
    placement: 'top',
  };

  static getDefaultOffsetByPlacement(placement: PositionPlacement): PositionOffset {
    return [
      placement.includes('left') ? 24 : placement.includes('right') ? -24 : 0,
      placement.includes('top') ? 24 : placement.includes('bottom') ? -24 : 0,
    ];
  }

  private mergeRefs = memoizeOne(mergeRefs);

  static getDefaultAnimationByPlacement(placement: PositionPlacement): OverlayProps['animation'] {
    if (placement === 'center') {
      return { in: Overlay.animations.zoomIn, out: Overlay.animations.zoomOut };
    } else if (placement === 'top') {
      return { in: Overlay.animations.expandInDown, out: Overlay.animations.expandOutUp };
    } else if (placement === 'bottom') {
      return { in: Overlay.animations.expandInUp, out: Overlay.animations.expandOutDown };
    } else if (placement.includes('left')) {
      return { in: Overlay.animations.slideInLeft, out: Overlay.animations.slideOutLeft };
    } else {
      return { in: Overlay.animations.slideInRight, out: Overlay.animations.slideOutRight };
    }
  }

  render() {
    const {
      portalContainer: portalContainerProp,
      usePortal,
      disableScroll,
      placement,
      offset = ToastList.getDefaultOffsetByPlacement(placement),
      className,
      style,
      animation = ToastList.getDefaultAnimationByPlacement(placement),
      animationDuration = '300ms',
      items,
      toaster,
    } = this.props;

    const portalContainer = portalContainerProp ?? this.context.portalContainer;
    const containerVisible = items.length > 0;

    return (
      <Overlay
        visible={containerVisible}
        portalContainer={portalContainer}
        usePortal={usePortal}
        disableScroll={disableScroll}
        animation={false}
        attachOverlayManager={false}
        renderChildren={({ ref: overlayContentRef }) => (
          <Position container={portalContainer} placement={placement} offset={offset}>
            {(positionTargetRef) => (
              <div
                ref={this.mergeRefs(overlayContentRef, positionTargetRef)}
                style={style}
                className={cx('aro-toast-list', className)}
              >
                {items.map((item) => (
                  <Toast
                    animation={animation}
                    animationDuration={animationDuration}
                    toaster={toaster}
                    key={item.key}
                    item={item}
                  />
                ))}
              </div>
            )}
          </Position>
        )}
      />
    );
  }
}

const DEFAULT_TOAST_COMMON: ToastConfigCommon = {
  placement: 'top',
  duration: 5000,
  canCloseByClick: false,
};

const INHERITABLE_TOAST_KEYS = Object.keys(DEFAULT_TOAST_COMMON);

function useToaster(toasterProps: ToasterProps = {}) {
  const ref = useRef<Toaster>();

  const contextHolder = <Toaster ref={ref} {...toasterProps} />;

  return [
    {
      show(req: ToastRequest) {
        return ref.current.show(req);
      },
      close(key: string) {
        ref.current.close(key);
      },
      closeAll() {
        ref.current.closeAll();
      },
      clear(key: string) {
        ref.current.clear(key);
      },
      clearAll() {
        ref.current.clearAll();
      },
    },
    contextHolder,
  ] as const;
}

function makeStaticToasterQuickTools() {
  let container: RenderContainer;
  const ref = React.createRef<Toaster>();
  const currentConfig: ToastConfigCommon = { ...DEFAULT_TOAST_COMMON };

  const ensureMounted = () => {
    if (ref.current != null) {
      return;
    }
    container = makeDetachedRenderContainer();
    container.render(<Toaster ref={ref} {...currentConfig} />);
  };

  return {
    getConfig() {
      return Object.assign({}, currentConfig);
    },
    config(nextConfig: Partial<ToastConfigCommon>) {
      Object.assign(currentConfig, nextConfig);
      ensureMounted();
      container.render(<Toaster ref={ref} {...currentConfig} />);
    },
    show(req: ToastRequest) {
      ensureMounted();
      return ref.current.show(req);
    },
    close(key: string) {
      ensureMounted();
      ref.current.close(key);
    },
    closeAll() {
      ensureMounted();
      ref.current.closeAll();
    },
    clear(key: string) {
      ref.current.clear(key);
    },
    clearAll() {
      ref.current.clearAll();
    },
  };
}

const staticToasterQuickTools = makeStaticToasterQuickTools();

export interface ToasterProps extends ToastConfigCommon, IOverlayPortalProps {}

export class Toaster extends React.Component<ToasterProps, { items: ToastConfig[] }> {
  static show = staticToasterQuickTools.show;
  static close = staticToasterQuickTools.close;
  static closeAll = staticToasterQuickTools.closeAll;
  static config = staticToasterQuickTools.config;
  static getConfig = staticToasterQuickTools.getConfig;

  static useToaster = useToaster;

  state = {
    items: [] as ToastConfig[],
  };

  show(req: ToastRequest) {
    const key = req.key ?? getUniqueToastKey();

    const inflatedConfig = {
      ...DEFAULT_TOAST_COMMON,
      ..._.pick(this.props, INHERITABLE_TOAST_KEYS as unknown as any),
      onClick: noop,
      ...req,
      key,
      visible: true,
    } as ToastConfig;

    this.setState((prevState) => ({ items: prevState.items.concat([inflatedConfig]) }));

    return key;
  }

  close(key: string) {
    this.setState((prev) => {
      const prevItems = prev.items;
      const index = prevItems.findIndex((item) => item.key === key);
      if (index === -1) {
        return null;
      }
      const item = prevItems[index];
      if (!item.visible) {
        return null;
      }
      const nextItems = [...prevItems.slice(0, index), { ...item, visible: false }, ...prevItems.slice(index + 1)];

      return { items: nextItems };
    });
  }

  closeAll() {
    this.setState((prev) => {
      const nextItems = prev.items.map((item) => ({ ...item, visible: false }));
      return { items: nextItems };
    });
  }

  clear(key: string) {
    this.setState((prev) => {
      const nextItems = prev.items.filter((item) => item.key !== key);
      return { items: nextItems };
    });
  }

  clearAll() {
    this.setState({ items: [] });
  }

  render() {
    const { items } = this.state;
    const { portalContainer, usePortal, disableScroll } = this.props;

    const groups = _.groupBy(items, (item) => item.placement);

    return Object.keys(groups).map((placement) => (
      <ToastList
        key={placement}
        placement={placement as PositionPlacement}
        items={groups[placement]}
        toaster={this}
        portalContainer={portalContainer}
        usePortal={usePortal}
        disableScroll={disableScroll}
      />
    ));
  }
}
