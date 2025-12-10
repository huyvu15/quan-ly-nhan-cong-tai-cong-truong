import React, { useEffect, useState } from 'react';
import api from '../services/api';
import './CommonPages.css';

const Departments = () => {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    manager: '',
    phone: '',
    description: '',
  });

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      const response = await api.get('/departments');
      setDepartments(response.data);
    } catch (error) {
      console.error('Error fetching departments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingDepartment) {
        await api.put(`/departments/${editingDepartment.id}`, formData);
      } else {
        await api.post('/departments', formData);
      }
      fetchDepartments();
      setShowModal(false);
      resetForm();
    } catch (error) {
      alert('Lỗi: ' + (error.response?.data?.error || error.message));
    }
  };

  const handleEdit = (department) => {
    setEditingDepartment(department);
    setFormData({
      name: department.name || '',
      code: department.code || '',
      manager: department.manager || '',
      phone: department.phone || '',
      description: department.description || '',
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Bạn có chắc muốn xóa bộ phận này?')) {
      try {
        await api.delete(`/departments/${id}`);
        fetchDepartments();
      } catch (error) {
        alert('Lỗi: ' + (error.response?.data?.error || error.message));
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      code: '',
      manager: '',
      phone: '',
      description: '',
    });
    setEditingDepartment(null);
  };

  if (loading) {
    return <div className="page-loading">Đang tải...</div>;
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Quản Lý Bộ Phận</h1>
        <button className="btn-primary" onClick={() => { resetForm(); setShowModal(true); }}>
          + Thêm Bộ Phận
        </button>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Mã Bộ Phận</th>
              <th>Tên Bộ Phận</th>
              <th>Trưởng Bộ Phận</th>
              <th>Điện Thoại</th>
              <th>Thao Tác</th>
            </tr>
          </thead>
          <tbody>
            {departments.length === 0 ? (
              <tr>
                <td colSpan="5" className="empty-state">Chưa có dữ liệu</td>
              </tr>
            ) : (
              departments.map((department) => (
                <tr key={department.id}>
                  <td>{department.code || '-'}</td>
                  <td>{department.name}</td>
                  <td>{department.manager || '-'}</td>
                  <td>{department.phone || '-'}</td>
                  <td>
                    <button className="btn-edit" onClick={() => handleEdit(department)}>Sửa</button>
                    <button className="btn-delete" onClick={() => handleDelete(department.id)}>Xóa</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => { setShowModal(false); resetForm(); }}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>{editingDepartment ? 'Sửa Bộ Phận' : 'Thêm Bộ Phận'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Tên Bộ Phận *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Mã Bộ Phận</label>
                  <input
                    type="text"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Trưởng Bộ Phận</label>
                  <input
                    type="text"
                    value={formData.manager}
                    onChange={(e) => setFormData({ ...formData, manager: e.target.value })}
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Điện Thoại</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Mô Tả</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows="3"
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

export default Departments;

