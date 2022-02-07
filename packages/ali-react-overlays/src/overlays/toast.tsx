import cx from 'classnames';
import memoizeOne from 'memoize-one';
import * as React from 'react';
import { animationFrames, defer, fromEvent, merge, Observable, of, Subject, Subscription } from 'rxjs';
import * as op from 'rxjs/operators';
import { startAnimate } from '../utils/animate-utils';
import { mergeRefs } from '../utils/common';
import { IOverlayAnimationProps, Overlay } from './overlay';
import { PositionPlacement } from './position';
import { Toaster } from './toaster';

function isFiniteDuration(duration: number) {
  return duration > 0 && Number.isFinite(duration);
}

/** toast 可以从 toaster 中继承过来的属性 */
export interface ToastConfigCommon {
  placement?: PositionPlacement;
  duration?: number;
  canCloseByClick?: boolean;
}

export type ToastRequest = Partial<Omit<ToastConfig, 'visible'>>;

export interface ToastConfig extends ToastConfigCommon {
  key: string;
  visible: boolean;
  content: React.ReactNode;
  onClick?(event: React.MouseEvent<HTMLDivElement>): void;
  renderContent?(
    arg: {
      ref: React.Ref<Element>;
      onClick(event: React.MouseEvent<HTMLDivElement>): void;
      onMouseEnter(): void;
      onMouseLeave(): void;
    },
    extra: { close?(): void },
  ): React.ReactNode;
}

export interface ToastProps extends IOverlayAnimationProps {
  toaster: Toaster;
  item: ToastConfig;
}

interface ToastState {
  shrinking: boolean;
}

class ToastHoverHelper {
  static windowFocus$ = defer(() =>
    merge(fromEvent(window, 'focus').pipe(op.mapTo(true)), fromEvent(window, 'blur').pipe(op.mapTo(false))).pipe(
      op.startWith(true),
      op.shareReplay(1),
    ),
  );

  private readonly subject = new Subject<string>();
  handleMouseEnter = () => this.subject.next('enter');
  handleMouseLeave = () => this.subject.next('leave');

  readonly remainingTime$: Observable<number>;

  constructor(readonly duration: number) {
    const hover$ = merge(this.subject.pipe(op.map((s) => s === 'enter'))).pipe(op.startWith(false));

    const timeDelta$ = animationFrames().pipe(
      op.pairwise(),
      op.map(([{ timestamp: prev }, { timestamp: next }]) => next - prev),
    );

    this.remainingTime$ = isFiniteDuration(duration)
      ? timeDelta$.pipe(
          op.withLatestFrom(ToastHoverHelper.windowFocus$, hover$),
          op.scan((acc, [delta, windowFocus, hover]) => {
            return acc - (windowFocus && !hover ? delta : 0);
          }, duration),
          op.distinctUntilChanged(),
          op.takeWhile((remaining) => remaining > 0, true),
        )
      : of(Infinity);
  }
}

export class Toast extends React.Component<ToastProps, ToastState> {
  private subscription = new Subscription();
  private mergeRefs = memoizeOne(mergeRefs);
  private ref = React.createRef<HTMLDivElement>();
  private shrinkingRef = React.createRef<HTMLDivElement>();
  private remaining: number;

  private hoverHelper: ToastHoverHelper;

  constructor(props: Readonly<ToastProps>) {
    super(props);

    this.state = {
      shrinking: false,
    };

    this.remaining = isFiniteDuration(props.item.duration) ? props.item.duration : Infinity;
    this.hoverHelper = new ToastHoverHelper(props.item.duration);
  }

  // 这里随便写个初始值即可，在实际使用之前会更新为正确的值
  private shrinkingStyle = {
    height: 48,
    marginTop: 12,
    marginBottom: 12,
  };

  private close = () => {
    const { toaster, item } = this.props;
    toaster.close(item.key);
  };

  private clear = () => {
    const { toaster, item } = this.props;
    toaster.clear(item.key);
  };

  private beforeOverlayClose = () => {
    const element = this.ref.current;
    const computedStyle = window.getComputedStyle(element);
    const marginBottom = parseFloat(computedStyle.marginBottom);
    const marginTop = parseFloat(computedStyle.marginBottom);
    const { height } = element.getBoundingClientRect();

    this.shrinkingStyle = {
      height,
      marginTop,
      marginBottom,
    };

    const handle = setTimeout(() => {
      this.setState({ shrinking: true });
    }, 200);

    this.subscription.add(() => clearTimeout(handle));

    return {};
  };

  componentDidMount() {
    const remainSubscription = this.hoverHelper.remainingTime$.subscribe((remainingTime) => {
      if (remainingTime === Infinity || this.remaining === remainingTime) {
        return;
      }
      if (this.remaining > 0 && remainingTime <= 0) {
        this.close();
        remainSubscription.unsubscribe();
        this.remaining = 0;
        return;
      }
      this.remaining = remainingTime;
    });

    this.subscription.add(remainSubscription);
  }

  componentDidUpdate(prevProps: unknown, prevState: Readonly<ToastState>) {
    const { shrinking } = this.state;
    if (!prevState.shrinking && shrinking) {
      const disposable = startAnimate(this.shrinkingRef.current, Overlay.animations.zeroHeight, () => {
        this.clear();
      });
      this.subscription.add(() => disposable.dispose());
    }
  }

  componentWillUnmount() {
    this.subscription.unsubscribe();
  }

  private handleClick = (event: React.MouseEvent<HTMLDivElement>) => {
    const { item } = this.props;
    item.onClick(event);
    if (item.canCloseByClick) {
      this.close();
    }
  };

  render() {
    const { item, animation, animationDuration } = this.props;
    const { shrinking } = this.state;

    if (shrinking) {
      return <div ref={this.shrinkingRef} style={this.shrinkingStyle} className="aro-toast-shrinking" />;
    }

    return (
      <Overlay
        key={item.key}
        overlayKey={item.key}
        visible={item.visible}
        onRequestClose={this.close}
        usePortal={false}
        beforeClose={this.beforeOverlayClose}
        attachOverlayManager={false}
        animation={animation}
        animationDuration={animationDuration}
        renderChildren={({ ref }) => {
          const mergedRef = this.mergeRefs(ref, this.ref);

          if (item.renderContent != null) {
            return item.renderContent(
              {
                ref: mergedRef,
                onClick: this.handleClick,
                onMouseEnter: this.hoverHelper.handleMouseEnter,
                onMouseLeave: this.hoverHelper.handleMouseLeave,
              },
              { close: this.close },
            );
          }

          return (
            <div
              className={cx('aro-toast', {
                'aro-toast-clickable': item.canCloseByClick,
              })}
              ref={mergedRef}
              onClick={this.handleClick}
              onMouseEnter={this.hoverHelper.handleMouseEnter}
              onMouseLeave={this.hoverHelper.handleMouseLeave}
            >
              {item.content}
            </div>
          );
        }}
      />
    );
  }
}
