import { prisma } from "./src/index.js";

async function verifyAllMentorAssignments() {
  try {
    console.log("🔍 Verifying All Mentor Assignments...\n");

    // Find the mentor with all their assignments
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
    console.log(`🎓 Title: ${mentor.mentorProfile.title}\n`);

    console.log(`📚 Assigned Programs & Batches: ${mentor.mentorProfile.batches.length}\n`);

    // Group by program
    const programMap = new Map();
    for (const batchMentor of mentor.mentorProfile.batches) {
      const batch = batchMentor.batch;
      const program = batch.program;
      
      if (!programMap.has(program.id)) {
        programMap.set(program.id, {
          program,
          batches: [],
          totalStudents: 0,
        });
      }
      
      programMap.get(program.id)!.batches.push(batch);
      programMap.get(program.id)!.totalStudents += batch.enrollments.length;
    }

    for (const [_, data] of programMap) {
      console.log(`🎯 ${data.program.title}`);
      console.log(`   📋 Batches: ${data.batches.length}`);
      console.log(`   👥 Total Students: ${data.totalStudents}`);
      
      for (const batch of data.batches) {
        console.log(`     📅 ${batch.name} (${batch.status})`);
        console.log(`        Enrolled: ${batch.enrollments.length} students`);
        
        if (batch.enrollments.length > 0) {
          console.log(`        Students:`);
          for (const enrollment of batch.enrollments) {
            console.log(`          - ${enrollment.user.displayName} (${enrollment.user.email})`);
          }
        }
      }
      console.log();
    }

    // Check curriculum structure for each program
    console.log(`📖 Curriculum Overview:\n`);
    
    for (const [_, data] of programMap) {
      const weeks = await prisma.week.findMany({
        where: { programId: data.program.id },
        include: { days: true },
        orderBy: { index: "asc" },
      });

      const totalDays = weeks.reduce((sum, week) => sum + week.days.length, 0);
      const publishedWeeks = weeks.filter(w => w.status === "PUBLISHED").length;
      const publishedDays = weeks.reduce((sum, week) => sum + week.days.filter(d => d.status === "PUBLISHED").length, 0);

      console.log(`${data.program.title}:`);
      console.log(`   Weeks: ${weeks.length} (${publishedWeeks} published)`);
      console.log(`   Days: ${totalDays} (${publishedDays} published)`);
      console.log();
    }

    console.log(`✅ Mentor now has full access to design content for all programs!`);
    console.log(`\n🚀 Mentor can now:`);
    console.log(`   1. Design curriculum for any of the ${programMap.size} programs`);
    console.log(`   2. Create DDPs and assignments for any batch`);
    console.log(`   3. Review submissions from ${mentor.mentorProfile.batches.reduce((sum, bm) => sum + bm.batch.enrollments.length, 0)} students`);
    console.log(`   4. Mark attendance across all batches`);

  } catch (error) {
    console.error("❌ Error verifying assignments:", error);
  } finally {
    await prisma.$disconnect();
  }
}

verifyAllMentorAssignments();