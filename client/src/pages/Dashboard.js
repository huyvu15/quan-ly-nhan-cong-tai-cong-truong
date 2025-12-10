import React, { useEffect, useState } from 'react';
import {
  BarChart,
  Bar,
  AreaChart,
  Area,
  ComposedChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  RadialBarChart,
  RadialBar
} from 'recharts';
import api from '../services/api';
import './Dashboard.css';

const Dashboard = () => {
  const [stats, setStats] = useState({
    projects: 0,
    workers: 0,
    departments: 0,
    assignments: 0,
    attendance: 0,
    activeWorkers: 0,
  });
  const [attendanceByMonth, setAttendanceByMonth] = useState([]);
  const [assignmentsByMonth, setAssignmentsByMonth] = useState([]);
  const [workersByDepartment, setWorkersByDepartment] = useState([]);
  const [workersByStatus, setWorkersByStatus] = useState([]);
  const [workersByProject, setWorkersByProject] = useState([]);
  const [topWorkers, setTopWorkers] = useState([]);
  const [attendanceRate, setAttendanceRate] = useState([]);
  const [workHoursByMonth, setWorkHoursByMonth] = useState([]);
  const [loading, setLoading] = useState(true);

  const COLORS = ['#ec4899', '#f472b6', '#f9a8d4', '#fbcfe8', '#fce7f3', '#fda4af', '#fb7185', '#f43f5e', '#e11d48', '#be185d'];

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [
        projectsRes,
        workersRes,
        departmentsRes,
        assignmentsRes,
        attendanceRes,
        assignmentsByMonthRes,
        attendanceByMonthRes,
        workersByDepartmentRes,
        workersByStatusRes,
        workersByProjectRes,
        topWorkersRes,
        attendanceRateRes,
        workHoursByMonthRes
      ] = await Promise.all([
        api.get('/projects'),
        api.get('/workers'),
        api.get('/departments'),
        api.get('/assignments'),
        api.get('/attendance'),
        api.get('/stats/assignments-by-month'),
        api.get('/stats/attendance-by-month'),
        api.get('/stats/workers-by-department'),
        api.get('/stats/workers-by-status'),
        api.get('/stats/workers-by-project'),
        api.get('/stats/top-workers'),
        api.get('/stats/attendance-rate'),
        api.get('/stats/work-hours-by-month'),
      ]);

      const activeWorkers = workersRes.data.filter(w => w.status === 'active').length;

      setStats({
        projects: projectsRes.data.length,
        workers: workersRes.data.length,
        departments: departmentsRes.data.length,
        assignments: assignmentsRes.data.length,
        attendance: attendanceRes.data.length,
        activeWorkers,
      });

      setAttendanceByMonth((attendanceByMonthRes.data || []).map(item => ({
        month: item.month,
        present: typeof item.present_count === 'string' ? parseInt(item.present_count) : (item.present_count || 0),
        absent: typeof item.absent_count === 'string' ? parseInt(item.absent_count) : (item.absent_count || 0),
        leave: typeof item.leave_count === 'string' ? parseInt(item.leave_count) : (item.leave_count || 0),
      })));

      setAssignmentsByMonth((assignmentsByMonthRes.data || []).map(item => ({
        month: item.month,
        count: typeof item.count === 'string' ? parseInt(item.count) : (item.count || 0)
      })));

      setWorkersByDepartment((workersByDepartmentRes.data || []).map(item => ({
        department: item.department_name,
        count: typeof item.count === 'string' ? parseInt(item.count) : (item.count || 0),
        name: item.department_name
      })));

      setWorkersByStatus((workersByStatusRes.data || []).map(item => ({
        status: item.status,
        count: typeof item.count === 'string' ? parseInt(item.count) : (item.count || 0)
      })));

      setWorkersByProject((workersByProjectRes.data || []).map(item => ({
        ...item,
        worker_count: typeof item.worker_count === 'string' ? parseInt(item.worker_count) : (item.worker_count || 0)
      })));

      setTopWorkers((topWorkersRes.data || []).map(item => ({
        ...item,
        attendance_count: typeof item.attendance_count === 'string' ? parseInt(item.attendance_count) : (item.attendance_count || 0),
        total_hours: typeof item.total_hours === 'string' ? parseFloat(item.total_hours) : (item.total_hours || 0),
        name: item.full_name || item.code
      })));

      setAttendanceRate((attendanceRateRes.data || []).map(item => ({
        ...item,
        count: typeof item.count === 'string' ? parseInt(item.count) : (item.count || 0),
        percentage: typeof item.percentage === 'string' ? parseFloat(item.percentage) : (item.percentage || 0)
      })));

      setWorkHoursByMonth((workHoursByMonthRes.data || []).map(item => ({
        month: item.month,
        total_hours: typeof item.total_hours === 'string' ? parseFloat(item.total_hours) : (item.total_hours || 0),
        avg_hours: typeof item.avg_hours === 'string' ? parseFloat(item.avg_hours) : (item.avg_hours || 0)
      })));
    } catch (error) {
      console.error('Error fetching stats:', error);
      setAttendanceByMonth([]);
      setAssignmentsByMonth([]);
      setWorkersByDepartment([]);
      setWorkersByStatus([]);
      setWorkersByProject([]);
      setTopWorkers([]);
      setAttendanceRate([]);
      setWorkHoursByMonth([]);
    } finally {
      setLoading(false);
    }
  };

  const formatMonth = (month) => {
    if (!month) return '';
    const [year, mon] = month.split('-');
    return `${mon}/${year}`;
  };

  const getStatusLabel = (status) => {
    const labels = {
      'active': 'Đang làm việc',
      'on_leave': 'Nghỉ phép',
      'resigned': 'Nghỉ việc'
    };
    return labels[status] || status;
  };

  const getAttendanceStatusLabel = (status) => {
    const labels = {
      'present': 'Có mặt',
      'absent': 'Vắng mặt',
      'leave': 'Nghỉ phép'
    };
    return labels[status] || status;
  };

  if (loading) {
    return <div className="dashboard-loading">Đang tải...</div>;
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Dashboard</h1>
        <p>Tổng quan hệ thống quản lý nhân công tại công trường</p>
      </div>
      
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">🏗️</div>
          <div className="stat-info">
            <h3>{stats.projects}</h3>
            <p>Công Trình</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">👷</div>
          <div className="stat-info">
            <h3>{stats.workers}</h3>
            <p>Nhân Công</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🏢</div>
          <div className="stat-info">
            <h3>{stats.departments}</h3>
            <p>Bộ Phận</p>
          </div>
        </div>
        <div className="stat-card warning">
          <div className="stat-icon">✅</div>
          <div className="stat-info">
            <h3>{stats.activeWorkers}</h3>
            <p>Nhân Công Đang Làm Việc</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📋</div>
          <div className="stat-info">
            <h3>{stats.assignments}</h3>
            <p>Phân Công</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">⏰</div>
          <div className="stat-info">
            <h3>{stats.attendance}</h3>
            <p>Chấm Công</p>
          </div>
        </div>
      </div>

      <div className="charts-grid">
        {/* Chart 1: Area Chart - Chấm công theo tháng */}
        <div className="chart-card">
          <h3>Chấm Công Theo Tháng</h3>
          {attendanceByMonth.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={attendanceByMonth.map(item => ({
                month: formatMonth(item.month),
                'Có mặt': item.present,
                'Vắng mặt': item.absent,
                'Nghỉ phép': item.leave,
              }))}>
                <defs>
                  <linearGradient id="colorPresent" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ec4899" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#ec4899" stopOpacity={0.1}/>
                  </linearGradient>
                  <linearGradient id="colorAbsent" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f472b6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#f472b6" stopOpacity={0.1}/>
                  </linearGradient>
                  <linearGradient id="colorLeave" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f9a8d4" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#f9a8d4" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#fce7f3" />
                <XAxis dataKey="month" stroke="#831843" />
                <YAxis stroke="#831843" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '1px solid #fce7f3',
                    borderRadius: '10px',
                    boxShadow: '0 4px 15px rgba(236, 72, 153, 0.1)'
                  }} 
                />
                <Legend />
                <Area type="monotone" dataKey="Có mặt" stroke="#ec4899" fillOpacity={1} fill="url(#colorPresent)" />
                <Area type="monotone" dataKey="Vắng mặt" stroke="#f472b6" fillOpacity={1} fill="url(#colorAbsent)" />
                <Area type="monotone" dataKey="Nghỉ phép" stroke="#f9a8d4" fillOpacity={1} fill="url(#colorLeave)" />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="chart-empty">Chưa có dữ liệu</div>
          )}
        </div>

        {/* Chart 2: Composed Chart - Giờ làm việc theo tháng */}
        <div className="chart-card">
          <h3>Giờ Làm Việc Theo Tháng</h3>
          {workHoursByMonth.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <ComposedChart data={workHoursByMonth.map(item => ({
                month: formatMonth(item.month),
                'Tổng giờ': item.total_hours || 0,
                'Trung bình': item.avg_hours || 0,
              }))}>
                <CartesianGrid strokeDasharray="3 3" stroke="#fce7f3" />
                <XAxis dataKey="month" stroke="#831843" />
                <YAxis yAxisId="left" stroke="#831843" />
                <YAxis yAxisId="right" orientation="right" stroke="#831843" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '1px solid #fce7f3',
                    borderRadius: '10px',
                    boxShadow: '0 4px 15px rgba(236, 72, 153, 0.1)'
                  }}
                />
                <Legend />
                <Bar yAxisId="left" dataKey="Tổng giờ" fill="#ec4899" radius={[8, 8, 0, 0]} />
                <Line yAxisId="right" type="monotone" dataKey="Trung bình" stroke="#f472b6" strokeWidth={3} dot={{ fill: '#f472b6', r: 5 }} />
              </ComposedChart>
            </ResponsiveContainer>
          ) : (
            <div className="chart-empty">Chưa có dữ liệu</div>
          )}
        </div>

        {/* Chart 3: Pie Chart - Nhân công theo bộ phận */}
        <div className="chart-card">
          <h3>Phân Bố Nhân Công Theo Bộ Phận</h3>
          {workersByDepartment.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={workersByDepartment}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={90}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {workersByDepartment.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '1px solid #fce7f3',
                    borderRadius: '10px',
                    boxShadow: '0 4px 15px rgba(236, 72, 153, 0.1)'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="chart-empty">Chưa có dữ liệu</div>
          )}
        </div>

        {/* Chart 4: Radial Bar Chart - Nhân công theo trạng thái */}
        <div className="chart-card">
          <h3>Nhân Công Theo Trạng Thái</h3>
          {workersByStatus.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <RadialBarChart cx="50%" cy="50%" innerRadius="40%" outerRadius="80%" data={workersByStatus.map((item, index) => ({
                name: getStatusLabel(item.status),
                value: item.count,
                fill: COLORS[index % COLORS.length]
              }))}>
                <RadialBar dataKey="value" cornerRadius={10} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '1px solid #fce7f3',
                    borderRadius: '10px',
                    boxShadow: '0 4px 15px rgba(236, 72, 153, 0.1)'
                  }}
                />
                <Legend 
                  iconSize={12}
                  wrapperStyle={{ paddingTop: '20px' }}
                />
              </RadialBarChart>
            </ResponsiveContainer>
          ) : (
            <div className="chart-empty">Chưa có dữ liệu</div>
          )}
        </div>

        {/* Chart 5: Bar Chart - Nhân công theo công trình */}
        <div className="chart-card">
          <h3>Nhân Công Theo Công Trình</h3>
          {workersByProject.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={workersByProject}>
                <defs>
                  <linearGradient id="colorProject" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ec4899" stopOpacity={0.9}/>
                    <stop offset="95%" stopColor="#f472b6" stopOpacity={0.9}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#fce7f3" />
                <XAxis dataKey="project_name" angle={-45} textAnchor="end" height={100} stroke="#831843" />
                <YAxis stroke="#831843" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '1px solid #fce7f3',
                    borderRadius: '10px',
                    boxShadow: '0 4px 15px rgba(236, 72, 153, 0.1)'
                  }}
                />
                <Bar dataKey="worker_count" fill="url(#colorProject)" name="Số nhân công" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="chart-empty">Chưa có dữ liệu</div>
          )}
        </div>

        {/* Chart 6: Horizontal Bar Chart - Top nhân công */}
        <div className="chart-card">
          <h3>Top 10 Nhân Công Làm Việc Nhiều Nhất</h3>
          {topWorkers.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={topWorkers.slice(0, 10)} layout="vertical">
                <defs>
                  <linearGradient id="colorTop" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="5%" stopColor="#f472b6" stopOpacity={0.9}/>
                    <stop offset="95%" stopColor="#f9a8d4" stopOpacity={0.9}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#fce7f3" />
                <XAxis type="number" stroke="#831843" />
                <YAxis dataKey="name" type="category" width={150} stroke="#831843" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '1px solid #fce7f3',
                    borderRadius: '10px',
                    boxShadow: '0 4px 15px rgba(236, 72, 153, 0.1)'
                  }}
                />
                <Bar dataKey="attendance_count" fill="url(#colorTop)" name="Số ngày làm việc" radius={[0, 8, 8, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="chart-empty">Chưa có dữ liệu</div>
          )}
        </div>

        {/* Chart 7: Pie Chart - Tỷ lệ chấm công */}
        <div className="chart-card">
          <h3>Tỷ Lệ Chấm Công</h3>
          {attendanceRate.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={attendanceRate}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ status, percentage }) => `${getAttendanceStatusLabel(status)}: ${percentage.toFixed(1)}%`}
                  outerRadius={90}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {attendanceRate.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '1px solid #fce7f3',
                    borderRadius: '10px',
                    boxShadow: '0 4px 15px rgba(236, 72, 153, 0.1)'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="chart-empty">Chưa có dữ liệu</div>
          )}
        </div>

        {/* Chart 8: Bar Chart - Phân công theo tháng */}
        <div className="chart-card">
          <h3>Phân Công Theo Tháng</h3>
          {assignmentsByMonth.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={assignmentsByMonth.map(item => ({
                month: formatMonth(item.month),
                'Số lượng': item.count || 0,
              }))}>
                <defs>
                  <linearGradient id="colorAssignments" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f9a8d4" stopOpacity={0.9}/>
                    <stop offset="95%" stopColor="#fbcfe8" stopOpacity={0.9}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#fce7f3" />
                <XAxis dataKey="month" stroke="#831843" />
                <YAxis stroke="#831843" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '1px solid #fce7f3',
                    borderRadius: '10px',
                    boxShadow: '0 4px 15px rgba(236, 72, 153, 0.1)'
                  }}
                />
                <Bar dataKey="Số lượng" fill="url(#colorAssignments)" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="chart-empty">Chưa có dữ liệu</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

