const express = require('express');
const router = express.Router();
const pool = require('../db');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);

router.get('/', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        a.*,
        w.code as worker_code,
        w.full_name as worker_name,
        p.name as project_name
      FROM attendance a
      LEFT JOIN workers w ON a.worker_id = w.id
      LEFT JOIN projects p ON a.project_id = p.id
      ORDER BY a.attendance_date DESC, a.check_in_time DESC
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching attendance:', error);
    res.status(500).json({ error: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        a.*,
        w.code as worker_code,
        w.full_name as worker_name,
        p.name as project_name
      FROM attendance a
      LEFT JOIN workers w ON a.worker_id = w.id
      LEFT JOIN projects p ON a.project_id = p.id
      WHERE a.id = $1
    `, [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Attendance record not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { worker_id, project_id, attendance_date, check_in_time, check_out_time, work_hours, status, notes, created_by } = req.body;
    
    // Tính toán work_hours nếu có check_in và check_out
    let calculatedHours = work_hours;
    if (check_in_time && check_out_time && !work_hours) {
      const checkIn = new Date(`${attendance_date}T${check_in_time}`);
      const checkOut = new Date(`${attendance_date}T${check_out_time}`);
      calculatedHours = (checkOut - checkIn) / (1000 * 60 * 60); // Convert to hours
    }
    
    const result = await pool.query(
      `INSERT INTO attendance (worker_id, project_id, attendance_date, check_in_time, check_out_time, work_hours, status, notes, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
      [worker_id, project_id || null, attendance_date || new Date().toISOString().split('T')[0], check_in_time || null, check_out_time || null, calculatedHours || null, status || 'present', notes, created_by]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { worker_id, project_id, attendance_date, check_in_time, check_out_time, work_hours, status, notes } = req.body;
    
    // Tính toán work_hours nếu có check_in và check_out
    let calculatedHours = work_hours;
    if (check_in_time && check_out_time && !work_hours) {
      const checkIn = new Date(`${attendance_date}T${check_in_time}`);
      const checkOut = new Date(`${attendance_date}T${check_out_time}`);
      calculatedHours = (checkOut - checkIn) / (1000 * 60 * 60);
    }
    
    const result = await pool.query(
      `UPDATE attendance SET worker_id = $1, project_id = $2, attendance_date = $3, 
       check_in_time = $4, check_out_time = $5, work_hours = $6, status = $7, notes = $8
       WHERE id = $9 RETURNING *`,
      [worker_id, project_id || null, attendance_date, check_in_time || null, check_out_time || null, calculatedHours || null, status, notes, req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Attendance record not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM attendance WHERE id = $1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Attendance record not found' });
    }
    res.json({ message: 'Attendance record deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

