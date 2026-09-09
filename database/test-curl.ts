import { prisma } from "./src/index.js";

async function generateTestAPIInfo() {
  try {
    console.log("🔍 Generating Test API Info...\n");

    // Find the mentor
    const mentor = await prisma.user.findUnique({
      where: { email: "mentor@tesseracareerbridge.dev" },
      include: { mentorProfile: true },
    });

    if (!mentor || !mentor.mentorProfile) {
      console.error("❌ Mentor profile not found");
      return;
    }

    console.log(`👨‍🏫 Mentor Info:`);
    console.log(`   Email: ${mentor.email}`);
    console.log(`   User ID: ${mentor.id}`);
    console.log(`   Mentor Profile ID: ${mentor.mentorProfile.id}\n`);

    // Get first batch
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

    const batch = batchMentor.batch;
    const program = batch.program;

    console.log(`📚 First Assigned Batch:`);
    console.log(`   Batch: ${batch.name}`);
    console.log(`   Program: ${program.title}`);
    console.log(`   Program ID: ${program.id}`);
    console.log(`   Batch ID: ${batch.id}\n`);

    console.log(`🔗 API Endpoints to Test:`);
    console.log(`   GET http://localhost:4000/api/v1/mentor/dashboard`);
    console.log(`   GET http://localhost:4000/api/v1/mentor/batches`);
    console.log(`   GET http://localhost:4000/api/v1/mentor/batches/${batch.id}`);
    console.log(`   GET http://localhost:4000/api/v1/mentor/curriculum/${program.id}`);
    console.log(`   GET http://localhost:4000/api/v1/mentor/batches/${batch.id}/students`);
    console.log(`   GET http://localhost:4000/api/v1/mentor/batches/${batch.id}/attendance`);

    console.log(`\n🧪 Test Command (run after login):`);
    console.log(`   curl -H "Cookie: your_session_cookie" http://localhost:4000/api/v1/mentor/curriculum/${program.id}`);

  } catch (error) {
    console.error("❌ Error generating test info:", error);
  } finally {
    await prisma.$disconnect();
  }
}

generateTestAPIInfo();