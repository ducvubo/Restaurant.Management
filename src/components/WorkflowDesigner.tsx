import { useEffect, useRef, forwardRef, useImperativeHandle, useState } from 'react';
import BpmnModeler from 'bpmn-js/lib/Modeler';
import 'bpmn-js/dist/assets/diagram-js.css';
import 'bpmn-js/dist/assets/bpmn-js.css';
import 'bpmn-js/dist/assets/bpmn-font/css/bpmn-embedded.css';
import { CustomPaletteProvider } from './bpmn/CustomPaletteProvider';
import { CustomContextPadProvider } from './bpmn/CustomContextPadProvider';
import { Drawer, Form, Input, Select, Button, Space, Spin } from 'antd';
import { DEFAULT_BPMN_XML } from '../config/workflowConstants';

export interface WorkflowDesignerHandle {
  getWorkflowXml: () => Promise<string>;
  importXml: (xml: string) => Promise<void>;
}

interface WorkflowDesignerProps {
  initialXml?: string;
  onError?: (error: string) => void;
  policies?: Array<{ id: string; name: string }>;
}

const customPaletteModule = {
  __init__: ['paletteProvider'],
  paletteProvider: ['type', CustomPaletteProvider]
};

const customContextPadModule = {
  __init__: ['customContextPadProvider'],
  customContextPadProvider: ['type', CustomContextPadProvider]
};

