import React, { useEffect, useState } from 'react';
import api from '../services/api';
import './CommonPages.css';

const Workers = () => {
  const [workers, setWorkers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingWorker, setEditingWorker] = useState(null);
  const [formData, setFormData] = useState({
    code: '',
    full_name: '',
    id_card: '',
    phone: '',
    email: '',
    address: '',
    date_of_birth: '',
    gender: '',
    department_id: '',
    position: '',
    hire_date: '',
    salary: '',
    status: 'active',
    notes: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [workersRes, departmentsRes] = await Promise.all([
        api.get('/workers'),
        api.get('/departments'),
      ]);
      setWorkers(workersRes.data);
      setDepartments(departmentsRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingWorker) {
        await api.put(`/workers/${editingWorker.id}`, formData);
      } else {
        await api.post('/workers', formData);
      }
      fetchData();
      setShowModal(false);
      resetForm();
    } catch (error) {
      alert('Lỗi: ' + (error.response?.data?.error || error.message));
    }
  };

  const handleEdit = (worker) => {
    setEditingWorker(worker);
    setFormData({
      code: worker.code || '',
      full_name: worker.full_name || '',
      id_card: worker.id_card || '',
      phone: worker.phone || '',
      email: worker.email || '',
      address: worker.address || '',
      date_of_birth: worker.date_of_birth || '',
      gender: worker.gender || '',
      department_id: worker.department_id || '',
      position: worker.position || '',
      hire_date: worker.hire_date || '',
      salary: worker.salary || '',
      status: worker.status || 'active',
      notes: worker.notes || '',
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Bạn có chắc muốn xóa nhân công này?')) {
      try {
        await api.delete(`/workers/${id}`);
        fetchData();
      } catch (error) {
        alert('Lỗi: ' + (error.response?.data?.error || error.message));
      }
    }
  };

  const resetForm = () => {
    setFormData({
      code: '',
      full_name: '',
      id_card: '',
      phone: '',
      email: '',
      address: '',
      date_of_birth: '',
      gender: '',
      department_id: '',
      position: '',
      hire_date: '',
      salary: '',
      status: 'active',
      notes: '',
    });
    setEditingWorker(null);
  };

  const getStatusLabel = (status) => {
    const labels = {
      'active': 'Đang làm việc',
      'on_leave': 'Nghỉ phép',
      'resigned': 'Nghỉ việc'
    };
    return labels[status] || status;
  };

  if (loading) {
    return <div className="page-loading">Đang tải...</div>;
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Quản Lý Nhân Công</h1>
        <button className="btn-primary" onClick={() => { resetForm(); setShowModal(true); }}>
          + Thêm Nhân Công
        </button>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Mã Nhân Công</th>
              <th>Họ Tên</th>
              <th>Bộ Phận</th>
              <th>Chức Vụ</th>
              <th>Điện Thoại</th>
              <th>Trạng Thái</th>
              <th>Thao Tác</th>
            </tr>
          </thead>
          <tbody>
            {workers.length === 0 ? (
              <tr>
                <td colSpan="7" className="empty-state">Chưa có dữ liệu</td>
              </tr>
            ) : (
              workers.map((worker) => (
                <tr key={worker.id}>
                  <td>{worker.code}</td>
                  <td>{worker.full_name}</td>
                  <td>{worker.department_name || '-'}</td>
                  <td>{worker.position || '-'}</td>
                  <td>{worker.phone || '-'}</td>
                  <td>
                    <span className={`status-badge ${worker.status}`}>
                      {getStatusLabel(worker.status)}
                    </span>
                  </td>
                  <td>
                    <button className="btn-edit" onClick={() => handleEdit(worker)}>Sửa</button>
                    <button className="btn-delete" onClick={() => handleDelete(worker.id)}>Xóa</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => { setShowModal(false); resetForm(); }}>
          <div className="modal-content large" onClick={(e) => e.stopPropagation()}>
            <h2>{editingWorker ? 'Sửa Nhân Công' : 'Thêm Nhân Công'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label>Mã Nhân Công *</label>
                  <input
                    type="text"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Trạng Thái</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  >
                    <option value="active">Đang làm việc</option>
                    <option value="on_leave">Nghỉ phép</option>
                    <option value="resigned">Nghỉ việc</option>
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label>Họ Tên *</label>
                <input
                  type="text"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  required
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>CMND/CCCD</label>
                  <input
                    type="text"
                    value={formData.id_card}
                    onChange={(e) => setFormData({ ...formData, id_card: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Giới Tính</label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                  >
                    <option value="">Chọn</option>
                    <option value="Nam">Nam</option>
                    <option value="Nữ">Nữ</option>
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Ngày Sinh</label>
                  <input
                    type="date"
                    value={formData.date_of_birth}
                    onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Ngày Vào Làm</label>
                  <input
                    type="date"
                    value={formData.hire_date}
                    onChange={(e) => setFormData({ ...formData, hire_date: e.target.value })}
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Điện Thoại</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Bộ Phận</label>
                  <select
                    value={formData.department_id}
                    onChange={(e) => setFormData({ ...formData, department_id: e.target.value })}
                  >
                    <option value="">Chọn bộ phận</option>
                    {departments.map(dept => (
                      <option key={dept.id} value={dept.id}>{dept.name}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Chức Vụ</label>
                  <input
                    type="text"
                    value={formData.position}
                    onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                    placeholder="VD: Thợ xây, Thợ điện"
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Lương (VNĐ)</label>
                  <input
                    type="number"
                    value={formData.salary}
                    onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                    min="0"
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Địa Chỉ</label>
                <textarea
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  rows="2"
                />
              </div>
              <div className="form-group">
                <label>Ghi Chú</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows="2"
                />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => { setShowModal(false); resetForm(); }}>
                  Hủy
                </button>
                <button type="submit" className="btn-primary">Lưu</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Workers;

