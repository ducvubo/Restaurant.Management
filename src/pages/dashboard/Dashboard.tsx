import { Card, Row, Col, Statistic } from 'antd';
import { UserOutlined, CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';

const Dashboard = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold mb-4">Bảng Điều Khiển</h1>
      
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={8}>
          <Card>
            <Statistic
              title="Tổng Số Người Dùng"
              value={1128}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <Card>
            <Statistic
              title="Người Dùng Hoạt Động"
              value={932}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <Card>
            <Statistic
              title="Người Dùng Không Hoạt Động"
              value={196}
              prefix={<CloseCircleOutlined />}
              valueStyle={{ color: '#cf1322' }}
            />
          </Card>
        </Col>
      </Row>

      <Card>
        <h2 className="text-xl font-semibold mb-4">Chào Mừng Đến Hệ Thống Quản Lý Nhà Hàng</h2>
        <p className="text-gray-600">
          Đây là bảng điều khiển để quản lý các hoạt động của nhà hàng.
        </p>
      </Card>
    </div>
  );
};

export default Dashboard;

