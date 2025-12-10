const express = require('express');
const router = express.Router();
const pool = require('../db');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);

// Thống kê phân công theo tháng
router.get('/assignments-by-month', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        TO_CHAR(assign_date, 'YYYY-MM') as month,
        COUNT(*)::INTEGER as count
      FROM worker_assignments
      GROUP BY TO_CHAR(assign_date, 'YYYY-MM')
      ORDER BY month
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Thống kê chấm công theo tháng
router.get('/attendance-by-month', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        TO_CHAR(attendance_date, 'YYYY-MM') as month,
        COUNT(*)::INTEGER as count,
        COUNT(CASE WHEN status = 'present' THEN 1 END)::INTEGER as present_count,
        COUNT(CASE WHEN status = 'absent' THEN 1 END)::INTEGER as absent_count,
        COUNT(CASE WHEN status = 'leave' THEN 1 END)::INTEGER as leave_count
      FROM attendance
      GROUP BY TO_CHAR(attendance_date, 'YYYY-MM')
      ORDER BY month
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Thống kê nhân công theo bộ phận
router.get('/workers-by-department', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        COALESCE(d.name, 'Chưa phân bộ phận') as department_name,
        COUNT(*)::INTEGER as count
      FROM workers w
      LEFT JOIN departments d ON w.department_id = d.id
      GROUP BY d.name
      ORDER BY count DESC
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Thống kê nhân công theo trạng thái
router.get('/workers-by-status', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        COALESCE(status, 'active') as status,
        COUNT(*)::INTEGER as count
      FROM workers
      GROUP BY status
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Thống kê nhân công theo công trình
router.get('/workers-by-project', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        COALESCE(p.name, 'Chưa phân công') as project_name,
        COUNT(DISTINCT wa.worker_id)::INTEGER as worker_count
      FROM worker_assignments wa
      LEFT JOIN projects p ON wa.project_id = p.id
      WHERE wa.end_date IS NULL
      GROUP BY p.name
      ORDER BY worker_count DESC
      LIMIT 10
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Top nhân công làm việc nhiều nhất
router.get('/top-workers', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        w.code,
        w.full_name,
        w.position,
        COUNT(DISTINCT a.id)::INTEGER as attendance_count,
        COALESCE(SUM(a.work_hours), 0)::DECIMAL as total_hours
      FROM workers w
      LEFT JOIN attendance a ON w.id = a.worker_id
      WHERE a.status = 'present'
      GROUP BY w.id, w.code, w.full_name, w.position
      ORDER BY attendance_count DESC, total_hours DESC
      LIMIT 10
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Thống kê tỷ lệ chấm công
router.get('/attendance-rate', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        status,
        COUNT(*)::INTEGER as count,
        ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 2)::DECIMAL as percentage
      FROM attendance
      GROUP BY status
      ORDER BY count DESC
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Thống kê giờ làm việc theo tháng
router.get('/work-hours-by-month', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        TO_CHAR(attendance_date, 'YYYY-MM') as month,
        COUNT(*)::INTEGER as record_count,
        COALESCE(SUM(work_hours), 0)::DECIMAL as total_hours,
        COALESCE(AVG(work_hours), 0)::DECIMAL as avg_hours
      FROM attendance
      WHERE status = 'present'
      GROUP BY TO_CHAR(attendance_date, 'YYYY-MM')
      ORDER BY month
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

