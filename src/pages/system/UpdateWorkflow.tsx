import { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Form, Input, Select, Card, Button, Space, Row, Col, Tabs, Spin } from 'antd';
import { workflowService } from '../../services/workflowService';
import { policyService } from '../../services/policyService';
import type { UpdateWorkflowRequest, Workflow, Policy } from '../../types';
import { WORKFLOW_STATUS_OPTIONS } from '../../config/workflowConstants';
import enumData from '../../enums/enums';
import WorkflowDesigner, { type WorkflowDesignerHandle } from '../../components/WorkflowDesigner';

const { TextArea } = Input;

const UpdateWorkflow = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const workflowId = searchParams.get('id');
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);
    const [status, setStatus] = useState<number>(enumData.dataStatus.ACTIVE.value);
    const [isForceActive, setIsForceActive] = useState(false);
    const [workflow, setWorkflow] = useState<Workflow | null>(null);
    const [policies, setPolicies] = useState<Policy[]>([]);
    const designerRef = useRef<WorkflowDesignerHandle>(null);

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

    useEffect(() => {
        if (workflowId) {
            loadWorkflow(workflowId);
        } else {
            console.error('Không tìm thấy ID workflow');
            navigate('/workflows');
        }
    }, [workflowId]);

    const loadWorkflow = async (id: string) => {
        try {
            setInitialLoading(true);
            const data = await workflowService.getWorkflowById(id);
            setWorkflow(data);
            setStatus(data.status);

            form.setFieldsValue({
                workflowType: data.workflowType,
                description: data.description,
            });

            // Load BPMN XML into designer after a short delay to ensure designer is mounted
            setTimeout(() => {
                if (designerRef.current) {
                    designerRef.current.importXml(data.workflowDiagram).catch((err) => {
                        console.error('Error loading BPMN:', err);
                    });
                }
            }, 100);
        } catch (error) {
            console.error('Không thể tải thông tin workflow');
            navigate('/workflows');
        } finally {
            setInitialLoading(false);
        }
    };

    const handleSubmit = async () => {
        if (!workflowId) {
            console.error('Không tìm thấy ID workflow');
            return;
        }

        try {
            if (!workflow) {
                console.error('Workflow chưa được tải');
                return;
            }
            const values = await form.validateFields();

            if (!designerRef.current) {
                console.error('BPMN Designer chưa sẵn sàng');
                return;
            }

            // Get BPMN XML from designer
            const bpmnXml = await designerRef.current.getWorkflowXml();

            // Server will validate BPMN and extract policies automatically
            const request: UpdateWorkflowRequest = {
                id: workflowId,
                workflowType: Number(workflow.workflowType),
                description: values.description,
                workflowDiagram: bpmnXml,
                status: status,
            };

            setLoading(true);
            const resp = await workflowService.updateWorkflow(workflowId, request, isForceActive);
            if (resp.success) {
                navigate('/workflows');
            }
        } catch (error) {
            console.error('Validation failed:', error);
        } finally {
            setLoading(false);
        }
    };

    if (initialLoading) {
        return (
            <div style={{ textAlign: 'center', padding: '50px' }}>
                <Spin size="large" tip="Đang tải workflow..." />
            </div>
        );
    }

    return (
        <div>
            <Card bodyStyle={{ padding: '16px' }}>
                <div className="flex items-center justify-between mb-2">
                    <h1 className="text-xl font-bold m-0">
                        Cập Nhật Workflow {workflow && `(v${workflow.version})`}
                    </h1>
                    <Space>
                        <Button onClick={() => navigate('/workflows')}>
                            Hủy
                        </Button>
                        <Button
                            type="primary"
                            onClick={handleSubmit}
                            loading={loading}
                            disabled={initialLoading}
                        >
                            Lưu Thay Đổi
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
                                                style={{ marginBottom: '12px' }}
                                            >
                                                <Input
                                                    value={workflow ? (enumData.workflowType.get(Number(workflow.workflowType))?.text ?? 'Unknown') : ''}
                                                    disabled
                                                    style={{ color: '#000' }}
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
                                                    className="mr-2"
                                                />
                                                <div className="flex flex-col ml-2">
                                                    <span className="font-medium -mt-2">Ép buộc kích hoạt</span>
                                                    <span className="text-xs text-gray-500">
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


                                    {workflow && (
                                        <div style={{
                                            padding: 12,
                                            backgroundColor: '#f0f5ff',
                                            border: '1px solid #adc6ff',
                                            borderRadius: 4
                                        }}>
                                            <Row gutter={16}>
                                                <Col span={8}>
                                                    <strong>Version hiện tại:</strong> v{workflow.version}
                                                </Col>
                                                <Col span={8}>
                                                    <strong>Ngày tạo:</strong> {new Date(workflow.createdDate).toLocaleString('vi-VN')}
                                                </Col>
                                                <Col span={8}>
                                                    <strong>Cập nhật lần cuối:</strong> {new Date(workflow.updatedDate).toLocaleString('vi-VN')}
                                                </Col>
                                            </Row>
                                        </div>
                                    )}
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
                                        initialXml={workflow?.workflowDiagram}
                                        policies={policies}
                                    />

                                    <div style={{
                                        marginTop: 16,
                                        padding: 12,
                                        backgroundColor: '#e6f7ff',
                                        border: '1px solid #91d5ff',
                                        borderRadius: 4
                                    }}>
                                        <h4 style={{ margin: 0, marginBottom: 8 }}>Lưu ý khi update:</h4>
                                        <ul style={{ margin: 0, paddingLeft: 20 }}>
                                            <li>Double-click vào Task để cấu hình tên bước và phân quyền</li>
                                            <li>Double-click vào mũi tên từ Gateway để chọn hành động (Có/Không)</li>
                                            <li>Server sẽ tự động validate và extract policy IDs khi lưu</li>
                                            <li>Thay đổi BPMN sẽ tạo version mới (minor version nếu cùng workflow type)</li>
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

export default UpdateWorkflow;
