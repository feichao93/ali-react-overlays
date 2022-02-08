import { PopupPlacement, Tooltip } from 'ali-react-overlays';
import * as React from 'react';
import { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';

export default { title: 'overlays / Tooltip' };

export function Basic() {
  return (
    <Tooltip
      title={
        <>
          最近工作：高级经理｜招商银行丨杭州分行｜2009-07-01 至今
          <br />
          工作职责：巴拉巴拉小魔仙
          <br />
          联系方式：67676767｜1212121@163.con
        </>
      }
    >
      <span style={{ border: '1px solid currentColor', padding: 4, cursor: 'default' }}>鼠标悬停查看详情</span>
    </Tooltip>
  );
}

const ButtonGrid = styled.div`
  margin: 100px;
  display: grid;
  grid: repeat(5, 40px) / repeat(5, auto);
  gap: 8px;
  justify-content: center;
  align-items: center;
`;

export function Placements() {
  const renderButtons = (
    placements: PopupPlacement[],
    getStyle: (index: number) => { gridRow: number; gridColumn: number },
  ) => {
    return placements.map((placement, index) => (
      <Tooltip
        key={placement}
        flip={false}
        renderTarget={(targetProps) => (
          <button {...targetProps} style={getStyle(index)}>
            {placement}
          </button>
        )}
        placement={placement}
        title={<div style={{ width: 150, height: 60 }}>tooltip content</div>}
      />
    ));
  };

  return (
    <ButtonGrid>
      {renderButtons(['top-end', 'top', 'top-start'], (index) => ({
        gridRow: 1,
        gridColumn: index + 2,
      }))}

      {renderButtons(['left-end', 'left', 'left-start'], (index) => ({
        gridColumn: 1,
        gridRow: index + 2,
      }))}

      {renderButtons(['right-end', 'right', 'right-start'], (index) => ({
        gridColumn: 5,
        gridRow: index + 2,
      }))}

      {renderButtons(['bottom-end', 'bottom', 'bottom-start'], (index) => ({
        gridRow: 5,
        gridColumn: index + 2,
      }))}
    </ButtonGrid>
  );
}

export function Controlled() {
  const [visible, setVisible] = useState(false);

  return (
    <Tooltip
      visible={visible}
      interactionKind="click"
      onRequestClose={() => setVisible(false)}
      title={<div style={{ width: 200, height: 100 }}>tooltip content</div>}
    >
      <button onClick={() => setVisible(!visible)}>点击弹出提示信息</button>
    </Tooltip>
  );
}

export function Dark() {
  return (
    <Tooltip
      // 可以将这些样式放到 .aro-tooltip.dark 中，然后用 className="dark" 来表示
      style={
        {
          background: '#333',
          color: 'white',
          '--aro-popup-arrow-color': '#333',
        } as any
      }
      title={
        <>
          最近工作：高级经理｜招商银行丨杭州分行｜2009-07-01 至今
          <br />
          工作职责：巴拉巴拉小魔仙
          <br />
          联系方式：67676767｜1212121@163.con
        </>
      }
    >
      <span style={{ border: '1px solid currentColor', padding: 4, cursor: 'default' }}>鼠标悬停查看详情</span>
    </Tooltip>
  );
}

export function AutoCloseAfterTwoSeconds() {
  const [visible, setVisible] = useState(false);
  const ref = useRef<any>();

  useEffect(() => {
    return () => {
      clearTimeout(ref.current);
    };
  }, []);

  return (
    <Tooltip
      visible={visible}
      interactionKind="click"
      placement="top-start"
      onRequestClose={() => setVisible(false)}
      onRequestOpen={() => setVisible(true)}
      onOpen={() => {
        clearTimeout(ref.current);
        ref.current = setTimeout(() => {
          setVisible(false);
        }, 1500);
      }}
      title="详细信息|详细信息|详细信息"
    >
      <button style={{ padding: 4 }}>点击查看详情</button>
    </Tooltip>
  );
}
