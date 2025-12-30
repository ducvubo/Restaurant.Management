import { useEffect, useRef } from 'react';
import NavigatedViewer from 'bpmn-js/lib/NavigatedViewer';
import 'bpmn-js/dist/assets/diagram-js.css';
import 'bpmn-js/dist/assets/bpmn-js.css';
import 'bpmn-js/dist/assets/bpmn-font/css/bpmn.css';

interface Props {
  xml: string;
  height?: number;
  highlightElementId?: string; // Element ID to highlight (current step)
}

/**
 * BPMN Viewer Readonly - Chỉ hiển thị, không cho chỉnh sửa
 * Có thể highlight element hiện tại
 */
const BpmnViewerReadonly: React.FC<Props> = ({ xml, height = 300, highlightElementId }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<NavigatedViewer | null>(null);

  useEffect(() => {
    if (!containerRef.current || !xml) return;

    // Cleanup old viewer
    if (viewerRef.current) {
      viewerRef.current.destroy();
    }

    // Create new viewer
    const viewer = new NavigatedViewer({
      container: containerRef.current,
    });

    viewerRef.current = viewer;

    // Import diagram
    viewer.importXML(xml).then(() => {
      // Zoom to fit
      const canvas = viewer.get('canvas') as any;
      canvas.zoom('fit-viewport');
      
      // Highlight current step if provided
      if (highlightElementId) {
        try {
          canvas.addMarker(highlightElementId, 'highlight-current');
        } catch (e) {
          console.warn('Could not highlight element:', highlightElementId);
        }
      }
    }).catch((err: Error) => {
      console.error('Error importing BPMN:', err);
    });

    return () => {
      if (viewerRef.current) {
        viewerRef.current.destroy();
        viewerRef.current = null;
      }
    };
  }, [xml, highlightElementId]);

  return (
    <>
      <style>{`
        .highlight-current .djs-visual > :nth-child(1) {
          fill: #52c41a !important;
          stroke: #389e0d !important;
          stroke-width: 2px !important;
        }
        .highlight-current .djs-visual text {
          fill: #ffffff !important;
          font-weight: bold !important;
        }
      `}</style>
      <div
        ref={containerRef}
        style={{
          width: '100%',
          height: height,
          border: '1px solid #e8e8e8',
          borderRadius: 4,
          backgroundColor: '#fafafa',
        }}
      />
    </>
  );
};

export default BpmnViewerReadonly;
