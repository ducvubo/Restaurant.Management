import React, { useEffect, useState } from 'react';
import { Card, Table, Button, Modal, Select, message, Tag, Space } from 'antd';
import { PlusOutlined, DeleteOutlined, StarOutlined, StarFilled } from '@ant-design/icons';
import unitConversionService from '../../services/unitConversionService';
import type { MaterialUnit } from '../../services/unitConversionService';
import { materialService } from '../../services/materialService';
import { unitService } from '../../services/unitService';

const MaterialUnitConfig: React.FC = () => {
  const [materials, setMaterials] = useState<any[]>([]);
  const [units, setUnits] = useState<any[]>([]);
  const [selectedMaterial, setSelectedMaterial] = useState<string | null>(null);
  const [materialUnits, setMaterialUnits] = useState<MaterialUnit[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedUnit, setSelectedUnit] = useState<string | null>(null);
  const [isBaseUnit, setIsBaseUnit] = useState(false);

  useEffect(() => {
    loadMaterials();
    loadUnits();
  }, []);

  useEffect(() => {
    if (selectedMaterial) {
      loadMaterialUnits();
    }
  }, [selectedMaterial]);

  const loadMaterials = async () => {
    try {
      const res = await materialService.getList({ page: 1, size: 1000 });
      setMaterials(res.items || []);
    } catch (error) {
      message.error('Không thể tải danh sách nguyên liệu');
    }
  };

  const loadUnits = async () => {
    try {
      const res = await unitService.getUnitList({ page: 1, size: 1000 });
      setUnits(res.items || []);
    } catch (error) {
      message.error('Không thể tải danh sách đơn vị');
    }
  };

  const loadMaterialUnits = async () => {
    if (!selectedMaterial) return;
    
    setLoading(true);
    try {
      const data = await unitConversionService.getUnitsForMaterial(selectedMaterial);
      setMaterialUnits(data);
    } catch (error) {
      message.error('Không thể tải danh sách đơn vị');
    } finally {
      setLoading(false);
    }
  };

  const handleAddUnit = async () => {
    if (!selectedMaterial || !selectedUnit) {
      message.error('Vui lòng chọn đơn vị');
      return;
    }

    try {
      const response = await unitConversionService.addUnitToMaterial(selectedMaterial, selectedUnit, isBaseUnit);
      
      // Check if API returned success
      if (response.success) {
        
        // Only close modal and reset on success
        setModalVisible(false);
        setSelectedUnit(null);
        setIsBaseUnit(false);
        loadMaterialUnits();
      } else {
        // API returned success: false
        message.error(response.message || 'Có lỗi xảy ra');
      }
    } catch (error: any) {
      // Keep modal open on error so user can fix input
      message.error(error.response?.data?.message || 'Có lỗi xảy ra');
    }
  };

  const handleRemoveUnit = async (unitId: string) => {
    if (!selectedMaterial) return;

    Modal.confirm({
      title: 'Xác nhận xóa',
      content: 'Bạn có chắc muốn xóa đơn vị này?',
      onOk: async () => {
        try {
          await unitConversionService.removeUnitFromMaterial(selectedMaterial, unitId);
          loadMaterialUnits();
        } catch (error: any) {
          console.log(error);
        }
      }
    });
  };

  const handleSetBaseUnit = async (unitId: string) => {
    if (!selectedMaterial) return;

    Modal.confirm({
      title: 'Xác nhận đặt đơn vị cơ sở',
      content: 'Bạn có chắc muốn đặt đơn vị này làm đơn vị cơ sở?',
      onOk: async () => {
        try {
          await unitConversionService.setBaseUnit(selectedMaterial, unitId);
          loadMaterialUnits();
        } catch (error: any) {
          console.log(error);
        }
      }
    });
  };

  const columns = [
    {
      title: 'Đơn Vị',
      dataIndex: 'unitName',
      render: (text: string, record: MaterialUnit) => (
        <Space>
          {record.isBaseUnit && <StarFilled style={{ color: '#faad14' }} />}
          {text} ({record.unitSymbol})
        </Space>
      )
    },
    {
      title: 'Loại',
      dataIndex: 'isBaseUnit',
      render: (isBase: boolean) => 
        isBase ? <Tag color="blue">Đơn vị cơ sở</Tag> : <Tag>Đơn vị phụ</Tag>
    },
    {
      title: 'Hệ Số Chuyển Đổi',
      dataIndex: 'conversionFactor',
      render: (factor: number, record: MaterialUnit) => {
        if (record.isBaseUnit) {
          return <Tag color="blue">1 (Cơ sở)</Tag>;
        }
        if (factor != null) {
          // Remove trailing zeros
          const formatted = parseFloat(factor.toFixed(6)).toString();
          return <span>{formatted}</span>;
        }
        return <span style={{ color: '#999' }}>-</span>;
      }
    },
    {
      title: 'Thao Tác',
      render: (_: any, record: MaterialUnit) => (
        <Space>
          {!record.isBaseUnit && (
            <Button 
              type="link" 
              icon={<StarOutlined />}
              onClick={() => handleSetBaseUnit(record.unitId)}
            >
              Đặt làm cơ sở
            </Button>
          )}
          <Button 
            type="link" 
            danger 
            icon={<DeleteOutlined />}
            onClick={() => handleRemoveUnit(record.unitId)}
            disabled={record.isBaseUnit}
          >
            Xóa
          </Button>
        </Space>
      )
    }
  ];

  const availableUnits = units.filter(
    u => !Array.isArray(materialUnits) || !materialUnits.some(mu => mu.unitId === u.id)
  );

  return (
    <Card title="Cấu Hình Đơn Vị Cho Nguyên Liệu">
      <div style={{ marginBottom: 16 }}>
        <Select
          style={{ width: 300 }}
          placeholder="Chọn nguyên liệu"
          value={selectedMaterial}
          onChange={setSelectedMaterial}
          showSearch
          optionFilterProp="children"
        >
          {materials.map(m => (
            <Select.Option key={m.id} value={m.id}>
              {m.name}
            </Select.Option>
          ))}
        </Select>

        {selectedMaterial && (
          <Button 
            type="primary" 
            icon={<PlusOutlined />}
            onClick={() => setModalVisible(true)}
            style={{ marginLeft: 16 }}
          >
            Thêm Đơn Vị
          </Button>
        )}
      </div>

      {selectedMaterial && (
        <Table 
          dataSource={Array.isArray(materialUnits) ? materialUnits : []}
          columns={columns}
          loading={loading}
          rowKey="id"
          pagination={false}
        />
      )}

      <Modal
        title="Thêm Đơn Vị Cho Nguyên Liệu"
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          setSelectedUnit(null);
          setIsBaseUnit(false);
        }}
        onOk={handleAddUnit}
      >
        <div style={{ marginBottom: 16 }}>
          <label>Chọn Đơn Vị:</label>
          <Select
            style={{ width: '100%', marginTop: 8 }}
            placeholder="Chọn đơn vị"
            value={selectedUnit}
            onChange={setSelectedUnit}
          >
            {availableUnits.map(u => (
              <Select.Option key={u.id} value={u.id}>
                {u.code} - {u.name}
              </Select.Option>
            ))}
          </Select>
        </div>

        <div>
          <label>
            <input 
              type="checkbox" 
              checked={isBaseUnit}
              onChange={(e) => setIsBaseUnit(e.target.checked)}
              style={{ marginRight: 8 }}
            />
            Đặt làm đơn vị cơ sở
          </label>
        </div>
      </Modal>
    </Card>
  );
};

export default MaterialUnitConfig;
