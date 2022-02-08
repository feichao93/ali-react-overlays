import { Placement } from '@popperjs/core';
import { Popup } from 'ali-react-overlays';
import * as React from 'react';
import { useState } from 'react';
import styled from 'styled-components';

export default { title: 'overlays / Popup' };

const ShadowedDiv = styled.div.attrs({ className: 'aro-panel' })`
  min-width: 300px;
  min-height: 100px;
  padding: 10px;
`;

function SomeText() {
  return (
    <>
      最近工作：高级经理｜招商银行丨杭州分行｜2009-07-01 至今
      <br />
      工作职责：巴拉巴拉小魔仙
      <br />
      联系方式：67676767｜1212121@163.con
      <br />
      教育经理：北京大学｜工商管理｜2007-09-01 至 2006-06-01
      <br />
      中央财经大学｜2004-09-01 至 2007-06-01
    </>
  );
}

export function Basic() {
  return (
    <Popup target={<button>点击查看详情</button>}>
      {/* .aro-panel 提供了最基本的浮层样式 */}
      <div className="aro-panel" style={{ padding: 12 }}>
        <SomeText />
      </div>
    </Popup>
  );
}

export function Controlled() {
  const [visible, setVisible] = useState(false);

  const onClose = () => {
    setVisible(false);
  };

  return (
    <Popup
      target={<button onClick={() => setVisible(true)}>点击查看详情</button>}
      visible={visible}
      onRequestClose={onClose}
    >
      <div className="aro-panel" style={{ padding: 8 }}>
        <button onClick={onClose}>手动关闭</button>
        <p>
          <SomeText />
        </p>
      </div>
    </Popup>
  );
}

export function InteractionKind() {
  return (
    <div>
      <Popup
        interactionKind="hover-target"
        target={
          <button>
            <code>hover-target</code>
          </button>
        }
      >
        <div className="aro-panel" style={{ padding: 8 }}>
          <SomeText />
        </div>
      </Popup>
      <Popup
        interactionKind="hover"
        target={
          <button>
            <code>hover</code>
          </button>
        }
      >
        <div className="aro-panel" style={{ padding: 8 }}>
          <SomeText />
        </div>
      </Popup>
      <Popup
        interactionKind="hover"
        canOpenByFocus
        canCloseByBlur
        target={
          <button>
            <code>hover & focus & blur</code>
          </button>
        }
      >
        <div className="aro-panel" style={{ padding: 8 }}>
          <SomeText />
        </div>
      </Popup>
      <Popup
        interactionKind="click"
        target={
          <button>
            <code>click</code>
          </button>
        }
      >
        <div className="aro-panel" style={{ padding: 8 }}>
          <SomeText />
        </div>
      </Popup>
      <Popup
        interactionKind="click"
        canCloseByOutSideClick={false}
        target={
          <button>
            <code>{`canCloseByOutSideClick={false}`}</code>
          </button>
        }
      >
        <div className="aro-panel" style={{ padding: 8 }}>
          <SomeText />
        </div>
      </Popup>
    </div>
  );
}

export function SwitchTargetOnTheFly() {
  const [visible, setVisible] = useState(true);
  const [reference, setReference] = useState('A');

  return (
    <div>
      <div style={{ display: 'flex', gap: 16 }}>
        <button onClick={() => setVisible(!visible)}>显示/隐藏</button>
        <button onClick={() => setReference(reference === 'A' ? 'B' : 'A')}>
          切换弹层参考元素（当前: {reference}）
        </button>
      </div>

      <Popup
        hasArrow
        canCloseByOutSideClick={false}
        visible={visible}
        renderTarget={({ ref }) => (
          <div style={{ display: 'flex', gap: 32, marginTop: 16 }}>
            <button ref={reference === 'A' ? ref : null}>按钮A</button>
            <button ref={reference === 'B' ? ref : null}>按钮B</button>
          </div>
        )}
      >
        <ShadowedDiv>
          <SomeText />
        </ShadowedDiv>
      </Popup>
    </div>
  );
}

