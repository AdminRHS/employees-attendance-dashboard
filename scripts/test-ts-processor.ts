/**
 * Test TypeScript data processor
 * Run with: npx tsx scripts/test-ts-processor.ts
 */

import { AttendanceDataProcessor } from '../lib/data-processor';
import path from 'path';
import fs from 'fs';

const EXCEL_FILE_PATH = path.join(
  __dirname,
  '../../Voice_listener_log.xlsx'
);

console.log('🧪 Testing TypeScript Data Processor\n');
console.log(`📂 Excel file path: ${EXCEL_FILE_PATH}`);

// Check if file exists
if (!fs.existsSync(EXCEL_FILE_PATH)) {
  console.error('❌ Error: Excel file not found!');
  process.exit(1);
}

console.log('✅ Excel file found!\n');

try {
  const processor = new AttendanceDataProcessor();

  console.log('📖 Reading and processing Excel file...\n');
  processor.readExcelFile(EXCEL_FILE_PATH);

  // Process all data
  const data = processor.processAll();

  console.log('='.repeat(60));
  console.log('📊 PROCESSING RESULTS');
  console.log('='.repeat(60));

  console.log(`\n👥 Employees: ${data.employees.length}`);
  console.log(`📅 Attendance Records: ${data.dailyAttendance.length}`);
  console.log(`🏖️  Leave Requests: ${data.leaves.length}`);
  console.log(`📈 Daily Stats: ${data.dailyStats.length}`);
  console.log(`🏢 Department Stats: ${data.departmentStats.length}`);
  console.log(`⭐ Employee Stats: ${data.employeeStats.length}`);

  // Show sample employee
  if (data.employees.length > 0) {
    console.log(`\n${'='.repeat(60)}`);
    console.log('👤 SAMPLE EMPLOYEE');
    console.log('='.repeat(60));
    console.log(JSON.stringify(data.employees[0], null, 2));
  }

  // Show sample attendance
  if (data.dailyAttendance.length > 0) {
    console.log(`\n${'='.repeat(60)}`);
    console.log('📅 SAMPLE ATTENDANCE RECORD');
    console.log('='.repeat(60));
    console.log(JSON.stringify(data.dailyAttendance[0], null, 2));
  }

  // Show daily stats
  if (data.dailyStats.length > 0) {
    console.log(`\n${'='.repeat(60)}`);
    console.log('📊 DAILY STATISTICS');
    console.log('='.repeat(60));
    data.dailyStats.forEach((stat) => {
      console.log(`\n📅 Date: ${stat.date}`);
      console.log(`   Total: ${stat.totalEmployees}`);
      console.log(`   ✅ On-time: ${stat.onTime} (${stat.punctualityRate}%)`);
      console.log(`   🟡 Late 1-15: ${stat.late1to15}`);
      console.log(`   🟠 Late 16-30: ${stat.late16to30}`);
      console.log(`   🔴 Late >30: ${stat.lateOver30}`);
      console.log(`   🏖️  On Leave: ${stat.onLeave}`);
      console.log(`   ❌ Absent: ${stat.absent}`);
      console.log(`   ⏱️  Avg Lateness: ${stat.averageLateness} min`);
    });
  }

  // Show department stats
  if (data.departmentStats.length > 0) {
    console.log(`\n${'='.repeat(60)}`);
    console.log('🏢 DEPARTMENT STATISTICS');
    console.log('='.repeat(60));
    data.departmentStats.forEach((stat) => {
      console.log(
        `${stat.department.padEnd(10)} - ` +
          `${stat.punctualityRate}% on-time ` +
          `(${stat.onTime}/${stat.totalEmployees} records)`
      );
    });
  }

  // Show top 5 performers
  if (data.employeeStats.length > 0) {
    console.log(`\n${'='.repeat(60)}`);
    console.log('🏆 TOP 5 PERFORMERS (by punctuality)');
    console.log('='.repeat(60));
    data.employeeStats.slice(0, 5).forEach((stat, index) => {
      const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '  ';
      console.log(
        `${medal} ${(index + 1).toString().padStart(2)}. ${stat.employeeName.padEnd(25)} - ` +
          `${stat.punctualityRate}% ` +
          `(${stat.onTimeDays}/${stat.totalDays} days, ${stat.department})`
      );
    });
  }

  // Show bottom 5 (most late)
  if (data.employeeStats.length >= 5) {
    console.log(`\n${'='.repeat(60)}`);
    console.log('⚠️  NEEDS IMPROVEMENT (by lateness)');
    console.log('='.repeat(60));
    const needsImprovement = data.employeeStats
      .filter((s) => s.averageLateness > 0)
      .sort((a, b) => b.averageLateness - a.averageLateness)
      .slice(0, 5);

    needsImprovement.forEach((stat, index) => {
      console.log(
        `   ${(index + 1).toString().padStart(2)}. ${stat.employeeName.padEnd(25)} - ` +
          `${stat.averageLateness} min avg late ` +
          `(${stat.lateDays} late days, ${stat.department})`
      );
    });
  }

  console.log(`\n${'='.repeat(60)}`);
  console.log('✅ All tests passed successfully!');
  console.log('='.repeat(60));
  console.log('\n✨ Data processor is ready to use!\n');
} catch (error) {
  console.error('\n❌ Error during processing:');
  console.error(error);
  process.exit(1);
}
