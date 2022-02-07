import { Affix } from 'ali-react-overlays';
import * as _ from 'lodash-es';
import * as React from 'react';
import styled from 'styled-components';

export default { title: 'Affix' };

const StyledDiv = styled.div`
  width: 100%;
  padding: 10px;
  font-size: 12px;
  background: var(--aro-gray-10);
`;

function BalaBala({ text }: { text?: string }) {
  return (
    <StyledDiv>
      <p style={{ margin: 0, fontSize: 20 }}>
        <code>{text}</code>
      </p>
      吸附内容.111
      <br />
      吸附内容.222
      <br />
      吸附内容.333
    </StyledDiv>
  );
}

const repeat = (txt: string, n: number) => {
  return _.range(n).map((i) => (
    <p key={i} style={{ fontSize: 20, padding: 16, margin: 0 }}>
      {txt} {i}
    </p>
  ));
};

export function BasicAffixTop() {
  return (
    <div>
      {repeat('TOP CONTENT', 3)}

      <div style={{ display: 'flex' }}>
        <div style={{ flex: '0 0 70%', background: '#f2f2f2' }}>{repeat('LONG CONTENT', 50)}</div>
        <div style={{ flex: '0 0 30%', background: '#ffebeb' }}>
          <Affix offsetTop={10}>
            <BalaBala text="offsetTop=10" />
          </Affix>
        </div>
      </div>
    </div>
  );
}

export function BasicAffixBottom() {
  return (
    <div>
      {repeat('TOP CONTENT', 3)}

      <div style={{ display: 'flex' }}>
        <div style={{ flex: '0 0 70%', background: '#f2f2f2' }}>{repeat('LONG CONTENT', 20)}</div>
        <div style={{ flex: '0 0 30%', background: '#ffebeb', display: 'flex', alignItems: 'flex-end' }}>
          <Affix offsetBottom={20}>
            <BalaBala text="offsetBottom={20}" />
          </Affix>
        </div>
      </div>

      <div style={{ flex: '0 0 70%', background: '#b3b1f1' }}>{repeat('BOTTOM CONTENT', 20)}</div>
    </div>
  );
}

export function AffixTopInContainer() {
  return (
    <div>
      {repeat('OUTER TOP CONTENT', 5)}

      <div style={{ height: 400, overflow: 'auto', background: '#d9e6ff' }}>
        <div style={{ height: 100, background: '#d2fcc9' }} />

        <Affix offsetTop={10}>
          <BalaBala text="offsetTop={10}" />
        </Affix>

        <div style={{ height: 600, background: '#fcc9fb' }} />
      </div>

      {repeat('OUTER BOTTOM CONTENT', 15)}
    </div>
  );
}

export function AffixBottomInContainer() {
  return (
    <div>
      {repeat('OUTER TOP CONTENT', 5)}

      <div style={{ height: 400, overflow: 'auto', background: '#d9e6ff' }}>
        <div style={{ height: 600, background: '#d2fcc9' }} />

        <Affix offsetBottom={10}>
          <BalaBala text="offsetBottom={10}" />
        </Affix>

        <div style={{ height: 400, background: '#fcc9fb' }} />
      </div>

      {repeat('OUTER BOTTOM CONTENT', 15)}
    </div>
  );
}

export function AffixDocExample() {
  return (
    <div style={{ display: 'flex' }}>
      <div style={{ flex: '0 0 70%', background: '#f2f2f2', height: 400 }} />
      <div style={{ flex: '0 0 30%', background: '#ffebeb' }}>
        <Affix offsetTop={40} style={{ zIndex: 1000 }}>
          <BalaBala text="offsetTop={40}" />
        </Affix>
      </div>
    </div>
  );
}

export function AffixDocExample2() {
  return (
    <div style={{ display: 'flex' }}>
      <div style={{ flex: '0 0 70%', background: '#f2f2f2', height: 400 }} />
      <div style={{ flex: '0 0 30%', background: '#ffebeb', display: 'flex', alignItems: 'flex-end' }}>
        <Affix offsetBottom={20} style={{ zIndex: 1000 }}>
          <BalaBala text="offsetBottom={20}" />
        </Affix>
      </div>
    </div>
  );
}

export function AffixDocExample3() {
  const jpg5050Repeat = 'url("https://img.alicdn.com/tfs/TB1AbJXSpXXXXXJXpXXXXXXXXXX-32-32.jpg") 50% 50% repeat';

  return (
    <div>
      <div style={{ height: 400, overflow: 'auto' }}>
        <div style={{ height: 100, background: jpg5050Repeat }} />

        <Affix offsetTop={10}>
          <BalaBala text="offsetTop={10}" />
        </Affix>

        <div style={{ height: 1000, background: jpg5050Repeat }} />
      </div>
    </div>
  );
}
