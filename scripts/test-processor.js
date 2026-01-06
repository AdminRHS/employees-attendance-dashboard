/**
 * Test script to verify data processing
 * Run with: node scripts/test-processor.js
 */

const XLSX = require('xlsx');
const path = require('path');
const fs = require('fs');

const EXCEL_FILE_PATH = path.join(__dirname, '../../Voice_listener_log.xlsx');

console.log('🧪 Testing Data Processor\n');
console.log(`📂 Excel file path: ${EXCEL_FILE_PATH}`);

// Check if file exists
if (!fs.existsSync(EXCEL_FILE_PATH)) {
  console.error('❌ Error: Excel file not found!');
  console.error(`   Expected at: ${EXCEL_FILE_PATH}`);
  process.exit(1);
}

console.log('✅ Excel file found!\n');

try {
  // Read the workbook
  console.log('📖 Reading Excel file...');
  const workbook = XLSX.readFile(EXCEL_FILE_PATH);

  console.log(`✅ Workbook loaded`);
  console.log(`📊 Available sheets: ${workbook.SheetNames.join(', ')}\n`);

  // Process each sheet
  workbook.SheetNames.forEach((sheetName) => {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`📄 Sheet: ${sheetName}`);
    console.log(`${'='.repeat(60)}`);

    const sheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(sheet);

    console.log(`Rows: ${data.length}`);

    if (data.length > 0) {
      console.log(`Columns: ${Object.keys(data[0]).join(', ')}`);
      console.log(`\nFirst row sample:`);
      console.log(JSON.stringify(data[0], null, 2));

      if (data.length > 1) {
        console.log(`\nLast row sample:`);
        console.log(JSON.stringify(data[data.length - 1], null, 2));
      }
    }
  });

  // Test Employees sheet specifically
  console.log(`\n\n${'='.repeat(60)}`);
  console.log('👥 EMPLOYEES SUMMARY');
  console.log(`${'='.repeat(60)}`);

  const employeesSheet = workbook.Sheets['Employees'];
  if (employeesSheet) {
    const employees = XLSX.utils.sheet_to_json(employeesSheet);
    console.log(`Total employees: ${employees.length}`);

    // Count by department
    const deptCounts = {};
    employees.forEach(emp => {
      const dept = emp['Department'] || 'Unknown';
      deptCounts[dept] = (deptCounts[dept] || 0) + 1;
    });

    console.log('\nBy department:');
    Object.entries(deptCounts).forEach(([dept, count]) => {
      console.log(`  ${dept}: ${count}`);
    });

    // Count by shift
    const shiftCounts = {};
    employees.forEach(emp => {
      const shift = emp['Shift'] || 'Unknown';
      shiftCounts[shift] = (shiftCounts[shift] || 0) + 1;
    });

    console.log('\nBy shift:');
    Object.entries(shiftCounts).forEach(([shift, count]) => {
      console.log(`  ${shift}: ${count}`);
    });
  }

  // Test Daily_Attendance sheet
  console.log(`\n\n${'='.repeat(60)}`);
  console.log('📅 ATTENDANCE SUMMARY');
  console.log(`${'='.repeat(60)}`);

  const attendanceSheet = workbook.Sheets['Daily_Attendance'];
  if (attendanceSheet) {
    const attendance = XLSX.utils.sheet_to_json(attendanceSheet);
    console.log(`Total attendance records: ${attendance.length}`);

    // Count by status
    const statusCounts = {};
    attendance.forEach(record => {
      const status = record['Status'] || 'Unknown';
      statusCounts[status] = (statusCounts[status] || 0) + 1;
    });

    console.log('\nBy status:');
    Object.entries(statusCounts).forEach(([status, count]) => {
      console.log(`  ${status}: ${count}`);
    });

    // Date range
    const dates = attendance.map(r => r['Date']).filter(Boolean);
    if (dates.length > 0) {
      console.log(`\nDate range:`);
      console.log(`  Earliest: ${dates[0]}`);
      console.log(`  Latest: ${dates[dates.length - 1]}`);
    }
  }

  // Test Leaves sheet
  console.log(`\n\n${'='.repeat(60)}`);
  console.log('🏖️  LEAVES SUMMARY');
  console.log(`${'='.repeat(60)}`);

  const leavesSheet = workbook.Sheets['Leaves'];
  if (leavesSheet) {
    const leaves = XLSX.utils.sheet_to_json(leavesSheet);
    console.log(`Total leave requests: ${leaves.length}`);

    if (leaves.length > 0) {
      const totalHours = leaves.reduce((sum, leave) => sum + (leave['Hours'] || 0), 0);
      console.log(`Total hours: ${totalHours}`);
    }
  }

  console.log(`\n\n✅ Data processing test completed successfully!\n`);

} catch (error) {
  console.error('\n❌ Error during processing:');
  console.error(error);
  process.exit(1);
}
