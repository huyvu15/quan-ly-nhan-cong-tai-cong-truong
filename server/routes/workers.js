const express = require('express');
const router = express.Router();
const pool = require('../db');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);

router.get('/', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT w.*, d.name as department_name 
      FROM workers w
      LEFT JOIN departments d ON w.department_id = d.id
      ORDER BY COALESCE(w.code, w.full_name)
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching workers:', error);
    res.status(500).json({ error: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT w.*, d.name as department_name 
      FROM workers w
      LEFT JOIN departments d ON w.department_id = d.id
      WHERE w.id = $1
    `, [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Worker not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { code, full_name, id_card, phone, email, address, date_of_birth, gender, department_id, position, hire_date, salary, status, notes } = req.body;
    const result = await pool.query(
      `INSERT INTO workers (code, full_name, id_card, phone, email, address, date_of_birth, gender, department_id, position, hire_date, salary, status, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14) RETURNING *`,
      [code, full_name, id_card, phone, email, address, date_of_birth, gender, department_id || null, position, hire_date, salary || null, status || 'active', notes]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    if (error.code === '23505') {
      return res.status(400).json({ error: 'Worker code already exists' });
    }
    res.status(500).json({ error: error.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { code, full_name, id_card, phone, email, address, date_of_birth, gender, department_id, position, hire_date, salary, status, notes } = req.body;
    const result = await pool.query(
      `UPDATE workers SET code = $1, full_name = $2, id_card = $3, phone = $4, email = $5, address = $6, 
       date_of_birth = $7, gender = $8, department_id = $9, position = $10, hire_date = $11, 
       salary = $12, status = $13, notes = $14, updated_at = CURRENT_TIMESTAMP
       WHERE id = $15 RETURNING *`,
      [code, full_name, id_card, phone, email, address, date_of_birth, gender, department_id || null, position, hire_date, salary, status, notes, req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Worker not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM workers WHERE id = $1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Worker not found' });
    }
    res.json({ message: 'Worker deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

