import { prisma } from "@tesseracareerbridge/database";

async function testAdminDdpAssignmentMonitoring() {
  console.log("Testing Admin → DDP/Assignment monitoring...");

  try {
    // Test DDP monitoring
    console.log("\n--- DDP Monitoring ---");
    
    const ddpAttempts = await prisma.ddpAttempt.findMany({
      take: 10,
      include: {
        ddp: {
          select: {
            title: true,
            passingScore: true
          }
        },
        enrollment: {
          include: {
            user: {
              select: {
                displayName: true,
                email: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: "desc"
      }
    });

    if (ddpAttempts.length === 0) {
      console.log("No DDP attempts found.");
    } else {
      console.log(`Found ${ddpAttempts.length} DDP attempts`);
      
      // Calculate DDP statistics
      const totalAttempts = ddpAttempts.length;
      const submittedAttempts = ddpAttempts.filter(a => a.status === "SUBMITTED").length;
      const passedAttempts = ddpAttempts.filter(a => a.passed === true).length;
      const averageScore = ddpAttempts.filter(a => a.score !== null).length > 0
        ? ddpAttempts.reduce((sum, a) => sum + (a.score || 0), 0) / ddpAttempts.filter(a => a.score !== null).length
        : 0;
      const passRate = submittedAttempts > 0 ? (passedAttempts / submittedAttempts) * 100 : 0;

      console.log(`DDP Statistics:`);
      console.log(`  - Total attempts: ${totalAttempts}`);
      console.log(`  - Submitted: ${submittedAttempts}`);
      console.log(`  - Passed: ${passedAttempts}`);
      console.log(`  - Pass rate: ${passRate.toFixed(1)}%`);
      console.log(`  - Average score: ${averageScore.toFixed(1)}`);

      // Group by DDP
      const ddpStats = new Map<string, { attempts: number; totalScore: number; passed: number }>();
      ddpAttempts.forEach(attempt => {
        const key = attempt.ddpId;
        if (!ddpStats.has(key)) {
          ddpStats.set(key, { attempts: 0, totalScore: 0, passed: 0 });
        }
        const stats = ddpStats.get(key)!;
        stats.attempts++;
        if (attempt.score !== null) {
          stats.totalScore += attempt.score;
        }
        if (attempt.passed === true) {
          stats.passed++;
        }
      });

      console.log(`\nDDP Performance by DDP:`);
      ddpStats.forEach((stats, ddpId) => {
        const ddp = ddpAttempts.find(a => a.ddpId === ddpId)?.ddp;
        const avgScore = stats.attempts > 0 ? stats.totalScore / stats.attempts : 0;
        const passRate = stats.attempts > 0 ? (stats.passed / stats.attempts) * 100 : 0;
        console.log(`  - ${ddp?.title || ddpId}: ${stats.attempts} attempts, avg score: ${avgScore.toFixed(1)}, pass rate: ${passRate.toFixed(1)}%`);
      });

      // Group by student
      const studentStats = new Map<string, { attempts: number; totalScore: number; passed: number; name: string }>();
      ddpAttempts.forEach(attempt => {
        const key = attempt.enrollment.userId;
        if (!studentStats.has(key)) {
          studentStats.set(key, { attempts: 0, totalScore: 0, passed: 0, name: attempt.enrollment.user.displayName });
        }
        const stats = studentStats.get(key)!;
        stats.attempts++;
        if (attempt.score !== null) {
          stats.totalScore += attempt.score;
        }
        if (attempt.passed === true) {
          stats.passed++;
        }
      });

      console.log(`\nDDP Performance by Student:`);
      studentStats.forEach((stats, userId) => {
        const avgScore = stats.attempts > 0 ? stats.totalScore / stats.attempts : 0;
        const passRate = stats.attempts > 0 ? (stats.passed / stats.attempts) * 100 : 0;
        console.log(`  - ${stats.name}: ${stats.attempts} attempts, avg score: ${avgScore.toFixed(1)}, pass rate: ${passRate.toFixed(1)}%`);
      });
    }

    // Test Assignment monitoring
    console.log("\n--- Assignment Monitoring ---");
    
    const assignmentSubmissions = await prisma.assignmentSubmission.findMany({
      take: 10,
      include: {
        assignment: {
          select: {
            title: true,
            maxScore: true
          }
        },
        enrollment: {
          include: {
            user: {
              select: {
                displayName: true,
                email: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: "desc"
      }
    });

    if (assignmentSubmissions.length === 0) {
      console.log("No assignment submissions found.");
    } else {
      console.log(`Found ${assignmentSubmissions.length} assignment submissions`);
      
      // Calculate assignment statistics
      const totalSubmissions = assignmentSubmissions.length;
      const submittedCount = assignmentSubmissions.filter(s => s.status === "SUBMITTED" || s.status === "EVALUATED").length;
      const pendingReviews = assignmentSubmissions.filter(s => s.status === "SUBMITTED" || s.status === "UNDER_REVIEW").length;
      const reviewedCount = assignmentSubmissions.filter(s => s.status === "EVALUATED").length;
      const averageScore = assignmentSubmissions.filter(s => s.score !== null).length > 0
        ? assignmentSubmissions.reduce((sum, s) => sum + (s.score || 0), 0) / assignmentSubmissions.filter(s => s.score !== null).length
        : 0;

      console.log(`Assignment Statistics:`);
      console.log(`  - Total submissions: ${totalSubmissions}`);
      console.log(`  - Submitted: ${submittedCount}`);
      console.log(`  - Pending reviews: ${pendingReviews}`);
      console.log(`  - Reviewed: ${reviewedCount}`);
      console.log(`  - Average score: ${averageScore.toFixed(1)}`);

      // Group by assignment
      const assignmentStats = new Map<string, { submissions: number; pendingReviews: number; reviewed: number; totalScore: number; resubmissions: number }>();
      assignmentSubmissions.forEach(submission => {
        const key = submission.assignmentId;
        if (!assignmentStats.has(key)) {
          assignmentStats.set(key, { submissions: 0, pendingReviews: 0, reviewed: 0, totalScore: 0, resubmissions: 0 });
        }
        const stats = assignmentStats.get(key)!;
        stats.submissions++;
        if (submission.status === "SUBMITTED" || submission.status === "UNDER_REVIEW") {
          stats.pendingReviews++;
        }
        if (submission.status === "EVALUATED") {
          stats.reviewed++;
          if (submission.score !== null) {
            stats.totalScore += submission.score;
          }
        }
        if (submission.attemptNumber > 1) {
          stats.resubmissions++;
        }
      });

      console.log(`\nAssignment Performance by Assignment:`);
      assignmentStats.forEach((stats, assignmentId) => {
        const assignment = assignmentSubmissions.find(s => s.assignmentId === assignmentId)?.assignment;
        const avgScore = stats.reviewed > 0 ? stats.totalScore / stats.reviewed : 0;
        console.log(`  - ${assignment?.title || assignmentId}: ${stats.submissions} submissions, ${stats.pendingReviews} pending, ${stats.reviewed} reviewed, avg score: ${avgScore.toFixed(1)}`);
      });

      // Group by student
      const studentAssignmentStats = new Map<string, { submitted: number; totalScore: number; name: string }>();
      assignmentSubmissions.forEach(submission => {
        const key = submission.enrollment.userId;
        if (!studentAssignmentStats.has(key)) {
          studentAssignmentStats.set(key, { submitted: 0, totalScore: 0, name: submission.enrollment.user.displayName });
        }
        const stats = studentAssignmentStats.get(key)!;
        stats.submitted++;
        if (submission.score !== null) {
          stats.totalScore += submission.score;
        }
      });

      console.log(`\nAssignment Performance by Student:`);
      studentAssignmentStats.forEach((stats, userId) => {
        const avgScore = stats.submitted > 0 ? stats.totalScore / stats.submitted : 0;
        console.log(`  - ${stats.name}: ${stats.submitted} submitted, avg score: ${avgScore.toFixed(1)}`);
      });
    }

    console.log("✅ Admin → DDP/Assignment monitoring test passed!");
  } catch (error) {
    console.error("❌ Test failed:", error);
  } finally {
    await prisma.$disconnect();
  }
}

testAdminDdpAssignmentMonitoring();