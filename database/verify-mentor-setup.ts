import { prisma } from "./src/index.js";

async function verifyMentorSetup() {
  try {
    console.log("🔍 Verifying Mentor Setup...\n");

    // Find the mentor
    const mentor = await prisma.user.findUnique({
      where: { email: "mentor@tesseracareerbridge.dev" },
      include: { 
        mentorProfile: {
          include: {
            batches: {
              include: {
                batch: {
                  include: {
                    program: true,
                    enrollments: {
                      include: {
                        user: {
                          select: {
                            displayName: true,
                            email: true,
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!mentor || !mentor.mentorProfile) {
      console.error("❌ Mentor profile not found");
      return;
    }

    console.log(`👨‍🏫 Mentor: ${mentor.displayName} (${mentor.email})`);
    console.log(`📋 Mentor Profile ID: ${mentor.mentorProfile.id}`);
    console.log(`🎓 Title: ${mentor.mentorProfile.title}`);
    console.log(`📝 Bio: ${mentor.mentorProfile.bio}\n`);

    console.log(`📚 Assigned Batches: ${mentor.mentorProfile.batches.length}`);
    
    for (const batchMentor of mentor.mentorProfile.batches) {
      const batch = batchMentor.batch;
      console.log(`\n  🎯 Batch: ${batch.name}`);
      console.log(`     Program: ${batch.program.title}`);
      console.log(`     Status: ${batch.status}`);
      console.log(`     Enrolled Students: ${batch.enrollments.length}`);
      
      if (batch.enrollments.length > 0) {
        console.log(`     Students:`);
        for (const enrollment of batch.enrollments) {
          console.log(`       - ${enrollment.user.displayName} (${enrollment.user.email})`);
        }
      }
    }

    // Check existing curriculum
    if (mentor.mentorProfile.batches.length > 0) {
      const firstBatch = mentor.mentorProfile.batches[0].batch;
      const weeks = await prisma.week.findMany({
        where: { programId: firstBatch.programId },
        include: { days: true },
        orderBy: { index: "asc" },
      });

      console.log(`\n📖 Existing Curriculum Structure:`);
      console.log(`   Total Weeks: ${weeks.length}`);
      
      for (const week of weeks) {
        console.log(`   Week ${week.index}: ${week.title} (${week.status})`);
        console.log(`     Days: ${week.days.length}`);
        for (const day of week.days) {
          console.log(`       Day ${day.index}: ${day.title} (${day.status})`);
        }
      }
    }

    console.log(`\n✅ Mentor setup verified successfully!`);
    console.log(`\n🚀 The mentor can now:`);
    console.log(`   1. Log in at http://localhost:5173 with mentor@tesseracareerbridge.dev`);
    console.log(`   2. Access the Mentor Dashboard`);
    console.log(`   3. Design weekly and daily content`);
    console.log(`   4. Create DDPs (quizzes)`);
    console.log(`   5. Create assignments`);
    console.log(`   6. Review student submissions`);
    console.log(`   7. Mark attendance`);

  } catch (error) {
    console.error("❌ Error verifying mentor setup:", error);
  } finally {
    await prisma.$disconnect();
  }
}

verifyMentorSetup();