import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Input, Button, Card, Space, Select, Tabs, Row, Col } from 'antd';
import { workflowService } from '../../services/workflowService';
import { policyService } from '../../services/policyService';
import type { CreateWorkflowRequest, Policy } from '../../types';
import { WORKFLOW_TYPE_OPTIONS, WORKFLOW_STATUS_OPTIONS } from '../../config/workflowConstants';
import enumData from '../../enums/enums';
import WorkflowDesigner, { type WorkflowDesignerHandle } from '../../components/WorkflowDesigner';

const { TextArea } = Input;

const AddWorkflow = () => {
    const navigate = useNavigate();
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState<number>(enumData.dataStatus.ACTIVE.value);
    const [isForceActive, setIsForceActive] = useState(false);
    const [policies, setPolicies] = useState<Policy[]>([]);
    const designerRef = useRef<WorkflowDesignerHandle>(null);

    // Load policies
    useEffect(() => {
        loadPolicies();
    }, []);

    const loadPolicies = async () => {
        try {
            const data = await policyService.getAllPolicies();
            setPolicies(data);
        } catch (error) {
            console.error('Error loading policies:', error);
        }
    };

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();

            if (!designerRef.current) {
                console.error('BPMN Designer chưa sẵn sàng');
                return;
            }

            // Get BPMN XML from designer
            const bpmnXml = await designerRef.current.getWorkflowXml();

            // Server will validate BPMN and extract policies automatically
            const request: CreateWorkflowRequest = {
                workflowType: values.workflowType,
                description: values.description,
                workflowDiagram: bpmnXml,
                status: status,
            };

            setLoading(true);
            const resp = await workflowService.createWorkflow(request, isForceActive);
            if (resp.success) {
                navigate('/workflows');
            }
        } catch (error) {
            console.error('Validation failed:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <Card bodyStyle={{ padding: '16px' }}>
                <div className="flex items-center justify-between mb-2">
                    <h1 className="text-xl font-bold m-0">Tạo Workflow Mới</h1>
                    <Space>
                        <Button onClick={() => navigate('/workflows')}>
                            Hủy
                        </Button>
                        <Button
                            type="primary"
                            onClick={handleSubmit}
                            loading={loading}
                        >
                            Tạo Mới
                        </Button>
                    </Space>
                </div>

                <Tabs
                    defaultActiveKey="basic"
                    items={[
                        {
                            key: 'basic',
                            label: 'Thông Tin Cơ Bản',
                            children: (
                                <Form
                                    form={form}
                                    layout="vertical"
                                    onFinish={handleSubmit}
                                >
                                    <Row gutter={16}>
                                        <Col xs={24} sm={12}>
                                            <Form.Item
                                                label="Loại Workflow"
                                                name="workflowType"
                                                rules={[
                                                    { required: true, message: 'Vui lòng chọn loại workflow' },
                                                ]}
                                                style={{ marginBottom: '12px' }}
                                            >
                                                <Select
                                                    placeholder="Chọn loại workflow"
                                                    options={WORKFLOW_TYPE_OPTIONS}
                                                    showSearch
                                                    filterOption={(input, option) =>
                                                        (String(option?.label) ?? '').toLowerCase().includes(input.toLowerCase())
                                                    }
                                                />
                                            </Form.Item>
                                        </Col>
                                        <Col xs={24} sm={12}>
                                            <Form.Item
                                                label="Trạng thái"
                                                style={{ marginBottom: '12px' }}
                                            >
                                                <Select
                                                    value={status}
                                                    onChange={setStatus}
                                                    options={WORKFLOW_STATUS_OPTIONS}
                                                />
                                            </Form.Item>
                                        </Col>
                                    </Row>

                                    {status === enumData.dataStatus.ACTIVE.value && (
                                        <Form.Item style={{ marginBottom: '12px' }}>
                                            <label className="flex items-start cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={isForceActive}
                                                    onChange={(e) => setIsForceActive(e.target.checked)}
                                                    className=" mr-2"
                                                />
                                                <div className="flex flex-col ml-2">
                                                    <span className="font-medium -mt-2">Ép buộc kích hoạt</span>
                                                    <span className="text-xs text-gray-500 mt-1">
                                                        Nếu chọn, các quy trình cũ cùng loại sẽ bị vô hiệu hóa
                                                    </span>
                                                </div>
                                            </label>
                                        </Form.Item>
                                    )}

                                    <Form.Item
                                        label="Mô Tả"
                                        name="description"
                                        rules={[
                                            { min: 10, message: 'Mô tả phải có ít nhất 10 ký tự (nếu nhập)' },
                                        ]}
                                        style={{ marginBottom: '12px' }}
                                    >
                                        <TextArea
                                            rows={3}
                                            placeholder="Nhập mô tả workflow (không bắt buộc)"
                                        />
                                    </Form.Item>

                                  
                                </Form>
                            ),
                        },
                        {
                            key: 'bpmn',
                            label: 'BPMN Designer',
                            forceRender: true,
                            children: (
                                <div>
                                    <WorkflowDesigner
                                        ref={designerRef}
                                        policies={policies}
                                    />

                                    <div style={{
                                        marginTop: 16,
                                        padding: 12,
                                        backgroundColor: '#e6f7ff',
                                        border: '1px solid #91d5ff',
                                        borderRadius: 4
                                    }}>
                                        <h4 style={{ margin: 0, marginBottom: 8 }}>Hướng dẫn:</h4>
                                        <ul style={{ margin: 0, paddingLeft: 20 }}>
                                            <li>Double-click vào Task để cấu hình tên bước và phân quyền</li>
                                            <li>Double-click vào mũi tên từ Gateway để chọn hành động (Có/Không)</li>
                                            <li>Server sẽ tự động validate BPMN và extract policy IDs khi lưu</li>
                                            <li>Workflow phải có ít nhất 1 StartEvent và 1 EndEvent</li>
                                        </ul>
                                    </div>
                                </div>
                            ),
                        },
                    ]}
                />
            </Card>
        </div>
    );
};

export default AddWorkflow;
