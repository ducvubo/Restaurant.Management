import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Table, Button, Space, Tag, Card, Modal, Tooltip, Input, Select, Checkbox } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { ReloadOutlined, EditOutlined, StopOutlined, PlusOutlined, SearchOutlined, FilterOutlined, PlayCircleOutlined } from '@ant-design/icons';
import type { Workflow, WorkflowListRequest } from '@/types';
import { workflowService } from '@/services/workflowService';
import enumData from '@/enums/enums';

const { Search } = Input;

const WorkflowManagement = () => {
    const navigate = useNavigate();
    const [workflows, setWorkflows] = useState<Workflow[]>([]);
    const [loading, setLoading] = useState(true);
    const [total, setTotal] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [keyword, setKeyword] = useState('');
    const [statusFilter, setStatusFilter] = useState<number | undefined>(undefined);
    const [workflowTypeFilter, setWorkflowTypeFilter] = useState<number | undefined>(undefined);
    const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);

    useEffect(() => {
        loadWorkflows();
    }, [currentPage, pageSize, statusFilter, workflowTypeFilter, keyword]);

    const loadWorkflows = async () => {
        try {
            setLoading(true);
            const request: WorkflowListRequest = {
                keyword: keyword || undefined,
                status: statusFilter,
                workflowType: workflowTypeFilter,
                page: currentPage,
                size: pageSize,
            };
            const data = await workflowService.getWorkflowList(request);
            setWorkflows(data.items);
            setTotal(data.total);
        } catch (err) {
            // Error đã được xử lý bởi baseHttp interceptor
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (value: string) => {
        setKeyword(value);
        setCurrentPage(1);
        const request: WorkflowListRequest = {
            keyword: value || undefined,
            status: statusFilter,
            workflowType: workflowTypeFilter,
            page: 1,
            size: pageSize,
        };
        setLoading(true);
        workflowService.getWorkflowList(request).then(data => {
            setWorkflows(data.items);
            setTotal(data.total);
            setLoading(false);
        }).catch(() => setLoading(false));
    };

    const handleStatusFilterChange = (value: number | undefined) => {
        setStatusFilter(value);
        setCurrentPage(1);
    };

    const handleWorkflowTypeFilterChange = (value: number | undefined) => {
        setWorkflowTypeFilter(value);
        setCurrentPage(1);
    };

    const handleCreate = () => {
        navigate('/workflows/add');
    };

    const handleEdit = (workflow: Workflow) => {
        navigate(`/workflows/update?id=${workflow.id}`);
    };

    // State for activate modal
    const [activateModalVisible, setActivateModalVisible] = useState(false);
    const [activateForceChecked, setActivateForceChecked] = useState(false);
    const [workflowToActivate, setWorkflowToActivate] = useState<Workflow | null>(null);
    const [activating, setActivating] = useState(false);

    const handleActivate = (workflow: Workflow) => {
        setWorkflowToActivate(workflow);
        setActivateForceChecked(false);
        setActivateModalVisible(true);
    };

    const confirmActivate = async () => {
        if (!workflowToActivate) return;
        try {
            setActivating(true);
            await workflowService.activateWorkflow(workflowToActivate.id, activateForceChecked);
            loadWorkflows();
            setActivateModalVisible(false);
            setWorkflowToActivate(null);
        } catch (err) {
            // Error handled by interceptor
        } finally {
            setActivating(false);
        }
    };

    const handleDeactivate = (workflow: Workflow) => {
        const typeLabel = enumData.workflowType.get(typeof workflow.workflowType === 'string'
            ? Number(workflow.workflowType)
            : workflow.workflowType)?.text ?? 'Unknown';
        const displayName = workflow.description || typeLabel;
        Modal.confirm({
            title: 'Vô Hiệu Hóa Workflow',
            content: `Bạn có chắc chắn muốn vô hiệu hóa workflow "${displayName}" (v${workflow.version})?`,
            okText: 'Xác Nhận',
            cancelText: 'Hủy',
            onOk: async () => {
                try {
                    await workflowService.deactivateWorkflow(workflow.id);
                    loadWorkflows();
                } catch (err) {
                    // Error đã được xử lý bởi baseHttp interceptor
                }
            },
        });
    };

    const columns: ColumnsType<Workflow> = [
        {
            title: 'Loại Workflow',
            dataIndex: 'workflowType',
            key: 'workflowType',
            width: 200,
            render: (type: string | number) => {
                const numType = typeof type === 'string' ? Number(type) : type;
                return enumData.workflowType.get(numType)?.text ?? 'Unknown';
            },
        },
        {
            title: 'Mô Tả',
            dataIndex: 'description',
            key: 'description',
            width: 250,
            ellipsis: true,
        },
        {
            title: 'Version',
            dataIndex: 'version',
            key: 'version',
            width: 100,
            render: (version: string) => <Tag color="blue">v{version}</Tag>,
        },
        {
            title: 'Trạng Thái',
            dataIndex: 'status',
            key: 'status',
            width: 120,
            render: (status: number) => {
                const statusItem = enumData.dataStatus.get(status);
                return (
                    <Tag color={status === 1 ? 'green' : 'red'}>
                        {statusItem?.text || 'Không xác định'}
                    </Tag>
                );
            },
        },
        {
            title: 'Ngày Tạo',
            dataIndex: 'createdDate',
            key: 'createdDate',
            width: 180,
            render: (date: string) => new Date(date).toLocaleString('vi-VN'),
        },
        {
            title: 'Thao Tác',
            key: 'actions',
            width: 160,
            fixed: 'right',
            render: (_, record) => (
                <Space>
                    <Tooltip title="Chỉnh Sửa">
                        <Button
                            type="primary"
                            icon={<EditOutlined />}
                            size="small"
                            onClick={() => handleEdit(record)}
                        />
                    </Tooltip>
                    {record.status === 1 ? (
                        <Tooltip title="Vô Hiệu Hóa">
                            <Button
                                type="primary"
                                danger
                                icon={<StopOutlined />}
                                size="small"
                                onClick={() => handleDeactivate(record)}
                            />
                        </Tooltip>
                    ) : (
                        <Tooltip title="Kích Hoạt">
                            <Button
                                type="primary"
                                icon={<PlayCircleOutlined />}
                                size="small"
                                onClick={() => handleActivate(record)}
                                style={{ backgroundColor: '#52c41a' }}
                            />
                        </Tooltip>
                    )}
                </Space>
            ),
        },
    ];

    // Workflow type options from enumData
    const workflowTypeOptions = enumData.workflowType.list.map(item => ({
        value: item.value,
        label: item.text,
    }));

    return (
        <div>
            <Card bodyStyle={{ padding: '16px' }}>
                <div className="flex justify-between items-center mb-2">
                    <h1 className="text-xl font-bold m-0">Quản Lý Workflow</h1>
                    <Space>
                        <Tooltip title={showAdvancedSearch ? "Ẩn tìm kiếm nâng cao" : "Hiện tìm kiếm nâng cao"}>
                            <Button
                                icon={<FilterOutlined />}
                                onClick={() => setShowAdvancedSearch(!showAdvancedSearch)}
                                type={showAdvancedSearch ? "primary" : "default"}
                            >
                                Tìm Kiếm Nâng Cao
                            </Button>
                        </Tooltip>
                        <Button
                            type="primary"
                            icon={<PlusOutlined />}
                            onClick={handleCreate}
                        >
                            Tạo Workflow
                        </Button>
                        <Button
                            icon={<ReloadOutlined />}
                            onClick={loadWorkflows}
                            loading={loading}
                        >
                            Làm Mới
                        </Button>
                    </Space>
                </div>

                {/* Advanced Search */}
                {showAdvancedSearch && (
                    <div className="mb-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                        <div className="flex gap-4 flex-wrap">
                            <Search
                                placeholder="Tìm kiếm theo mô tả..."
                                allowClear
                                enterButton={<SearchOutlined />}
                                size="middle"
                                onSearch={handleSearch}
                                style={{ width: 400 }}
                                value={keyword}
                                onChange={(e) => setKeyword(e.target.value)}
                            />
                            <Select
                                placeholder="Lọc theo loại workflow"
                                allowClear
                                style={{ width: 250 }}
                                onChange={handleWorkflowTypeFilterChange}
                                value={workflowTypeFilter}
                                options={workflowTypeOptions}
                            />
                            <Select
                                placeholder="Lọc theo trạng thái"
                                allowClear
                                style={{ width: 200 }}
                                onChange={handleStatusFilterChange}
                                value={statusFilter}
                                options={[
                                    { value: 1, label: 'Hoạt động' },
                                    { value: 0, label: 'Không hoạt động' },
                                ]}
                            />
                        </div>
                    </div>
                )}

                <Table
                    columns={columns}
                    dataSource={workflows}
                    rowKey="id"
                    loading={loading}
                    scroll={{ x: 1200 }}
                    pagination={{
                        current: currentPage,
                        pageSize: pageSize,
                        total: total,
                        showSizeChanger: true,
                        showTotal: (total) => `Tổng ${total} workflow`,
                        onChange: (page, size) => {
                            setCurrentPage(page);
                            setPageSize(size);
                        },
                    }}
                />
            </Card>

            {/* Activate Modal */}
            <Modal
                title="Kích Hoạt Workflow"
                open={activateModalVisible}
                onOk={confirmActivate}
                onCancel={() => {
                    setActivateModalVisible(false);
                    setWorkflowToActivate(null);
                }}
                okText="Xác Nhận"
                cancelText="Hủy"
                confirmLoading={activating}
            >
                {workflowToActivate && (
                    <>
                        <p>
                            Bạn có chắc chắn muốn kích hoạt workflow 
                            <strong>
                                {` "${workflowToActivate.description || enumData.workflowType.get(
                                    typeof workflowToActivate.workflowType === 'string'
                                        ? Number(workflowToActivate.workflowType)
                                        : workflowToActivate.workflowType
                                )?.text || 'Unknown'}" `}
                            </strong>
                            (v{workflowToActivate.version})?
                        </p>
                        <div style={{ marginTop: 16 }}>
                            <Checkbox
                                checked={activateForceChecked}
                                onChange={(e) => setActivateForceChecked(e.target.checked)}
                            >
                                <span style={{ fontWeight: 500 }}>Ép buộc kích hoạt</span>
                            </Checkbox>
                            <p style={{ marginLeft: 24, marginTop: 4, color: '#666', fontSize: 12 }}>
                                Nếu chọn, workflow khác cùng loại đang hoạt động sẽ bị vô hiệu hóa.
                            </p>
                        </div>
                    </>
                )}
            </Modal>
        </div>
    );
};

export default WorkflowManagement;
