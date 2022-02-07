import { useRef } from 'react';

/**
 * 合并多个事件的回调函数
 * 该函数会忽略参数中的空值
 */
export function composeHandlers<ARGS extends any[]>(...fns: ((...args: ARGS) => void)[]) {
  return (...arg: ARGS) => {
    for (const fn of fns) {
      fn?.(...arg);
    }
  };
}

type ReactRef<T> = React.Ref<T> | React.RefObject<T> | React.MutableRefObject<T>;

/**
 * Assigns a value to a ref function or object
 *
 * @param ref the ref to assign to
 * @param value the value
 */
export function assignRef<T = any>(ref: ReactRef<T>, value: T) {
  if (ref == null) return;

  if (typeof ref === 'function') {
    ref(value);
    return;
  }

  try {
    (ref as React.MutableRefObject<T>).current = value;
  } catch (error) {
    throw new Error(`Cannot assign value '${value}' to ref '${ref}'`);
  }
}

/**
 * Combine multiple React refs into a single ref function.
 * This is used mostly when you need to allow consumers forward refs to
 * internal components
 *
 * @param refs refs to assign to value to
 */
export function mergeRefs<T>(...refs: ReactRef<T>[]): React.RefCallback<T> {
  return (value: T) => {
    refs.forEach((ref) => assignRef(ref, value));
  };
}

/**
 * Performs equality by iterating through keys on an object and returning false
 * when any key has values which are not strictly equal between the arguments.
 * Returns true when the values of all keys are strictly equal.
 *
 * 这个函数是从 facebook 某个官方库中复制过来的
 */
export function shallowEqual<T>(objA: T, objB: T): boolean {
  const hasOwnProperty = Object.prototype.hasOwnProperty;

  if (Object.is(objA, objB)) {
    return true;
  }

  if (typeof objA !== 'object' || objA === null || typeof objB !== 'object' || objB === null) {
    return false;
  }

  const keysA = Object.keys(objA);
  const keysB = Object.keys(objB);

  if (keysA.length !== keysB.length) {
    return false;
  }

  // Test for A's keys different from B.
  for (let i = 0; i < keysA.length; i++) {
    if (!hasOwnProperty.call(objB, keysA[i]) || !Object.is((objA as any)[keysA[i]], (objB as any)[keysA[i]])) {
      return false;
    }
  }

  return true;
}

/**
 * 返回一个带缓存的 mergeRefs 函数
 * */
export function useMemoizedMergeRefs() {
  const lastInvocationRef = useRef({
    args: [] as ReactRef<unknown>[],
    result: null as React.RefCallback<unknown>,
  });

  return function memoizedMergeRefs<T>(...refs: ReactRef<T>[]): React.RefCallback<T> {
    const lastInvocation = lastInvocationRef.current;
    if (shallowEqual(lastInvocation.args, refs)) {
      return lastInvocation.result;
    }

    const result = mergeRefs(...refs);
    lastInvocationRef.current = { args: refs, result };

    return result;
  };
}
