import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Table, Button, Space, message, Modal, Input, Card } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined } from '@ant-design/icons';
import { materialCategoryService } from '../services/materialCategoryService';
import type { MaterialCategory } from '../types';
import dayjs from 'dayjs';

const { confirm } = Modal;

const MaterialCategoryManagement = () => {
  const navigate = useNavigate();
  const [data, setData] = useState<MaterialCategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const result = await materialCategoryService.getAll();
      setData(result);
    } catch (error) {
      console.error(error);
      message.error('Lỗi tải danh sách danh mục');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (id: string) => {
    confirm({
      title: 'Xác nhận xóa',
      content: 'Bạn có chắc chắn muốn xóa danh mục này? Việc này có thể ảnh hưởng đến các nguyên liệu liên quan.',
      okText: 'Xóa',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk: async () => {
        try {
          const result = await materialCategoryService.delete(id);
          if (result.success) {
            message.success('Xóa thành công');
            loadData();
          } else {
            message.error(result.message || 'Xóa thất bại');
          }
        } catch (error) {
          message.error('Lỗi khi xóa danh mục');
        }
      },
    });
  };

  const filteredData = data.filter(item => 
      item.name.toLowerCase().includes(searchText.toLowerCase()) || 
      item.code.toLowerCase().includes(searchText.toLowerCase())
  );

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
      title: 'Ngày Tạo',
      dataIndex: 'createdDate',
      key: 'createdDate',
      width: 180,
      render: (text: string) => text ? dayjs(text).format('DD/MM/YYYY HH:mm') : '',
    },
    {
      title: 'Thao Tác',
      key: 'action',
      width: 150,
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
          <Button 
            danger 
            icon={<DeleteOutlined />} 
            size="small"
            onClick={() => handleDelete(record.id)}
          >
            Xóa
          </Button>
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
              onChange={e => setSearchText(e.target.value)}
              style={{ width: 250 }}
           />
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
        dataSource={filteredData} 
        rowKey="id"
        loading={loading}
        pagination={{ pageSize: 10 }}
      />
    </Card>
  );
};

export default MaterialCategoryManagement;
