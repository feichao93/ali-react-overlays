import React from 'react';
import * as overlays from 'ali-react-overlays';
import cx from 'clsx';
import styled from 'styled-components';

const ReactLiveScope = {
  React,
  ...React,
  styled,
  cx,
  ...overlays,
};

export default ReactLiveScope;
