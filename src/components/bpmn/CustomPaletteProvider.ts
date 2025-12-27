// Custom Palette Provider for BPMN

export class CustomPaletteProvider {
  private create: any;
  private elementFactory: any;
  private spaceTool: any;
  private lassoTool: any;
  private handTool: any;
  private globalConnect: any;
  private translate: any;
  private canvas: any;

  constructor(
    palette: any,
    create: any,
    elementFactory: any,
    spaceTool: any,
    lassoTool: any,
    handTool: any,
    globalConnect: any,
    translate: any,
    canvas: any
  ) {
    this.create = create;
    this.elementFactory = elementFactory;
    this.spaceTool = spaceTool;
    this.lassoTool = lassoTool;
    this.handTool = handTool;
    this.globalConnect = globalConnect;
    this.translate = translate;
    this.canvas = canvas;

    palette.registerProvider(this);
  }

  getPaletteEntries = () => {
    const {
      create,
      elementFactory,
      spaceTool,
      lassoTool,
      handTool,
      globalConnect,
      translate,
      canvas
    } = this;

    return {
      'zoom-in': {
        group: 'tools',
        className: 'bpmn-icon-zoom-in',
        title: translate('Phóng to'),
        action: {
          click: function () {
            const currentZoom = canvas.zoom();
            canvas.zoom(currentZoom + 0.1);
          }
        }
      },
      'zoom-out': {
        group: 'tools',
        className: 'bpmn-icon-zoom-out',
        title: translate('Thu nhỏ'),
        action: {
          click: function () {
            const currentZoom = canvas.zoom();
            const newZoom = Math.max(0.2, currentZoom - 0.1);
            canvas.zoom(newZoom);
          }
        }
      },
      'reset-zoom': {
        group: 'tools',
        className: 'bpmn-icon-zoom-reset',
        title: translate('Khung hình vừa'),
        action: {
          click: function () {
            canvas.zoom('fit-viewport');
          }
        }
      },
      'hand-tool': {
        group: 'tools',
        className: 'bpmn-icon-hand-tool',
        title: translate('Công cụ di chuyển'),
        action: {
          click: () => handTool.toggle()
        }
      },
      'lasso-tool': {
        group: 'tools',
        className: 'bpmn-icon-lasso-tool',
        title: translate('Công cụ chọn'),
        action: {
          click: () => lassoTool.toggle()
        }
      },
      'space-tool': {
        group: 'tools',
        className: 'bpmn-icon-space-tool',
        title: translate('Công cụ tạo khoảng trống'),
        action: {
          click: () => spaceTool.toggle()
        }
      },
      'separator-1': {
        group: 'tools',
        separator: true
      },
      'global-connect-tool': {
        group: 'tools',
        className: 'bpmn-icon-connection-multi',
        title: translate('Tạo hành động'),
        action: {
          click: () => globalConnect.toggle()
        }
      },
      'create.start-event': {
        group: 'event',
        className: 'bpmn-icon-start-event-none',
        title: translate('Bắt đầu'),
        action: {
          dragstart: (event: any) => {
            const shape = elementFactory.createShape({
              type: 'bpmn:StartEvent'
            });
            create.start(event, shape);
          },
          click: (event: any) => {
            const shape = elementFactory.createShape({
              type: 'bpmn:StartEvent'
            });
            create.start(event, shape);
          }
        }
      },
      'create.task': {
        group: 'activity',
        className: 'bpmn-icon-task',
        title: translate('Tạo bước'),
        action: {
          dragstart: (event: any) => {
            const shape = elementFactory.createShape({ type: 'bpmn:Task' });
            create.start(event, shape);
          },
          click: (event: any) => {
            const shape = elementFactory.createShape({ type: 'bpmn:Task' });
            create.start(event, shape);
          }
        }
      },
      'create.gateway': {
        group: 'gateway',
        className: 'bpmn-icon-gateway-none',
        title: translate('Tạo Gateway (rẽ nhánh)'),
        action: {
          dragstart: (event: any) => {
            const shape = elementFactory.createShape({
              type: 'bpmn:ExclusiveGateway'
            });
            create.start(event, shape);
          },
          click: (event: any) => {
            const shape = elementFactory.createShape({
              type: 'bpmn:ExclusiveGateway'
            });
            create.start(event, shape);
          }
        }
      },
      'create.end-event': {
        group: 'event',
        className: 'bpmn-icon-end-event-none',
        title: translate('Kết thúc'),
        action: {
          dragstart: (event: any) => {
            const shape = elementFactory.createShape({
              type: 'bpmn:EndEvent'
            });
            create.start(event, shape);
          },
          click: (event: any) => {
            const shape = elementFactory.createShape({
              type: 'bpmn:EndEvent'
            });
            create.start(event, shape);
          }
        }
      }
    };
  };
}

(CustomPaletteProvider as any).$inject = [
  'palette',
  'create',
  'elementFactory',
  'spaceTool',
  'lassoTool',
  'handTool',
  'globalConnect',
  'translate',
  'canvas'
];