const WorkflowDesigner = forwardRef<WorkflowDesignerHandle, WorkflowDesignerProps>(
  ({ initialXml, onError, policies = [] }, ref) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const modelerRef = useRef<BpmnModeler | null>(null);

    // Properties drawer states
    const [isTaskDrawerOpen, setIsTaskDrawerOpen] = useState(false);
    const [isFlowDrawerOpen, setIsFlowDrawerOpen] = useState(false);
    const [currentElement, setCurrentElement] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [taskForm] = Form.useForm();
    const [flowForm] = Form.useForm();

    useEffect(() => {
      if (!containerRef.current) return;

      // Initialize BPMN Modeler with custom modules
      const modeler = new BpmnModeler({
        container: containerRef.current,
        keyboard: {
          bindTo: document,
        },
        additionalModules: [
          customPaletteModule,
          customContextPadModule
        ]
      });

      modelerRef.current = modeler;

      // Load initial XML or create new diagram
      const xmlToLoad = initialXml || DEFAULT_BPMN_XML;

      modeler.importXML(xmlToLoad).then(() => {
        const canvas: any = modeler.get('canvas');
        assignInitialStepNumbers(modeler);
        setTimeout(() => {
          try {
            canvas.zoom('fit-viewport');
          } catch (err) {
            console.warn('Cannot zoom:', err);
          }
          setLoading(false);
        }, 100);
        updateOverlays(modeler);
      }).catch((err) => {
        console.error('Error importing BPMN XML:', err);
        setLoading(false);
      });

      // Listen to double-click events
      const eventBus: any = modeler.get('eventBus');
      eventBus.on('element.dblclick', (event: any) => {
        const element = event.element;
        if (!element) return;

        if (element.type === 'bpmn:Task') {
          openTaskDrawer(element);
        } else if (element.type === 'bpmn:SequenceFlow') {
          const source = element.source;
          if (source && source.type.includes('Gateway')) {
            openFlowDrawer(element);
          }
        }
      });

      // Listen to element creation
      eventBus.on('create.end', (event: any) => {
        const element = event.context.shape;
        if (element && element.type === 'bpmn:Task') {
          const modeling: any = modeler.get('modeling');
          const elementRegistry: any = modeler.get('elementRegistry');

          let maxStep = 0;
          elementRegistry
            .filter((el: any) => el.type === 'bpmn:Task' && el.id !== element.id)
            .forEach((task: any) => {
              const step = parseInt(task.businessObject.get('stepNumber')) || 0;
              if (step > maxStep) {
                maxStep = step;
              }
            });

          const newStepNumber = maxStep + 1;
          modeling.updateProperties(element, {
            'stepNumber': newStepNumber,
            'name': `Bước ${newStepNumber}`
          });

          setTimeout(() => updateOverlays(modeler), 0);
        }
      });

      // Listen to connection creation
      eventBus.on('connect.end', (event: any) => {
        const element = event.context.connection;
        const modeling: any = modeler.get('modeling');

        if (element && element.type === 'bpmn:SequenceFlow' && element.source) {
          const sourceElement = element.source;
          if (sourceElement.type.includes('Gateway')) {
            modeling.updateProperties(element, {
              'action': 'yes',
              'name': 'Có'
            });
          }
        }
      });

      // Cleanup
      return () => {
        modeler.destroy();
      };
    }, []);

    // Load initial XML when it changes
    useEffect(() => {
      if (initialXml && modelerRef.current) {
        modelerRef.current.importXML(initialXml).catch((err) => {
          console.error('Error loading XML:', err);
          if (onError) {
            onError('Không thể tải BPMN XML');
          }
        });
      }
    }, [initialXml, onError]);

    // Expose methods to parent component
    useImperativeHandle(ref, () => ({
      getWorkflowXml: async (): Promise<string> => {
        if (!modelerRef.current) {
          throw new Error('Modeler chưa được khởi tạo');
        }

        try {
          const result = await modelerRef.current.saveXML({ format: true });
          return result.xml || '';
        } catch (err) {
          console.error('Error saving XML:', err);
          throw new Error('Không thể lưu BPMN XML');
        }
      },

      importXml: async (xml: string): Promise<void> => {
        if (!modelerRef.current) {
          throw new Error('Modeler chưa được khởi tạo');
        }

        try {
          setLoading(true);
          await modelerRef.current.importXML(xml);
          const canvas: any = modelerRef.current.get('canvas');
          assignInitialStepNumbers(modelerRef.current);
          setTimeout(() => {
            try {
              canvas.zoom('fit-viewport');
            } catch (err) {
              console.warn('Cannot zoom:', err);
            }
            setLoading(false);
          }, 100);
          updateOverlays(modelerRef.current);
        } catch (err) {
          console.error('Error importing XML:', err);
          setLoading(false);
          throw new Error('Không thể import BPMN XML');
        }
      },
    }));

    // Helper functions
    const assignInitialStepNumbers = (modeler: BpmnModeler) => {
      const modeling: any = modeler.get('modeling');
      const elementRegistry: any = modeler.get('elementRegistry');
      const tasks = elementRegistry.filter((el: any) => el.type === 'bpmn:Task');

      let maxStep = 0;
      tasks.forEach((task: any) => {
        const step = parseInt(task.businessObject.get('stepNumber')) || 0;
        if (step > maxStep) {
          maxStep = step;
        }
      });

      tasks.forEach((task: any) => {
        const currentStep = parseInt(task.businessObject.get('stepNumber')) || 0;
        if (currentStep === 0) {
          maxStep++;
          modeling.updateProperties(task, {
            'stepNumber': maxStep,
            'name': task.businessObject.name || `Bước ${maxStep}`
          });
        }
      });
    };

    const updateOverlays = (modeler: BpmnModeler) => {
      const elementRegistry: any = modeler.get('elementRegistry');
      const overlays: any = modeler.get('overlays');
      const modeling: any = modeler.get('modeling');

      overlays.clear();

      const allElements = elementRegistry.getAll();
      allElements.forEach((element: any) => {
        if (element && element.type === 'bpmn:Task') {
          const businessObject = element.businessObject;
          const name = businessObject.name || '';

          // Measure text size
          const textSize = measureMultilineText(name);
          const padding = 40;
          let newWidth = textSize.width + padding;
          let newHeight = textSize.height + padding;

          newWidth = Math.max(newWidth, 100);
          newHeight = Math.max(newHeight, 80);

          if (element.width !== newWidth || element.height !== newHeight) {
            modeling.resizeShape(element, {
              x: element.x + (element.width - newWidth) / 2,
              y: element.y + (element.height - newHeight) / 2,
              width: newWidth,
              height: newHeight
            });
          }

          const stepNumber = parseInt(businessObject.get('stepNumber')) || 0;
          if (stepNumber > 0) {
            overlays.add(element.id, {
              position: {
                top: 3,
                left: 3
              },
              html: `<div style="font-size: 10px;background: #000e07;padding: 0px 4px;border-radius: 10px;color: #fff;">${stepNumber}</div>`
            });
          }
        }
      });
    };

    const measureMultilineText = (text: string, fontSize = 12, fontFamily = 'Arial'): { width: number, height: number } => {
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      if (!context) {
        return { width: 0, height: 0 };
      }

      context.font = `${fontSize}px ${fontFamily}`;
      const lines = text.split('\n');
      let maxWidth = 0;
      lines.forEach(line => {
        const metrics = context.measureText(line);
        maxWidth = Math.max(maxWidth, metrics.width);
      });

      const lineHeight = fontSize * 1.2;
      const totalHeight = lineHeight * lines.length;

      return { width: maxWidth, height: totalHeight };
    };

    const openTaskDrawer = (element: any) => {
      setCurrentElement(element);
      const businessObject = element.businessObject;

      const rolesData = businessObject.get('policyId');
      let policyIds: string[] = [];
      try {
        policyIds = JSON.parse(rolesData || '[]');
        if (!Array.isArray(policyIds)) {
          policyIds = [];
        }
      } catch (e) {
        policyIds = [];
      }

      taskForm.setFieldsValue({
        name: businessObject.name || '',
        stepNumber: parseInt(businessObject.get('stepNumber')) || 0,
        policyIds: policyIds
      });

      setIsTaskDrawerOpen(true);
    };

    const openFlowDrawer = (element: any) => {
      setCurrentElement(element);
      const businessObject = element.businessObject;

      flowForm.setFieldsValue({
        action: businessObject.get('action') || 'yes'
      });

      setIsFlowDrawerOpen(true);
    };

    const saveTaskProperties = () => {
      if (!currentElement || !modelerRef.current) return;

      const values = taskForm.getFieldsValue();
      const modeling: any = modelerRef.current.get('modeling');

      modeling.updateProperties(currentElement, {
        name: values.name,
        'stepNumber': values.stepNumber,
        'policyId': JSON.stringify(values.policyIds || [])
      });

      updateOverlays(modelerRef.current);
      setIsTaskDrawerOpen(false);
      setCurrentElement(null);
    };

    const saveFlowProperties = () => {
      if (!currentElement || !modelerRef.current) return;

      const values = flowForm.getFieldsValue();
      const modeling: any = modelerRef.current.get('modeling');

      const label = values.action === 'yes' ? 'Có' : 'Không';

      modeling.updateProperties(currentElement, {
        'action': values.action,
        'name': label
      });

      setIsFlowDrawerOpen(false);
      setCurrentElement(null);
    };

    return (
      <>
        <Spin spinning={loading} tip="Đang tải BPMN Designer..." size="large">
          <div
            ref={containerRef}
            style={{
              width: '100%',
              height: '600px',
              border: '1px solid #d9d9d9',
              borderRadius: '4px',
              backgroundColor: '#fafafa',
            }}
          />
        </Spin>

        {/* Task Properties Drawer */}
        <Drawer
          title="Thuộc Tính Bước"
          placement="right"
          width={400}
          onClose={() => {
            setIsTaskDrawerOpen(false);
            setCurrentElement(null);
          }}
          open={isTaskDrawerOpen}
          extra={
            <Space>
              <Button onClick={() => {
                setIsTaskDrawerOpen(false);
                setCurrentElement(null);
              }}>
                Hủy
              </Button>
              <Button type="primary" onClick={saveTaskProperties}>
                Lưu
              </Button>
            </Space>
          }
        >
          <Form form={taskForm} layout="vertical">
            <Form.Item
              label="Tên Bước"
              name="name"
              rules={[{ required: true, message: 'Vui lòng nhập tên bước' }]}
            >
              <Input placeholder="Nhập tên bước" />
            </Form.Item>

            <Form.Item
              label="Số Thứ Tự"
              name="stepNumber"
              rules={[{ required: true, message: 'Vui lòng nhập số thứ tự' }]}
            >
              <Input type="number" placeholder="Nhập số thứ tự" />
            </Form.Item>

            <Form.Item
              label="Chọn Policy (Quyền)"
              name="policyIds"
            >
              <Select
                mode="multiple"
                placeholder="Chọn policy"
                options={policies.map(p => ({
                  value: p.id,
                  label: p.name
                }))}
                showSearch
                filterOption={(input, option) =>
                  (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                }
              />
            </Form.Item>
          </Form>
        </Drawer>

        {/* Flow Properties Drawer */}
        <Drawer
          title="Thuộc Tính Hành Động"
          placement="right"
          width={350}
          onClose={() => {
            setIsFlowDrawerOpen(false);
            setCurrentElement(null);
          }}
          open={isFlowDrawerOpen}
          extra={
            <Space>
              <Button onClick={() => {
                setIsFlowDrawerOpen(false);
                setCurrentElement(null);
              }}>
                Hủy
              </Button>
              <Button type="primary" onClick={saveFlowProperties}>
                Lưu
              </Button>
            </Space>
          }
        >
          <Form form={flowForm} layout="vertical">
            <Form.Item
              label="Hành Động"
              name="action"
              rules={[{ required: true, message: 'Vui lòng chọn hành động' }]}
            >
              <Select
                options={[
                  { value: 'yes', label: 'Có' },
                  { value: 'no', label: 'Không' }
                ]}
              />
            </Form.Item>
          </Form>
        </Drawer>
      </>
    );
  }
);

WorkflowDesigner.displayName = 'WorkflowDesigner';

export default WorkflowDesigner;
