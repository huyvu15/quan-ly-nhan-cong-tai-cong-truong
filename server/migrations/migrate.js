const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });
const pool = require('../db');

const createTables = async () => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');

    // Bảng công trình
    await client.query(`
      CREATE TABLE IF NOT EXISTS projects (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        location VARCHAR(255),
        start_date DATE,
        end_date DATE,
        status VARCHAR(50) DEFAULT 'active',
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    await client.query(`
      DO $$ 
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='projects' AND column_name='location') THEN
          ALTER TABLE projects ADD COLUMN location VARCHAR(255);
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='projects' AND column_name='start_date') THEN
          ALTER TABLE projects ADD COLUMN start_date DATE;
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='projects' AND column_name='end_date') THEN
          ALTER TABLE projects ADD COLUMN end_date DATE;
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='projects' AND column_name='status') THEN
          ALTER TABLE projects ADD COLUMN status VARCHAR(50) DEFAULT 'active';
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='projects' AND column_name='description') THEN
          ALTER TABLE projects ADD COLUMN description TEXT;
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='projects' AND column_name='created_at') THEN
          ALTER TABLE projects ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='projects' AND column_name='updated_at') THEN
          ALTER TABLE projects ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
        END IF;
      END $$;
    `);

    // Bảng bộ phận/phòng ban
    await client.query(`
      CREATE TABLE IF NOT EXISTS departments (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        code VARCHAR(50) UNIQUE,
        manager VARCHAR(255),
        phone VARCHAR(50),
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    await client.query(`
      DO $$ 
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='departments' AND column_name='code') THEN
          ALTER TABLE departments ADD COLUMN code VARCHAR(50);
          CREATE UNIQUE INDEX IF NOT EXISTS departments_code_unique ON departments(code);
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='departments' AND column_name='manager') THEN
          ALTER TABLE departments ADD COLUMN manager VARCHAR(255);
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='departments' AND column_name='phone') THEN
          ALTER TABLE departments ADD COLUMN phone VARCHAR(50);
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='departments' AND column_name='description') THEN
          ALTER TABLE departments ADD COLUMN description TEXT;
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='departments' AND column_name='created_at') THEN
          ALTER TABLE departments ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='departments' AND column_name='updated_at') THEN
          ALTER TABLE departments ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
        END IF;
      END $$;
    `);

    // Bảng nhân công
    await client.query(`
      CREATE TABLE IF NOT EXISTS workers (
        id SERIAL PRIMARY KEY,
        code VARCHAR(100) UNIQUE NOT NULL,
        full_name VARCHAR(255) NOT NULL,
        id_card VARCHAR(50),
        phone VARCHAR(50),
        email VARCHAR(255),
        address TEXT,
        date_of_birth DATE,
        gender VARCHAR(10),
        department_id INTEGER REFERENCES departments(id) ON DELETE SET NULL,
        position VARCHAR(100),
        hire_date DATE,
        salary DECIMAL(15,2),
        status VARCHAR(50) DEFAULT 'active',
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    await client.query(`
      DO $$ 
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='workers' AND column_name='code') THEN
          ALTER TABLE workers ADD COLUMN code VARCHAR(100);
          CREATE UNIQUE INDEX IF NOT EXISTS workers_code_unique ON workers(code);
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='workers' AND column_name='id_card') THEN
          ALTER TABLE workers ADD COLUMN id_card VARCHAR(50);
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='workers' AND column_name='phone') THEN
          ALTER TABLE workers ADD COLUMN phone VARCHAR(50);
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='workers' AND column_name='email') THEN
          ALTER TABLE workers ADD COLUMN email VARCHAR(255);
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='workers' AND column_name='address') THEN
          ALTER TABLE workers ADD COLUMN address TEXT;
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='workers' AND column_name='date_of_birth') THEN
          ALTER TABLE workers ADD COLUMN date_of_birth DATE;
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='workers' AND column_name='gender') THEN
          ALTER TABLE workers ADD COLUMN gender VARCHAR(10);
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='workers' AND column_name='department_id') THEN
          ALTER TABLE workers ADD COLUMN department_id INTEGER REFERENCES departments(id) ON DELETE SET NULL;
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='workers' AND column_name='position') THEN
          ALTER TABLE workers ADD COLUMN position VARCHAR(100);
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='workers' AND column_name='hire_date') THEN
          ALTER TABLE workers ADD COLUMN hire_date DATE;
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='workers' AND column_name='salary') THEN
          ALTER TABLE workers ADD COLUMN salary DECIMAL(15,2);
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='workers' AND column_name='status') THEN
          ALTER TABLE workers ADD COLUMN status VARCHAR(50) DEFAULT 'active';
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='workers' AND column_name='notes') THEN
          ALTER TABLE workers ADD COLUMN notes TEXT;
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='workers' AND column_name='created_at') THEN
          ALTER TABLE workers ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='workers' AND column_name='updated_at') THEN
          ALTER TABLE workers ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
        END IF;
      END $$;
    `);

    // Bảng phân công nhân công vào công trình
    await client.query(`
      CREATE TABLE IF NOT EXISTS worker_assignments (
        id SERIAL PRIMARY KEY,
        worker_id INTEGER NOT NULL REFERENCES workers(id) ON DELETE CASCADE,
        project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
        assign_date DATE NOT NULL DEFAULT CURRENT_DATE,
        end_date DATE,
        assigned_by VARCHAR(100),
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Bảng chấm công
    await client.query(`
      CREATE TABLE IF NOT EXISTS attendance (
        id SERIAL PRIMARY KEY,
        worker_id INTEGER NOT NULL REFERENCES workers(id) ON DELETE CASCADE,
        project_id INTEGER REFERENCES projects(id) ON DELETE SET NULL,
        attendance_date DATE NOT NULL DEFAULT CURRENT_DATE,
        check_in_time TIME,
        check_out_time TIME,
        work_hours DECIMAL(5,2),
        status VARCHAR(50) DEFAULT 'present',
        notes TEXT,
        created_by VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Tạo indexes
    await client.query(`CREATE INDEX IF NOT EXISTS idx_worker_assignments_worker ON worker_assignments(worker_id)`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_worker_assignments_project ON worker_assignments(project_id)`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_attendance_worker ON attendance(worker_id)`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_attendance_project ON attendance(project_id)`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_attendance_date ON attendance(attendance_date)`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_workers_department ON workers(department_id)`);

    await client.query('COMMIT');
    console.log('Database tables created successfully!');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error creating tables:', error);
    throw error;
  } finally {
    client.release();
  }
};

createTables()
  .then(() => {
    console.log('Migration completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Migration failed:', error);
    process.exit(1);
  });

