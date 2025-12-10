import React, { useEffect, useState } from 'react';
import api from '../services/api';
import './CommonPages.css';

const Attendance = () => {
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [formData, setFormData] = useState({
    worker_id: '',
    project_id: '',
    attendance_date: new Date().toISOString().split('T')[0],
    check_in_time: '',
    check_out_time: '',
    work_hours: '',
    status: 'present',
    notes: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [attendanceRes, workersRes, projectsRes] = await Promise.all([
        api.get('/attendance'),
        api.get('/workers'),
        api.get('/projects'),
      ]);
      setAttendanceRecords(attendanceRes.data);
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
      if (editingRecord) {
        await api.put(`/attendance/${editingRecord.id}`, formData);
      } else {
        await api.post('/attendance', { ...formData, created_by: 'admin' });
      }
      fetchData();
      setShowModal(false);
      resetForm();
    } catch (error) {
      alert('Lỗi: ' + (error.response?.data?.error || error.message));
    }
  };

  const handleEdit = (record) => {
    setEditingRecord(record);
    setFormData({
      worker_id: record.worker_id || '',
      project_id: record.project_id || '',
      attendance_date: record.attendance_date || new Date().toISOString().split('T')[0],
      check_in_time: record.check_in_time || '',
      check_out_time: record.check_out_time || '',
      work_hours: record.work_hours || '',
      status: record.status || 'present',
      notes: record.notes || '',
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Bạn có chắc muốn xóa bản ghi chấm công này?')) {
      try {
        await api.delete(`/attendance/${id}`);
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
      attendance_date: new Date().toISOString().split('T')[0],
      check_in_time: '',
      check_out_time: '',
      work_hours: '',
      status: 'present',
      notes: '',
    });
    setEditingRecord(null);
  };

  const getStatusLabel = (status) => {
    const labels = {
      'present': 'Có mặt',
      'absent': 'Vắng mặt',
      'leave': 'Nghỉ phép'
    };
    return labels[status] || status;
  };

  if (loading) {
    return <div className="page-loading">Đang tải...</div>;
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Quản Lý Chấm Công</h1>
        <button className="btn-primary" onClick={() => { resetForm(); setShowModal(true); }}>
          + Thêm Chấm Công
        </button>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Mã Nhân Công</th>
              <th>Tên Nhân Công</th>
              <th>Công Trình</th>
              <th>Ngày</th>
              <th>Giờ Vào</th>
              <th>Giờ Ra</th>
              <th>Giờ Làm</th>
              <th>Trạng Thái</th>
              <th>Thao Tác</th>
            </tr>
          </thead>
          <tbody>
            {attendanceRecords.length === 0 ? (
              <tr>
                <td colSpan="9" className="empty-state">Chưa có dữ liệu</td>
              </tr>
            ) : (
              attendanceRecords.map((record) => (
                <tr key={record.id}>
                  <td>{record.worker_code}</td>
                  <td>{record.worker_name}</td>
                  <td>{record.project_name || '-'}</td>
                  <td>{record.attendance_date}</td>
                  <td>{record.check_in_time || '-'}</td>
                  <td>{record.check_out_time || '-'}</td>
                  <td>{record.work_hours ? `${record.work_hours}h` : '-'}</td>
                  <td>
                    <span className={`status-badge ${record.status}`}>
                      {getStatusLabel(record.status)}
                    </span>
                  </td>
                  <td>
                    <button className="btn-edit" onClick={() => handleEdit(record)}>Sửa</button>
                    <button className="btn-delete" onClick={() => handleDelete(record.id)}>Xóa</button>
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
            <h2>{editingRecord ? 'Sửa Chấm Công' : 'Thêm Chấm Công'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Nhân Công *</label>
                <select
                  value={formData.worker_id}
                  onChange={(e) => setFormData({ ...formData, worker_id: e.target.value })}
                  required
                >
                  <option value="">Chọn nhân công</option>
                  {workers.map((worker) => (
                    <option key={worker.id} value={worker.id}>
                      {worker.code} - {worker.full_name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Công Trình</label>
                <select
                  value={formData.project_id}
                  onChange={(e) => setFormData({ ...formData, project_id: e.target.value })}
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
                  <label>Ngày Chấm Công</label>
                  <input
                    type="date"
                    value={formData.attendance_date}
                    onChange={(e) => setFormData({ ...formData, attendance_date: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Trạng Thái</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  >
                    <option value="present">Có mặt</option>
                    <option value="absent">Vắng mặt</option>
                    <option value="leave">Nghỉ phép</option>
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Giờ Vào</label>
                  <input
                    type="time"
                    value={formData.check_in_time}
                    onChange={(e) => setFormData({ ...formData, check_in_time: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Giờ Ra</label>
                  <input
                    type="time"
                    value={formData.check_out_time}
                    onChange={(e) => setFormData({ ...formData, check_out_time: e.target.value })}
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Giờ Làm Việc</label>
                <input
                  type="number"
                  step="0.5"
                  value={formData.work_hours}
                  onChange={(e) => setFormData({ ...formData, work_hours: e.target.value })}
                  placeholder="Tự động tính nếu có giờ vào/ra"
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

export default Attendance;

