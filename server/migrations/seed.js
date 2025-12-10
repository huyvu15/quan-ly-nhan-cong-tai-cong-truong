const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });
const pool = require('../db');

const seedData = async () => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');

    console.log('Đang thêm dữ liệu mẫu...\n');

    // Xóa dữ liệu cũ nếu có
    console.log('Đang xóa dữ liệu cũ...');
    await client.query('DELETE FROM attendance');
    await client.query('DELETE FROM worker_assignments');
    await client.query('DELETE FROM workers');
    await client.query('DELETE FROM departments');
    await client.query('DELETE FROM projects');
    console.log('✓ Đã xóa dữ liệu cũ\n');

    // Thêm công trình
    const projects = [
      {
        name: 'Chung cư Green Tower',
        location: '123 Đường Nguyễn Văn Linh, Quận 7, TP.HCM',
        start_date: '2024-01-15',
        end_date: '2025-06-30',
        status: 'active',
        description: 'Dự án chung cư cao cấp 25 tầng với 300 căn hộ'
      },
      {
        name: 'Trung tâm thương mại Central Plaza',
        location: '456 Đường Lê Lợi, Quận 1, TP.HCM',
        start_date: '2024-03-01',
        end_date: '2025-12-31',
        status: 'active',
        description: 'Trung tâm thương mại 5 tầng với diện tích 15,000m²'
      },
      {
        name: 'Khu đô thị mới Sunrise',
        location: '321 Đường Võ Văn Tần, Quận 3, TP.HCM',
        start_date: '2024-02-10',
        end_date: '2026-03-31',
        status: 'active',
        description: 'Khu đô thị với 500 căn biệt thự và nhà phố'
      },
      {
        name: 'Bệnh viện đa khoa Quốc tế',
        location: '654 Đường Nguyễn Thị Minh Khai, Quận 3, TP.HCM',
        start_date: '2024-04-01',
        end_date: '2025-11-30',
        status: 'active',
        description: 'Bệnh viện 10 tầng với 500 giường bệnh'
      },
      {
        name: 'Khách sạn 5 sao Luxury',
        location: '147 Đường Điện Biên Phủ, Quận Bình Thạnh, TP.HCM',
        start_date: '2024-05-15',
        end_date: '2026-02-28',
        status: 'active',
        description: 'Khách sạn 30 tầng với 200 phòng'
      }
    ];

    const projectIds = {};
    for (const proj of projects) {
      const result = await client.query(
        `INSERT INTO projects (name, location, start_date, end_date, status, description)
         VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
        [proj.name, proj.location, proj.start_date, proj.end_date, proj.status, proj.description]
      );
      projectIds[proj.name] = result.rows[0].id;
    }
    console.log(`✓ Đã thêm ${projects.length} công trình\n`);

    // Thêm bộ phận/phòng ban
    const departments = [
      {
        name: 'Bộ phận Xây dựng',
        code: 'BPXD',
        manager: 'Nguyễn Văn A',
        phone: '0901234567',
        description: 'Bộ phận chuyên về xây dựng công trình'
      },
      {
        name: 'Bộ phận Điện nước',
        code: 'BPĐN',
        manager: 'Trần Thị B',
        phone: '0907654321',
        description: 'Bộ phận lắp đặt điện nước'
      },
      {
        name: 'Bộ phận Hoàn thiện',
        code: 'BPHT',
        manager: 'Lê Văn C',
        phone: '0912345678',
        description: 'Bộ phận hoàn thiện công trình'
      },
      {
        name: 'Bộ phận An toàn Lao động',
        code: 'BPAT',
        manager: 'Phạm Thị D',
        phone: '0923456789',
        description: 'Bộ phận đảm bảo an toàn lao động'
      },
      {
        name: 'Bộ phận Vận chuyển',
        code: 'BPVC',
        manager: 'Hoàng Văn E',
        phone: '0934567890',
        description: 'Bộ phận vận chuyển vật liệu'
      }
    ];

    const departmentIds = {};
    for (const dept of departments) {
      const result = await client.query(
        `INSERT INTO departments (name, code, manager, phone, description)
         VALUES ($1, $2, $3, $4, $5) RETURNING id`,
        [dept.name, dept.code, dept.manager, dept.phone, dept.description]
      );
      departmentIds[dept.name] = result.rows[0].id;
    }
    console.log(`✓ Đã thêm ${departments.length} bộ phận\n`);

    // Thêm nhân công
    const workers = [
      {
        code: 'NC001',
        full_name: 'Nguyễn Văn An',
        id_card: '001234567890',
        phone: '0901111111',
        email: 'nguyenvanan@example.com',
        address: '123 Đường ABC, Quận 1, TP.HCM',
        date_of_birth: '1990-05-15',
        gender: 'Nam',
        department_id: departmentIds['Bộ phận Xây dựng'],
        position: 'Thợ xây',
        hire_date: '2023-01-10',
        salary: 15000000,
        status: 'active',
        notes: 'Kinh nghiệm 5 năm'
      },
      {
        code: 'NC002',
        full_name: 'Trần Thị Bình',
        id_card: '001234567891',
        phone: '0902222222',
        email: 'tranthibinh@example.com',
        address: '456 Đường DEF, Quận 2, TP.HCM',
        date_of_birth: '1992-08-20',
        gender: 'Nữ',
        department_id: departmentIds['Bộ phận Điện nước'],
        position: 'Thợ điện',
        hire_date: '2023-02-15',
        salary: 16000000,
        status: 'active',
        notes: 'Chứng chỉ điện lực'
      },
      {
        code: 'NC003',
        full_name: 'Lê Văn Cường',
        id_card: '001234567892',
        phone: '0903333333',
        email: 'levancuong@example.com',
        address: '789 Đường GHI, Quận 3, TP.HCM',
        date_of_birth: '1988-12-10',
        gender: 'Nam',
        department_id: departmentIds['Bộ phận Xây dựng'],
        position: 'Thợ cả',
        hire_date: '2022-06-01',
        salary: 20000000,
        status: 'active',
        notes: 'Kinh nghiệm 10 năm'
      },
      {
        code: 'NC004',
        full_name: 'Phạm Thị Dung',
        id_card: '001234567893',
        phone: '0904444444',
        email: 'phamthidung@example.com',
        address: '321 Đường JKL, Quận 4, TP.HCM',
        date_of_birth: '1995-03-25',
        gender: 'Nữ',
        department_id: departmentIds['Bộ phận Hoàn thiện'],
        position: 'Thợ sơn',
        hire_date: '2023-03-20',
        salary: 14000000,
        status: 'active',
        notes: 'Chuyên về sơn nội thất'
      },
      {
        code: 'NC005',
        full_name: 'Hoàng Văn Em',
        id_card: '001234567894',
        phone: '0905555555',
        email: 'hoangvanem@example.com',
        address: '654 Đường MNO, Quận 5, TP.HCM',
        date_of_birth: '1991-07-18',
        gender: 'Nam',
        department_id: departmentIds['Bộ phận Vận chuyển'],
        position: 'Lái xe',
        hire_date: '2023-04-10',
        salary: 13000000,
        status: 'active',
        notes: 'Bằng lái xe tải'
      },
      {
        code: 'NC006',
        full_name: 'Võ Thị Phương',
        id_card: '001234567895',
        phone: '0906666666',
        email: 'vothiphuong@example.com',
        address: '987 Đường PQR, Quận 6, TP.HCM',
        date_of_birth: '1993-09-30',
        gender: 'Nữ',
        department_id: departmentIds['Bộ phận An toàn Lao động'],
        position: 'Nhân viên an toàn',
        hire_date: '2023-05-15',
        salary: 17000000,
        status: 'active',
        notes: 'Chứng chỉ an toàn lao động'
      },
      {
        code: 'NC007',
        full_name: 'Đỗ Văn Giang',
        id_card: '001234567896',
        phone: '0907777777',
        email: 'dovangiang@example.com',
        address: '147 Đường STU, Quận 7, TP.HCM',
        date_of_birth: '1989-11-12',
        gender: 'Nam',
        department_id: departmentIds['Bộ phận Xây dựng'],
        position: 'Thợ bê tông',
        hire_date: '2022-08-20',
        salary: 15500000,
        status: 'active',
        notes: 'Chuyên về đổ bê tông'
      },
      {
        code: 'NC008',
        full_name: 'Bùi Thị Hoa',
        id_card: '001234567897',
        phone: '0908888888',
        email: 'buithihoa@example.com',
        address: '258 Đường VWX, Quận 8, TP.HCM',
        date_of_birth: '1994-04-05',
        gender: 'Nữ',
        department_id: departmentIds['Bộ phận Điện nước'],
        position: 'Thợ nước',
        hire_date: '2023-06-01',
        salary: 14500000,
        status: 'active',
        notes: 'Chuyên về hệ thống nước'
      },
      {
        code: 'NC009',
        full_name: 'Ngô Văn Hùng',
        id_card: '001234567898',
        phone: '0909999999',
        email: 'ngovanhung@example.com',
        address: '369 Đường YZA, Quận 9, TP.HCM',
        date_of_birth: '1990-01-22',
        gender: 'Nam',
        department_id: departmentIds['Bộ phận Hoàn thiện'],
        position: 'Thợ lát gạch',
        hire_date: '2023-07-10',
        salary: 15000000,
        status: 'active',
        notes: 'Kinh nghiệm lát gạch cao cấp'
      },
      {
        code: 'NC010',
        full_name: 'Lý Thị Lan',
        id_card: '001234567899',
        phone: '0910000000',
        email: 'lythilan@example.com',
        address: '741 Đường BCD, Quận 10, TP.HCM',
        date_of_birth: '1992-06-14',
        gender: 'Nữ',
        department_id: departmentIds['Bộ phận An toàn Lao động'],
        position: 'Nhân viên kiểm tra',
        hire_date: '2023-08-05',
        salary: 16000000,
        status: 'active',
        notes: 'Kiểm tra chất lượng công trình'
      },
      {
        code: 'NC011',
        full_name: 'Trịnh Văn Long',
        id_card: '001234567900',
        phone: '0911111111',
        email: 'trinhvanlong@example.com',
        address: '852 Đường EFG, Quận 11, TP.HCM',
        date_of_birth: '1987-10-08',
        gender: 'Nam',
        department_id: departmentIds['Bộ phận Xây dựng'],
        position: 'Thợ cốt thép',
        hire_date: '2022-09-15',
        salary: 16500000,
        status: 'active',
        notes: 'Chuyên về cốt thép'
      },
      {
        code: 'NC012',
        full_name: 'Đinh Thị Mai',
        id_card: '001234567901',
        phone: '0912222222',
        email: 'dinhthimai@example.com',
        address: '963 Đường HIJ, Quận 12, TP.HCM',
        date_of_birth: '1996-02-28',
        gender: 'Nữ',
        department_id: departmentIds['Bộ phận Vận chuyển'],
        position: 'Nhân viên kho',
        hire_date: '2023-09-20',
        salary: 12000000,
        status: 'active',
        notes: 'Quản lý kho vật liệu'
      },
      {
        code: 'NC013',
        full_name: 'Phan Văn Nam',
        id_card: '001234567902',
        phone: '0913333333',
        email: 'phanvannam@example.com',
        address: '159 Đường KLM, Quận Bình Thạnh, TP.HCM',
        date_of_birth: '1991-05-17',
        gender: 'Nam',
        department_id: departmentIds['Bộ phận Điện nước'],
        position: 'Thợ điện',
        hire_date: '2023-10-01',
        salary: 16000000,
        status: 'active',
        notes: 'Chuyên về hệ thống điện'
      },
      {
        code: 'NC014',
        full_name: 'Vũ Thị Oanh',
        id_card: '001234567903',
        phone: '0914444444',
        email: 'vuthioanh@example.com',
        address: '357 Đường NOP, Quận Tân Bình, TP.HCM',
        date_of_birth: '1993-08-09',
        gender: 'Nữ',
        department_id: departmentIds['Bộ phận Hoàn thiện'],
        position: 'Thợ trần thạch cao',
        hire_date: '2023-11-10',
        salary: 14500000,
        status: 'active',
        notes: 'Chuyên về trần thạch cao'
      },
      {
        code: 'NC015',
        full_name: 'Cao Văn Phúc',
        id_card: '001234567904',
        phone: '0915555555',
        email: 'caovanphuc@example.com',
        address: '468 Đường QRS, Quận Phú Nhuận, TP.HCM',
        date_of_birth: '1989-12-03',
        gender: 'Nam',
        department_id: departmentIds['Bộ phận Xây dựng'],
        position: 'Thợ xây',
        hire_date: '2022-11-25',
        salary: 15000000,
        status: 'on_leave',
        notes: 'Đang nghỉ phép'
      }
    ];

    const workerIds = {};
    for (const worker of workers) {
      const result = await client.query(
        `INSERT INTO workers (code, full_name, id_card, phone, email, address, date_of_birth, gender, department_id, position, hire_date, salary, status, notes)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14) RETURNING id`,
        [worker.code, worker.full_name, worker.id_card, worker.phone, worker.email, worker.address, worker.date_of_birth, worker.gender, worker.department_id, worker.position, worker.hire_date, worker.salary, worker.status, worker.notes]
      );
      workerIds[worker.code] = result.rows[0].id;
    }
    console.log(`✓ Đã thêm ${workers.length} nhân công\n`);

    // Thêm phân công nhân công
    const assignments = [
      {
        worker_code: 'NC001',
        project_name: 'Chung cư Green Tower',
        assign_date: '2024-01-20',
        assigned_by: 'Nguyễn Văn A',
        notes: 'Phân công cho công đoạn xây tường'
      },
      {
        worker_code: 'NC002',
        project_name: 'Chung cư Green Tower',
        assign_date: '2024-01-22',
        assigned_by: 'Nguyễn Văn A',
        notes: 'Lắp đặt hệ thống điện'
      },
      {
        worker_code: 'NC003',
        project_name: 'Trung tâm thương mại Central Plaza',
        assign_date: '2024-03-05',
        assigned_by: 'Trần Thị B',
        notes: 'Giám sát công trình'
      },
      {
        worker_code: 'NC004',
        project_name: 'Trung tâm thương mại Central Plaza',
        assign_date: '2024-03-10',
        assigned_by: 'Trần Thị B',
        notes: 'Sơn nội thất'
      },
      {
        worker_code: 'NC005',
        project_name: 'Khu đô thị mới Sunrise',
        assign_date: '2024-02-15',
        assigned_by: 'Lê Văn C',
        notes: 'Vận chuyển vật liệu'
      },
      {
        worker_code: 'NC006',
        project_name: 'Bệnh viện đa khoa Quốc tế',
        assign_date: '2024-04-10',
        assigned_by: 'Phạm Thị D',
        notes: 'Kiểm tra an toàn'
      },
      {
        worker_code: 'NC007',
        project_name: 'Khách sạn 5 sao Luxury',
        assign_date: '2024-05-20',
        assigned_by: 'Hoàng Văn E',
        notes: 'Đổ bê tông tầng 1'
      },
      {
        worker_code: 'NC008',
        project_name: 'Khách sạn 5 sao Luxury',
        assign_date: '2024-05-25',
        assigned_by: 'Hoàng Văn E',
        notes: 'Lắp đặt hệ thống nước'
      }
    ];

    for (const assign of assignments) {
      await client.query(
        `INSERT INTO worker_assignments (worker_id, project_id, assign_date, assigned_by, notes)
         VALUES ($1, $2, $3, $4, $5)`,
        [workerIds[assign.worker_code], projectIds[assign.project_name], assign.assign_date, assign.assigned_by, assign.notes]
      );
    }
    console.log(`✓ Đã thêm ${assignments.length} phân công nhân công\n`);

    // Thêm chấm công
    const attendanceRecords = [];
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    
    // Tạo dữ liệu chấm công cho tháng hiện tại và tháng trước
    for (let monthOffset = 1; monthOffset >= 0; monthOffset--) {
      const month = currentMonth - monthOffset;
      const year = month < 0 ? currentYear - 1 : currentYear;
      const daysInMonth = new Date(year, month + 1, 0).getDate();
      
      for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(year, month, day);
        const dayOfWeek = date.getDay();
        
        // Bỏ qua chủ nhật
        if (dayOfWeek === 0) continue;
        
        // Tạo chấm công cho một số nhân công ngẫu nhiên mỗi ngày
        const workersForDay = Object.keys(workerIds).slice(0, Math.floor(Math.random() * 8) + 5);
        
        for (const workerCode of workersForDay) {
          const workerId = workerIds[workerCode];
          const status = Math.random() > 0.1 ? 'present' : (Math.random() > 0.5 ? 'absent' : 'leave');
          
          let checkInTime = null;
          let checkOutTime = null;
          let workHours = null;
          
          if (status === 'present') {
            const checkInHour = 7 + Math.floor(Math.random() * 2); // 7-8h
            const checkInMinute = Math.floor(Math.random() * 60);
            const checkOutHour = 17 + Math.floor(Math.random() * 2); // 17-18h
            const checkOutMinute = Math.floor(Math.random() * 60);
            
            checkInTime = `${String(checkInHour).padStart(2, '0')}:${String(checkInMinute).padStart(2, '0')}:00`;
            checkOutTime = `${String(checkOutHour).padStart(2, '0')}:${String(checkOutMinute).padStart(2, '0')}:00`;
            workHours = checkOutHour - checkInHour + (checkOutMinute - checkInMinute) / 60;
          }
          
          const attendanceDate = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          
          // Lấy project_id từ assignment nếu có
          const assignment = assignments.find(a => a.worker_code === workerCode);
          const projectId = assignment ? projectIds[assignment.project_name] : null;
          
          attendanceRecords.push({
            worker_id: workerId,
            project_id: projectId,
            attendance_date: attendanceDate,
            check_in_time: checkInTime,
            check_out_time: checkOutTime,
            work_hours: workHours,
            status: status,
            notes: status === 'present' ? null : (status === 'absent' ? 'Vắng mặt' : 'Nghỉ phép'),
            created_by: 'admin'
          });
        }
      }
    }

    for (const att of attendanceRecords) {
      await client.query(
        `INSERT INTO attendance (worker_id, project_id, attendance_date, check_in_time, check_out_time, work_hours, status, notes, created_by)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
        [att.worker_id, att.project_id, att.attendance_date, att.check_in_time, att.check_out_time, att.work_hours, att.status, att.notes, att.created_by]
      );
    }
    console.log(`✓ Đã thêm ${attendanceRecords.length} bản ghi chấm công\n`);

    await client.query('COMMIT');
    console.log('✓ Hoàn thành thêm dữ liệu mẫu!\n');
    console.log('Tóm tắt:');
    console.log(`- ${projects.length} công trình`);
    console.log(`- ${departments.length} bộ phận`);
    console.log(`- ${workers.length} nhân công`);
    console.log(`- ${assignments.length} phân công`);
    console.log(`- ${attendanceRecords.length} bản ghi chấm công`);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Lỗi khi thêm dữ liệu:', error);
    throw error;
  } finally {
    client.release();
  }
};

seedData()
  .then(() => {
    console.log('Seed completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Seed failed:', error);
    process.exit(1);
  });

