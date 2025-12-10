import React, { useEffect, useState } from 'react';
import api from '../services/api';
import './CommonPages.css';

const Assignments = () => {
  const [assignments, setAssignments] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState(null);
  const [formData, setFormData] = useState({
    worker_id: '',
    project_id: '',
    assign_date: new Date().toISOString().split('T')[0],
    end_date: '',
    assigned_by: '',
    notes: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [assignmentsRes, workersRes, projectsRes] = await Promise.all([
        api.get('/assignments'),
        api.get('/workers'),
        api.get('/projects'),
      ]);
      setAssignments(assignmentsRes.data);
      setWorkers(workersRes.data);
      setProjects(projectsRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingAssignment) {
        await api.put(`/assignments/${editingAssignment.id}`, formData);
      } else {
        await api.post('/assignments', formData);
      }
      fetchData();
      setShowModal(false);
      resetForm();
    } catch (error) {
      alert('Lỗi: ' + (error.response?.data?.error || error.message));
    }
  };

  const handleEdit = (assignment) => {
    setEditingAssignment(assignment);
    setFormData({
      worker_id: assignment.worker_id || '',
      project_id: assignment.project_id || '',
      assign_date: assignment.assign_date || new Date().toISOString().split('T')[0],
      end_date: assignment.end_date || '',
      assigned_by: assignment.assigned_by || '',
      notes: assignment.notes || '',
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Bạn có chắc muốn xóa phân công này?')) {
      try {
        await api.delete(`/assignments/${id}`);
        fetchData();
      } catch (error) {
        alert('Lỗi: ' + (error.response?.data?.error || error.message));
      }
    }
  };

  const resetForm = () => {
    setFormData({
      worker_id: '',
      project_id: '',
      assign_date: new Date().toISOString().split('T')[0],
      end_date: '',
      assigned_by: '',
      notes: '',
    });
    setEditingAssignment(null);
  };

  if (loading) {
    return <div className="page-loading">Đang tải...</div>;
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Quản Lý Phân Công Nhân Công</h1>
        <button className="btn-primary" onClick={() => { resetForm(); setShowModal(true); }}>
          + Phân Công Nhân Công
        </button>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Mã Nhân Công</th>
              <th>Tên Nhân Công</th>
              <th>Công Trình</th>
              <th>Ngày Phân Công</th>
              <th>Ngày Kết Thúc</th>
              <th>Người Phân Công</th>
              <th>Thao Tác</th>
            </tr>
          </thead>
          <tbody>
            {assignments.length === 0 ? (
              <tr>
                <td colSpan="7" className="empty-state">Chưa có dữ liệu</td>
              </tr>
            ) : (
              assignments.map((assignment) => (
                <tr key={assignment.id}>
                  <td>{assignment.worker_code}</td>
                  <td>{assignment.worker_name}</td>
                  <td>{assignment.project_name || '-'}</td>
                  <td>{assignment.assign_date}</td>
                  <td>{assignment.end_date || <span style={{ color: '#e74c3c' }}>Đang làm việc</span>}</td>
                  <td>{assignment.assigned_by || '-'}</td>
                  <td>
                    <button className="btn-edit" onClick={() => handleEdit(assignment)}>Sửa</button>
                    <button className="btn-delete" onClick={() => handleDelete(assignment.id)}>Xóa</button>
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
            <h2>{editingAssignment ? 'Sửa Phân Công' : 'Phân Công Nhân Công'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Nhân Công *</label>
                <select
                  value={formData.worker_id}
                  onChange={(e) => setFormData({ ...formData, worker_id: e.target.value })}
                  required
                >
                  <option value="">Chọn nhân công</option>
                  {workers.filter(w => w.status === 'active').map((worker) => (
                    <option key={worker.id} value={worker.id}>
                      {worker.code} - {worker.full_name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Công Trình *</label>
                <select
                  value={formData.project_id}
                  onChange={(e) => setFormData({ ...formData, project_id: e.target.value })}
                  required
                >
                  <option value="">Chọn công trình</option>
                  {projects.map((project) => (
                    <option key={project.id} value={project.id}>
                      {project.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Ngày Phân Công</label>
                  <input
                    type="date"
                    value={formData.assign_date}
                    onChange={(e) => setFormData({ ...formData, assign_date: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Ngày Kết Thúc</label>
                  <input
                    type="date"
                    value={formData.end_date}
                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Người Phân Công</label>
                <input
                  type="text"
                  value={formData.assigned_by}
                  onChange={(e) => setFormData({ ...formData, assigned_by: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Ghi Chú</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
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

export default Assignments;

