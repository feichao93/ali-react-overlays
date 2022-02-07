import * as React from 'react';
import { BehaviorSubject, combineLatest, merge, Observable, of, Subscription } from 'rxjs';
import * as op from 'rxjs/operators';
import { DOCUMENT_BODY } from '../context';
import { domUtils } from '../dom-utils';
import { shallowEqual } from '../utils/common';

interface InsetUpdateInstruction {
  position: 'fixed' | 'absolute';
  top?: number;
  right?: number;
  bottom?: number;
  left?: number;
}

function syncInset(
  container: HTMLElement | Window,
  target: HTMLElement,
  input$: Observable<{
    placement: PositionPlacement;
    offset: PositionOffset;
  }>,
): Observable<InsetUpdateInstruction> {
  const events$ = merge(of('init'), domUtils.fromResizeEvent(container), domUtils.fromResizeEvent(target));

  return combineLatest([events$, input$]).pipe(
    op.map(([_event, { offset, placement }]) => {
      const instruction: InsetUpdateInstruction = {
        position: domUtils.isWindow(container) ? 'fixed' : 'absolute',
      };
      const targetRect = domUtils.getRelativeLayoutRect(container, target);
      const selfRect = domUtils.getRelativeLayoutRect(container, container);

      const xx = (selfRect.right - selfRect.left) / 2 - (targetRect.right - targetRect.left) / 2;
      const yy = (selfRect.bottom - selfRect.top) / 2 - (targetRect.bottom - targetRect.top) / 2;
      const xx2 = xx * 2;
      const yy2 = yy * 2;

      if (placement === 'center') {
        instruction.left = xx + offset[0];
        instruction.top = yy + offset[1];
      } else if (placement === 'top-left') {
        instruction.left = offset[0];
        instruction.top = offset[1];
      } else if (placement === 'top') {
        instruction.left = xx + offset[0];
        instruction.top = offset[1];
      } else if (placement === 'top-right') {
        instruction.left = xx2 + offset[0];
        instruction.top = offset[1];
      } else if (placement === 'left') {
        instruction.left = offset[0];
        instruction.top = yy + offset[1];
      } else if (placement === 'right') {
        instruction.left = xx2 + offset[0];
        instruction.top = yy + offset[1];
      } else if (placement === 'bottom-left') {
        instruction.left = offset[0];
        instruction.top = yy2 + offset[1];
      } else if (placement === 'bottom') {
        instruction.left = xx + offset[0];
        instruction.top = yy2 + offset[1];
      } else if (placement === 'bottom-right') {
        instruction.left = xx2 + offset[0];
        instruction.top = yy2 + offset[1];
      } else {
        throw new Error(`[ali-react-overlays] <Position placement=${placement} /> 无效的 placement`);
      }
      return instruction;
    }),
  );
}

export type PositionPlacement =
  | 'top-left'
  | 'top'
  | 'top-right'
  | 'left'
  | 'center'
  | 'right'
  | 'bottom-left'
  | 'bottom'
  | 'bottom-right';
export type PositionOffset = [offsetX: number, offsetY: number];

export interface PositionProps {
  container: HTMLElement | typeof DOCUMENT_BODY;
  children(ref: React.RefObject<HTMLElement>): React.ReactNode;
  placement: PositionPlacement;
  offset?: PositionOffset;
}

/**
 * 定位组件，根据 placement/offset 将 target 放置在 container 内部的指定位置。
 *
 * ```
 *  <Position container={container} placement="center">{target}</Position>：
 *
 *  ┌──────────┐
 *  │          │ <┄┄┄ container
 *  │          │
 *  │   ╔══╗ <┄┄┄┄┄┄┄ target
 *  │   ╚══╝   │
 *  │          │
 *  │          │
 *  └──────────┘
 * ```
 * */
export class Position extends React.Component<PositionProps> {
  static defaultProps = {
    offset: [0, 0],
  };

  private subscription: Subscription;
  private targetRef = React.createRef<HTMLElement>();
  private props$ = new BehaviorSubject<PositionProps>(this.props);

  componentDidUpdate() {
    this.props$.next(this.props);
  }

  componentDidMount() {
    const instructionWithTarget$ = this.props$.pipe(
      op.map((props) => {
        let container: Window | HTMLElement | typeof DOCUMENT_BODY = props.container ?? document.body;
        if (container === DOCUMENT_BODY || domUtils.isBody(container)) {
          container = window;
        }
        const target = this.targetRef.current;
        return { container, target };
      }),
      op.distinctUntilChanged(shallowEqual),
      op.switchMap(({ target, container }) => {
        return syncInset(
          container,
          target,
          this.props$.pipe(
            op.map((props) => ({ offset: props.offset, placement: props.placement })),
            op.distinctUntilChanged(shallowEqual),
          ),
        ).pipe(op.map((instruction) => ({ target, instruction })));
      }),
    );

    this.subscription = instructionWithTarget$.subscribe(({ target, instruction }) => {
      target.style.position = instruction.position;
      for (const key of ['top', 'right', 'bottom', 'left'] as const) {
        if (instruction[key] == null) {
          target.style[key] = '';
        } else {
          target.style[key] = `${instruction[key]}px`;
        }
      }
    });
  }

  componentWillUnmount() {
    this.props$.complete();
    this.subscription.unsubscribe();
  }

  render() {
    return this.props.children(this.targetRef);
  }
}
