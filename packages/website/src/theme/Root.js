import * as React from 'react';
import { StyleSheetManager } from 'styled-components';

export default function Root({ children }) {
  return (
    <StyleSheetManager disableVendorPrefixes={process.env.NODE_ENV !== 'production'}>
      <>{children}</>
    </StyleSheetManager>
  );
}
