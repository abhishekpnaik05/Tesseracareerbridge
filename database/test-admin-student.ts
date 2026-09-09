import { prisma } from "@tesseracareerbridge/database";

async function testAdminStudentIntegration() {
  console.log("Testing Admin → Student integration...");

  try {
    // Find an existing student
    const student = await prisma.studentProfile.findFirst({
      include: {
        user: {
          select: {
            id: true,
            displayName: true,
            email: true,
            status: true
          }
        }
      }
    });

    if (!student) {
      console.log("No student found. Please create a student first.");
      return;
    }

    console.log("Found student:", student.user.displayName, `(${student.user.email})`);

    // Get student enrollments
    const enrollments = await prisma.enrollment.findMany({
      where: {
        userId: student.userId
      },
      include: {
        program: {
          select: { title: true }
        },
        batch: {
          select: { name: true }
        }
      }
    });

    console.log("Student enrollments:", enrollments.length);
    enrollments.forEach(e => {
      console.log(`  - ${e.program.title} (${e.batch.name}) - Status: ${e.status}`);
    });

    // Get student progress
    if (enrollments.length > 0) {
      const enrollmentIds = enrollments.map(e => e.id);
      const progressRecords = await prisma.progress.findMany({
        where: {
          enrollmentId: {
            in: enrollmentIds
          }
        }
      });

      const completedDays = progressRecords.filter(p => p.status === "COMPLETED").length;
      const totalDays = progressRecords.length;
      const progress = totalDays > 0 ? (completedDays / totalDays) * 100 : 0;

      console.log(`Student progress: ${completedDays}/${totalDays} days completed (${progress.toFixed(1)}%)`);
    }

    // Get student attendance
    const attendanceRecords = await prisma.attendance.findMany({
      where: {
        studentProfileId: student.id
      }
    });

    const presentCount = attendanceRecords.filter(a => a.status === "PRESENT").length;
    const absentCount = attendanceRecords.filter(a => a.status === "ABSENT").length;
    const totalAttendance = presentCount + absentCount;
    const attendancePercentage = totalAttendance > 0 ? (presentCount / totalAttendance) * 100 : 0;

    console.log(`Student attendance: ${presentCount} present, ${absentCount} absent (${attendancePercentage.toFixed(1)}%)`);

    // Get student DDP performance
    const ddpAttempts = await prisma.ddpAttempt.findMany({
      where: {
        enrollmentId: {
          in: enrollments.map(e => e.id)
        }
      }
    });

    const completedDdps = ddpAttempts.filter(a => a.status === "SUBMITTED").length;
    const passedDdps = ddpAttempts.filter(a => a.passed === true).length;
    const averageScore = ddpAttempts.length > 0 && ddpAttempts.some(a => a.score !== null)
      ? ddpAttempts.reduce((sum, a) => sum + (a.score || 0), 0) / ddpAttempts.filter(a => a.score !== null).length
      : 0;

    console.log(`Student DDP performance: ${completedDdps} completed, ${passedDdps} passed, avg score: ${averageScore.toFixed(1)}`);

    // Get student assignment performance
    const assignmentSubmissions = await prisma.assignmentSubmission.findMany({
      where: {
        enrollmentId: {
          in: enrollments.map(e => e.id)
        }
      }
    });

    const submittedAssignments = assignmentSubmissions.filter(a => a.status === "SUBMITTED" || a.status === "EVALUATED").length;
    const reviewedAssignments = assignmentSubmissions.filter(a => a.status === "EVALUATED").length;
    const averageAssignmentScore = assignmentSubmissions.filter(a => a.score !== null).length > 0
      ? assignmentSubmissions.reduce((sum, a) => sum + (a.score || 0), 0) / assignmentSubmissions.filter(a => a.score !== null).length
      : 0;

    console.log(`Student assignment performance: ${submittedAssignments} submitted, ${reviewedAssignments} reviewed, avg score: ${averageAssignmentScore.toFixed(1)}`);

    console.log("✅ Admin → Student integration test passed!");
  } catch (error) {
    console.error("❌ Test failed:", error);
  } finally {
    await prisma.$disconnect();
  }
}

testAdminStudentIntegration();