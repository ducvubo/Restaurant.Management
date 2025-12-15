import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Table, Button, Space, message, Modal, Input, Card, Tag } from 'antd';
import { PlusOutlined, EditOutlined, SearchOutlined, StopOutlined, CheckCircleOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import type { MaterialCategory } from '@/types';
import { materialCategoryService } from '@/services/materialCategoryService';

const { confirm } = Modal;

const MaterialCategoryManagement = () => {
  const navigate = useNavigate();
  const [data, setData] = useState<MaterialCategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  useEffect(() => {
    loadData(1, 10);
  }, []);

  const loadData = async (page: number, size: number, keyword?: string) => {
    try {
      setLoading(true);
      const result = await materialCategoryService.getList({ 
          page, 
          size, 
          keyword 
      });
      setData(result.items);
      setPagination({
        ...pagination,
        current: page,
        pageSize: size,
        total: result.total,
      });
    } catch (error) {
      console.error(error);
      message.error('Lỗi tải danh sách danh mục');
    } finally {
      setLoading(false);
    }
  };

  const handleTableChange = (newPagination: any) => {
    loadData(newPagination.current, newPagination.pageSize, searchText);
  };

  const handleSearch = () => {
      loadData(1, pagination.pageSize, searchText);
  };


  const handleStatusChange = (id: string, currentStatus: number) => {
    const action = currentStatus === 1 ? 'ngưng hoạt động' : 'kích hoạt';
    confirm({
      title: `Xác nhận ${action}`,
      content: `Bạn có chắc chắn muốn ${action} danh mục này?`,
      okText: 'Đồng ý',
      cancelText: 'Hủy',
      onOk: async () => {
        try {
          const result = currentStatus === 1 
            ? await materialCategoryService.deactivate(id)
            : await materialCategoryService.activate(id);
            
          if (result.success) {
            loadData(pagination.current, pagination.pageSize, searchText);
          } else {
            message.error(result.message || 'Thao tác thất bại');
          }
        } catch (error) {
          message.error('Lỗi hệ thống');
        }
      },
    });
  };

  const columns = [
    {
      title: 'Mã Danh Mục',
      dataIndex: 'code',
      key: 'code',
      width: 150,
    },
    {
      title: 'Tên Danh Mục',
      dataIndex: 'name',
      key: 'name',
      width: 250,
    },
    {
      title: 'Mô Tả',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: 'Trạng Thái',
      dataIndex: 'status',
      key: 'status',
      width: 150,
      render: (status: number) => (
        <Tag color={status === 1 ? 'green' : 'red'}>
          {status === 1 ? 'Đang hoạt động' : 'Ngưng hoạt động'}
        </Tag>
      ),
    },
    {
      title: 'Ngày Tạo',
      dataIndex: 'createdDate',
      key: 'createdDate',
      width: 180,
      render: (text: string) => text ? dayjs(text).format('DD/MM/YYYY HH:mm') : '',
    },
    {
      title: 'Thao Tác',
      key: 'action',
      width: 200,
      render: (_: any, record: MaterialCategory) => (
        <Space size="middle">
          <Button 
            type="primary" 
            icon={<EditOutlined />} 
            size="small"
            onClick={() => navigate(`/material-categories/update?id=${record.id}`)}
          >
            Sửa
          </Button>
          {record.status === 1 ? (
             <Button 
              danger 
              icon={<StopOutlined />} 
              size="small"
              onClick={() => handleStatusChange(record.id, record.status)}
            >
              Ngưng
            </Button>
          ) : (
            <Button 
              type="default"
              className="bg-green-500 text-white hover:bg-green-600 border-green-500 hover:border-green-600"
              icon={<CheckCircleOutlined />} 
              size="small"
              onClick={() => handleStatusChange(record.id, record.status)}
            >
              Kích hoạt
            </Button>
          )}
        </Space>
      ),
    },
  ];

  return (
    <Card bodyStyle={{ padding: '16px' }}>
      <div className="flex justify-between mb-4">
        <Space>
          <Input
            placeholder="Tìm kiếm danh mục..."
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={e => setSearchText(e.target.value)}
            onPressEnter={handleSearch}
            style={{ width: 250 }}
          />
           <Button onClick={handleSearch} icon={<SearchOutlined />}>Tìm</Button>
        </Space>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => navigate('/material-categories/add')}
        >
          Thêm Danh Mục
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={data}
        rowKey="id"
        loading={loading}
        pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: pagination.total,
            showSizeChanger: true,
            showTotal: (total) => `Tổng cộng ${total} dòng`,
        }}
        onChange={handleTableChange}
      />
    </Card>
  );
};

export default MaterialCategoryManagement;


