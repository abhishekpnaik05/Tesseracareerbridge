import { prisma } from "@tesseracareerbridge/database";

async function testAdminAttendanceIntegration() {
  console.log("Testing Admin → Attendance integration...");

  try {
    // Find existing attendance records
    const attendanceRecords = await prisma.attendance.findMany({
      take: 10,
      include: {
        batch: {
          include: {
            program: true
          }
        },
        student: {
          include: {
            user: {
              select: {
                displayName: true,
                email: true
              }
            }
          }
        }
      }
    });

    if (attendanceRecords.length === 0) {
      console.log("No attendance records found. Creating test attendance...");
      
      // Create test attendance
      const batch = await prisma.batch.findFirst();
      const student = await prisma.studentProfile.findFirst();
      
      if (!batch || !student) {
        console.log("No batch or student found. Please create them first.");
        return;
      }

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const testAttendance = await prisma.attendance.create({
        data: {
          batchId: batch.id,
          studentProfileId: student.id,
          occurredOn: today,
          status: "PRESENT"
        }
      });

      console.log("Created test attendance:", testAttendance);
    } else {
      console.log(`Found ${attendanceRecords.length} attendance records`);
      
      // Group by batch
      const attendanceByBatch = new Map<string, { present: number; absent: number; total: number }>();
      
      attendanceRecords.forEach(record => {
        const key = record.batchId;
        if (!attendanceByBatch.has(key)) {
          attendanceByBatch.set(key, { present: 0, absent: 0, total: 0 });
        }
        const stats = attendanceByBatch.get(key)!;
        stats.total++;
        if (record.status === "PRESENT") {
          stats.present++;
        } else {
          stats.absent++;
        }
      });

      console.log("\nAttendance by batch:");
      attendanceByBatch.forEach((stats, batchId) => {
        const batch = attendanceRecords.find(r => r.batchId === batchId)?.batch;
        const percentage = stats.total > 0 ? (stats.present / stats.total) * 100 : 0;
        console.log(`  - ${batch?.name || batchId}: ${stats.present}/${stats.total} present (${percentage.toFixed(1)}%)`);
      });

      // Group by student
      const attendanceByStudent = new Map<string, { present: number; absent: number; total: number }>();
      
      attendanceRecords.forEach(record => {
        const key = record.studentProfileId;
        if (!attendanceByStudent.has(key)) {
          attendanceByStudent.set(key, { present: 0, absent: 0, total: 0 });
        }
        const stats = attendanceByStudent.get(key)!;
        stats.total++;
        if (record.status === "PRESENT") {
          stats.present++;
        } else {
          stats.absent++;
        }
      });

      console.log("\nAttendance by student:");
      attendanceByStudent.forEach((stats, studentId) => {
        const student = attendanceRecords.find(r => r.studentProfileId === studentId)?.student;
        const percentage = stats.total > 0 ? (stats.present / stats.total) * 100 : 0;
        console.log(`  - ${student?.user.displayName || studentId}: ${stats.present}/${stats.total} present (${percentage.toFixed(1)}%)`);
      });

      // Test today's attendance
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const todayAttendance = await prisma.attendance.count({
        where: {
          occurredOn: {
            gte: today,
            lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
          }
        }
      });

      const todayPresent = await prisma.attendance.count({
        where: {
          occurredOn: {
            gte: today,
            lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
          },
          status: "PRESENT"
        }
      });

      const todayPercentage = todayAttendance > 0 ? (todayPresent / todayAttendance) * 100 : 0;
      
      console.log(`\nToday's attendance: ${todayPresent}/${todayAttendance} present (${todayPercentage.toFixed(1)}%)`);
    }

    console.log("✅ Admin → Attendance integration test passed!");
  } catch (error) {
    console.error("❌ Test failed:", error);
  } finally {
    await prisma.$disconnect();
  }
}

testAdminAttendanceIntegration();