import { prisma } from "./src/index.js";

async function testCurriculumEndpoint() {
  try {
    console.log("🔍 Testing Curriculum Endpoint Logic...\n");

    // Find the mentor
    const mentor = await prisma.user.findUnique({
      where: { email: "mentor@tesseracareerbridge.dev" },
      include: { mentorProfile: true },
    });

    if (!mentor || !mentor.mentorProfile) {
      console.error("❌ Mentor profile not found");
      return;
    }

    console.log(`👨‍🏫 Mentor User ID: ${mentor.id}`);
    console.log(`📋 Mentor Profile ID: ${mentor.mentorProfile.id}\n`);

    // Get first batch assignment
    const batchMentor = await prisma.batchMentor.findFirst({
      where: { mentorId: mentor.mentorProfile.id },
      include: {
        batch: {
          include: { program: true },
        },
      },
    });

    if (!batchMentor) {
      console.error("❌ No batch assignment found");
      return;
    }

    const programId = batchMentor.batch.programId;
    console.log(`📚 Testing Program ID: ${programId}`);
    console.log(`   Program: ${batchMentor.batch.program.title}\n`);

    // Step 1: Verify mentor profile
    console.log(`Step 1: Verifying mentor profile...`);
    const mentorProfile = await prisma.mentorProfile.findUnique({
      where: { userId: mentor.id },
    });

    if (!mentorProfile) {
      console.error("❌ Step 1 FAILED: Mentor profile not found");
      return;
    }
    console.log(`✅ Step 1 PASSED: Mentor profile found (${mentorProfile.id})\n`);

    // Step 2: Verify mentor has access to program
    console.log(`Step 2: Verifying mentor access to program...`);
    const hasAccess = await prisma.batchMentor.findFirst({
      where: {
        mentorId: mentorProfile.id,
        batch: {
          programId,
        },
      },
    });

    if (!hasAccess) {
      console.error("❌ Step 2 FAILED: No access to program");
      return;
    }
    console.log(`✅ Step 2 PASSED: Access verified\n`);

    // Step 3: Get program
    console.log(`Step 3: Fetching program...`);
    const program = await prisma.program.findUnique({
      where: { id: programId },
    });

    if (!program) {
      console.error("❌ Step 3 FAILED: Program not found");
      return;
    }
    console.log(`✅ Step 3 PASSED: Program found (${program.title})\n`);

    // Step 4: Get weeks
    console.log(`Step 4: Fetching weeks...`);
    const weeks = await prisma.week.findMany({
      where: { programId },
      include: {
        days: true,
      },
      orderBy: { index: "asc" },
    });

    console.log(`✅ Step 4 PASSED: Found ${weeks.length} weeks\n`);

    // Step 5: Get batch assignment
    console.log(`Step 5: Fetching batch assignment...`);
    const batchMentor2 = await prisma.batchMentor.findFirst({
      where: {
        mentorId: mentorProfile.id,
        batch: {
          programId,
        },
      },
      include: {
        batch: true,
      },
    });

    if (!batchMentor2) {
      console.error("❌ Step 5 FAILED: Batch assignment not found");
      return;
    }
    console.log(`✅ Step 5 PASSED: Batch assignment found (${batchMentor2.batch.name})\n`);

    // Build response
    const response = {
      programId: program.id,
      programTitle: program.title,
      batchId: batchMentor2.batch.id,
      batchName: batchMentor2.batch.name,
      weeks: weeks.map((week) => ({
        id: week.id,
        weekNumber: week.index + 1,
        title: week.title,
        description: week.description,
        status: week.status,
        daysCount: week.days.length,
        publishedDaysCount: week.days.filter(d => d.status === "PUBLISHED").length,
      })),
    };

    console.log(`📤 Response Structure:`);
    console.log(JSON.stringify(response, null, 2));

    console.log(`\n✅ All steps passed! Curriculum endpoint should work correctly.`);

  } catch (error) {
    console.error("❌ Error testing curriculum endpoint:", error);
    console.error("Error details:", JSON.stringify(error, null, 2));
  } finally {
    await prisma.$disconnect();
  }
}

testCurriculumEndpoint();