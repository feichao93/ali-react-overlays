import * as React from 'react';
import { composeHandlers } from '../utils/common';
import { RenderContainer } from '../utils/render-containers';
import { Dialog, DialogProps } from './dialog';

type QuickDialogInstance = {
  close(): void;
};

export function showDialog(
  config: DialogProps,
  containerFactory: () => RenderContainer,
  instMap: Map<string, QuickDialogInstance>,
) {
  const container = containerFactory();

  if (container.underlyingElement != null) {
    container.underlyingElement.dataset.aroDialogQuickTools = 'true';
  }

  function rerender(visible: boolean) {
    container.render(
      <Dialog
        visible={visible}
        onRequestClose={() => rerender(false)}
        {...config}
        afterClose={composeHandlers(config.afterClose, () => {
          instMap.delete(container.key);
          container.unmount();
        })}
      />,
    );
  }

  rerender(true);

  const instance = {
    close() {
      rerender(false);
    },
  };

  instMap.set(container.key, instance);

  return container.key;
}

export function makeDialogQuickTools(containerFactory: () => RenderContainer) {
  const instMap = new Map<string, QuickDialogInstance>();

  const close = (key: string) => {
    instMap.get(key)?.close();
  };

  return {
    closeAll() {
      const copy = new Map(instMap);
      instMap.clear();
      for (const inst of copy.values()) {
        inst.close();
      }
    },
    show(config: DialogProps) {
      return showDialog(config, containerFactory, instMap);
    },
    close,
    alert(config: DialogProps) {
      return new Promise<true>((resolve) => {
        const dialogKey = showDialog(
          {
            ...config,
            footer: (
              <div>
                <button
                  data-action="confirm"
                  onClick={() => {
                    close(dialogKey);
                    resolve(true);
                  }}
                >
                  确认
                </button>
              </div>
            ),
          },
          containerFactory,
          instMap,
        );
      });
    },
    confirm(config: DialogProps) {
      return new Promise<boolean>((resolve) => {
        const dialogKey = showDialog(
          {
            ...config,
            footer: (
              <div>
                <button
                  data-action="cancel"
                  onClick={() => {
                    close(dialogKey);
                    resolve(false);
                  }}
                >
                  取消
                </button>
                <button
                  data-action="confirm"
                  onClick={() => {
                    close(dialogKey);
                    resolve(true);
                  }}
                >
                  确认
                </button>
              </div>
            ),
          },
          containerFactory,
          instMap,
        );
      });
    },
  };
}
