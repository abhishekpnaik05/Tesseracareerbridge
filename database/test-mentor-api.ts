import { prisma } from "./src/index.js";

async function testMentorAPI() {
  try {
    console.log("🔍 Testing Mentor API...\n");

    // Find the mentor
    const mentor = await prisma.user.findUnique({
      where: { email: "mentor@tesseracareerbridge.dev" },
      include: { mentorProfile: true },
    });

    if (!mentor || !mentor.mentorProfile) {
      console.error("❌ Mentor profile not found");
      return;
    }

    console.log(`👨‍🏫 Mentor: ${mentor.displayName} (${mentor.email})`);
    console.log(`📋 Mentor Profile ID: ${mentor.mentorProfile.id}\n`);

    // Test batch assignments
    const batchMentors = await prisma.batchMentor.findMany({
      where: { mentorId: mentor.mentorProfile.id },
      include: {
        batch: {
          include: {
            program: true,
          },
        },
      },
    });

    console.log(`📚 Assigned Batches: ${batchMentors.length}\n`);

    for (const batchMentor of batchMentors) {
      const batch = batchMentor.batch;
      console.log(`✅ ${batch.name} (${batch.program.title})`);
      console.log(`   Program ID: ${batch.programId}`);
      console.log(`   Batch ID: ${batch.id}`);
    }

    // Test curriculum access for first program
    if (batchMentors.length > 0) {
      const firstBatch = batchMentors[0].batch;
      const programId = firstBatch.programId;

      console.log(`\n📖 Testing Curriculum Access for Program ID: ${programId}`);

      const weeks = await prisma.week.findMany({
        where: { programId },
        include: { days: true },
        orderBy: { index: "asc" },
      });

      console.log(`   Weeks Found: ${weeks.length}`);
      console.log(`   Days Total: ${weeks.reduce((sum, w) => sum + w.days.length, 0)}`);
    }

    console.log(`\n✅ Mentor API test completed successfully!`);

  } catch (error) {
    console.error("❌ Error testing mentor API:", error);
  } finally {
    await prisma.$disconnect();
  }
}

testMentorAPI();