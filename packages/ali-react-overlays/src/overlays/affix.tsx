import cx from 'classnames';
import * as React from 'react';
import { BehaviorSubject, combineLatest, EMPTY, merge, of, Subscription } from 'rxjs';
import * as op from 'rxjs/operators';
import { domUtils } from '../dom-utils';
import { shallowEqual } from '../utils/common';

interface AffixInternalState {
  mode: 'none' | 'top' | 'bottom';
  dy: number;
}

export interface AffixProps {
  /** 指定吸附至滚动容器顶部的偏移量 */
  offsetTop?: number;

  /** 指定吸附至滚动容器底部的偏移量 */
  offsetBottom?: number;

  /** 是否启用 JS 进行定位 */
  useJS?: boolean;

  children?: React.ReactNode;
  style?: React.CSSProperties;
  className?: string;
}

export class Affix extends React.Component<AffixProps> {
  private props$ = new BehaviorSubject<AffixProps>(this.props);
  private subscription: Subscription;
  readonly targetRef = React.createRef<HTMLElement>();

  static defaultProps = {
    useJS: false,
  };

  componentDidMount() {
    const instruction$ = this.props$.pipe(
      op.map(({ useJS }) => {
        if (!useJS) {
          return null;
        }
        const target = this.targetRef.current;
        const container = domUtils.listScrollParents(target)[0] as HTMLElement | Window;
        return { container, target };
      }),
      op.distinctUntilChanged(shallowEqual),
      op.switchMap((elements) => {
        if (elements == null) {
          return EMPTY;
        }

        const { target, container } = elements;

        const events$ = merge(
          of('init'),
          ...(domUtils.listScrollParents(target) as Array<HTMLElement | Window>)
            // domUtils.listScrollParents 得到的最后一个元素总是为 visualViewport，这里我们不需要该元素
            .slice(0, -1)
            .map((scrollParent) => domUtils.fromPassiveScrollEvent(scrollParent)),
        );

        const config$ = this.props$.pipe(
          op.map((props) => ({ offsetTop: props.offsetTop, offsetBottom: props.offsetBottom })),
          op.distinctUntilChanged(shallowEqual),
        );

        const state: AffixInternalState = { mode: 'none', dy: 0 };

        return combineLatest([events$, config$]).pipe(
          op.tap(([_event, { offsetTop, offsetBottom }]) => {
            const targetRect = domUtils.getBoundingClientRect(target);
            const containerRect = domUtils.getBoundingClientRect(container);
            const actualOffsetTop = targetRect.top - containerRect.top;
            const actualOffsetBottom = containerRect.top + containerRect.height - (targetRect.top + targetRect.height);

            if (offsetTop != null) {
              if (state.mode === 'none' && actualOffsetTop < offsetTop) {
                state.mode = 'top';
                state.dy = offsetTop - actualOffsetTop;
                target.style.transform = `translate3d(0, ${state.dy}px, 0)`;
              } else if (state.mode === 'top' && actualOffsetTop !== offsetTop) {
                state.dy += offsetTop - actualOffsetTop;
                if (state.dy < 0) {
                  // top --> none
                  state.mode = 'none';
                  target.style.transform = '';
                } else {
                  // re-affix
                  target.style.transform = `translate3d(0, ${state.dy}px, 0)`;
                }
              }
            } else if (offsetBottom != null) {
              if (state.mode === 'none' && actualOffsetBottom < offsetBottom) {
                // none --> bottom
                state.mode = 'bottom';
                state.dy = actualOffsetBottom - offsetBottom;
                target.style.transform = `translate3d(0, ${state.dy}px, 0)`;
              } else if (state.mode === 'bottom' && actualOffsetBottom !== offsetBottom) {
                state.dy += actualOffsetBottom - offsetBottom;
                if (state.dy > 0) {
                  // bottom --> none
                  state.mode = 'none';
                  target.style.transform = '';
                } else {
                  // re-affix
                  target.style.transform = `translate3d(0, ${state.dy}px, 0)`;
                }
              }
            }
          }),
        );
      }),
    );

    this.subscription = instruction$.subscribe(/* 逻辑放在了 tap 中，这里进行空订阅即可 */);
  }

  componentDidUpdate() {
    this.props$.next(this.props);
  }

  componentWillUnmount() {
    this.props$.complete();
    this.subscription.unsubscribe();
  }

  render() {
    const { children, style, className, offsetTop, offsetBottom, useJS } = this.props;
    const cssStickyStyle: React.CSSProperties = useJS
      ? null
      : { position: 'sticky', top: offsetTop, bottom: offsetBottom };

    return (
      <div
        ref={this.targetRef as React.RefObject<HTMLDivElement>}
        className={cx('aro-affix', className)}
        style={{ ...cssStickyStyle, ...style }}
      >
        {children}
      </div>
    );
  }
}