const StyledButton = styled.button`
  &[data-aro-popup-open] {
    background: rgba(255, 0, 0, 0.2) !important;
  }
`;

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
    placements: Placement[],
    getStyle: (index: number) => { gridRow: number; gridColumn: number },
  ) => {
    return placements.map((placement, index) => (
      <Popup
        key={placement}
        flip={false}
        hasArrow
        renderTarget={(targetProps) => (
          <StyledButton {...targetProps} style={getStyle(index)}>
            {placement}
          </StyledButton>
        )}
        placement={placement}
        interactionKind="click"
      >
        <ShadowedDiv>
          <SomeText />
        </ShadowedDiv>
      </Popup>
    ));
  };

  return (
    <div>
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
    </div>
  );
}

export function PopupInScrollContainer() {
  return (
    <div
      style={{
        height: 300,
        width: 600,
        marginLeft: 100,
        marginTop: 100,
        border: '1px solid #ccc',
        overflow: 'scroll',
      }}
    >
      <div
        style={{
          height: 600,
          padding: '200px 0 0 180px',
          position: 'relative',
        }}
      >
        <Popup usePortal={false} target={<button>click me</button>}>
          <ShadowedDiv>
            <SomeText />
          </ShadowedDiv>
        </Popup>
      </div>
    </div>
  );
}

export function SimplifiedDOMStructure() {
  return (
    <Popup
      renderTarget={(args) => (
        <button ref={args.ref} onClick={args.onClick}>
          点击触发弹层
        </button>
      )}
      renderChildren={({ ref }) => (
        <div
          ref={ref as React.RefObject<HTMLDivElement>}
          style={{
            padding: 8,
            width: 300,
            border: '1px solid var(--aro-gray-30)',
            color: 'var(--aro-gray-90)',
          }}
        >
          通过 render callback 的调用形式，可以精简弹层的 DOM 层级
        </div>
      )}
    />
  );
}

export function Nested() {
  return (
    <Popup target={<button>查看详情</button>}>
      <ShadowedDiv>
        <p>
          最近工作：高级经理｜招商银行丨杭州分行｜2009-07-01 至今
          <br />
          工作职责：巴拉巴拉小魔仙
          <br />
          联系方式：67676767｜1212121@163.con
          <br />
        </p>
        <Popup target={<button>查看教育经历</button>}>
          <ShadowedDiv>
            1. 北京大学｜工商管理｜2007-09-01 至 2006-06-01
            <br />
            2. 中央财经大学｜2004-09-01 至 2007-06-01
          </ShadowedDiv>
        </Popup>
      </ShadowedDiv>
    </Popup>
  );
}

export function NestedPopupInTallPage() {
  return (
    <div>
      <div>tips: 按钮在页面下方，往下滚一段吧</div>
      <div style={{ height: '150vh' }} />

      <Popup target={<button>打开外层弹框</button>}>
        <div style={{ padding: 8, width: 300, border: '1px solid #ccc' }}>
          <h1>外层弹框内容 </h1>

          <Popup target={<button style={{ marginLeft: 50 }}>打开内层弹框</button>} placement="right-start">
            <div style={{ padding: 8, width: 300, border: '1px solid #ccc' }}>
              <h1>内层弹框 </h1>
              <div style={{ height: 250, background: 'rgba(255, 0, 0, 0.2)' }} />
            </div>
          </Popup>
        </div>
      </Popup>

      <div style={{ height: '150vh' }} />
    </div>
  );
}

export function Arrow() {
  return (
    <Popup
      target={<button>鼠标悬停查看详情</button>}
      interactionKind="hover"
      hasArrow
      wrapperStyle={{ '--aro-popup-arrow-color': '#333' } as any}
    >
      <div style={{ color: 'white', background: '#333', padding: 12, fontSize: 14 }}>
        最近工作：高级经理｜招商银行丨杭州分行｜2009-07-01 至今
        <br />
        工作职责：巴拉巴拉小魔仙
      </div>
    </Popup>
  );
}
