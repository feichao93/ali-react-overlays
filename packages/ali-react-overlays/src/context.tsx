import * as React from 'react';
import { useContext, useMemo } from 'react';

/** @public */
export const DOCUMENT_BODY = 'DOCUMENT_BODY' as const;

/** @public */
export interface OverlayBehaviorContextType {
  portalContainer: HTMLElement | typeof DOCUMENT_BODY;
  classNamePrefix: string;
}

/** @public */
export const OverlayBehaviorContext = React.createContext<OverlayBehaviorContextType>({
  // portalContainer 默认为 document.body
  // 但这里我们不直接写 document.body，而是用 DOCUMENT_BODY 来进行表示
  // 避免过早读取 DOM API 导致 SSR 报错
  portalContainer: DOCUMENT_BODY,
  classNamePrefix: 'aro-',
});

/** @public */
export function useOverlayBehavior() {
  return useContext(OverlayBehaviorContext);
}

/** @public */
export function OverlayBehaviorProvider({ children, ...rest }: OverlayBehaviorContextType & { children: any }) {
  const value = useMemo(() => rest, [rest.classNamePrefix, rest.portalContainer]);

  return <OverlayBehaviorContext.Provider value={value}>{children}</OverlayBehaviorContext.Provider>;
}
