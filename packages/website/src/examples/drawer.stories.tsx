import { Drawer, DrawerProps, Overlay } from 'ali-react-overlays';
import * as _ from 'lodash-es';
import { useState } from 'react';
import * as React from 'react';

export default { title: 'overlays / Drawer' };

const alibabaIntroduction =
  '阿里巴巴集团创立于1999年，是一家提供电子商务在线交易平台的中国公司，实行位于杭州与北京的双总部制度。\n' +
  '服务范围包括B2B贸易、网上零售、购物搜索引擎、第三方支付和云计算服务。';

const hippoIntroduction =
  '盒马是阿里巴巴集团旗下，以数据和技术驱动的新零售平台。盒马希望为消费者打造社区化的一站式新零售体验中心，用科技和人情味带给人们“鲜美生活”。';

export function Basic() {
  const [visible, setVisible] = useState(false);

  return (
    <div>
      <button onClick={() => setVisible(!visible)}>打开抽屉</button>

      <Drawer
        title="页面抽屉"
        visible={visible}
        onRequestClose={() => setVisible(false)}
        footer={<button onClick={() => setVisible(false)}>关闭</button>}
      >
        {hippoIntroduction}
      </Drawer>
    </div>
  );
}

export function Placements() {
  const [visible, setVisible] = useState(false);
  const [placement, setPlacement] = useState<DrawerProps['placement']>('right');

  return (
    <div>
      <div style={{ display: 'grid', grid: 'repeat(3, auto) / repeat(3, 1fr)', gap: 16 }}>
        <button
          style={{ gridRow: '1', gridColumn: '2' }}
          onClick={() => {
            setVisible(true);
            setPlacement('top');
          }}
        >
          打开抽屉 placement=top
        </button>
        <button
          style={{ gridRow: '2', gridColumn: '3' }}
          onClick={() => {
            setVisible(true);
            setPlacement('right');
          }}
        >
          打开抽屉 placement=right
        </button>
        <button
          style={{ gridRow: '3', gridColumn: '2' }}
          onClick={() => {
            setVisible(true);
            setPlacement('bottom');
          }}
        >
          打开抽屉 placement=bottom
        </button>
        <button
          style={{ gridRow: '2', gridColumn: '1' }}
          onClick={() => {
            setVisible(true);
            setPlacement('left');
          }}
        >
          打开抽屉 placement=left
        </button>
      </div>

      <Drawer
        title="盒马"
        visible={visible}
        placement={placement}
        footer={<button onClick={() => setVisible(false)}>关闭弹层</button>}
        onRequestClose={() => {
          setVisible(false);
        }}
      >
        {_.range(20).map((i) => (
          <p key={i}>{hippoIntroduction}</p>
        ))}
      </Drawer>
    </div>
  );
}

export function Nested() {
  const [visible, setVisible] = useState(false);
  const [innerVisible, setInnerVisible] = useState(false);

  return (
    <div>
      <button onClick={() => setVisible(true)}>打开抽屉</button>
      <Drawer
        title="外层抽屉标题"
        visible={visible}
        onRequestClose={() => setVisible(false)}
        style={{ width: 600 }}
        footer={<button onClick={() => setVisible(false)}>关闭</button>}
      >
        <p>{alibabaIntroduction}</p>

        <button onClick={() => setInnerVisible(true)}>打开内层抽屉</button>
        <Drawer
          title="内层抽屉标题"
          visible={innerVisible}
          onRequestClose={() => setInnerVisible(false)}
          style={{ width: 400 }}
          footer={<button onClick={() => setInnerVisible(false)}>关闭</button>}
        >
          {hippoIntroduction}
        </Drawer>
      </Drawer>
    </div>
  );
}

export function Minimal() {
  const [visible, setVisible] = useState(false);

  return (
    <div>
      <button onClick={() => setVisible(true)}>打开抽屉</button>
      <Drawer
        visible={visible}
        onRequestClose={() => setVisible(false)}
        style={{ paddingRight: 16, paddingLeft: 12 }}
        renderChildren={(arg) => (
          <div className="aro-drawer" {...arg}>
            <p>{alibabaIntroduction}</p>
            <p>{alibabaIntroduction}</p>
            <p>{alibabaIntroduction}</p>
          </div>
        )}
      />
    </div>
  );
}

export function Fullscreen() {
  const [visible, setVisible] = useState(false);

  return (
    <div>
      <button onClick={() => setVisible(!visible)}>打开抽屉</button>

      <Drawer
        title="页面抽屉"
        visible={visible}
        style={{ width: '100%', maxWidth: '100%' }}
        animation={{ in: Overlay.animations.zoomIn, out: Overlay.animations.fadeOut }}
        onRequestClose={() => setVisible(false)}
        disableScroll="force"
        footer={<button onClick={() => setVisible(false)}>关闭</button>}
      >
        {hippoIntroduction}
      </Drawer>
    </div>
  );
}
