const express = require('express');
const router = express.Router();
const pool = require('../db');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);

router.get('/', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        wa.*,
        w.code as worker_code,
        w.full_name as worker_name,
        p.name as project_name
      FROM worker_assignments wa
      LEFT JOIN workers w ON wa.worker_id = w.id
      LEFT JOIN projects p ON wa.project_id = p.id
      ORDER BY wa.assign_date DESC
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching assignments:', error);
    res.status(500).json({ error: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        wa.*,
        w.code as worker_code,
        w.full_name as worker_name,
        p.name as project_name
      FROM worker_assignments wa
      LEFT JOIN workers w ON wa.worker_id = w.id
      LEFT JOIN projects p ON wa.project_id = p.id
      WHERE wa.id = $1
    `, [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Assignment not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { worker_id, project_id, assign_date, end_date, assigned_by, notes } = req.body;
    const result = await pool.query(
      `INSERT INTO worker_assignments (worker_id, project_id, assign_date, end_date, assigned_by, notes)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [worker_id, project_id, assign_date || new Date().toISOString().split('T')[0], end_date || null, assigned_by, notes]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { worker_id, project_id, assign_date, end_date, assigned_by, notes } = req.body;
    const result = await pool.query(
      `UPDATE worker_assignments SET worker_id = $1, project_id = $2, assign_date = $3, 
       end_date = $4, assigned_by = $5, notes = $6
       WHERE id = $7 RETURNING *`,
      [worker_id, project_id, assign_date, end_date, assigned_by, notes, req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Assignment not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM worker_assignments WHERE id = $1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Assignment not found' });
    }
    res.json({ message: 'Assignment deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

