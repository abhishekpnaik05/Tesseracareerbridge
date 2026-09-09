import { prisma } from "./src/index.js";

async function assignMentorToBatch() {
  try {
    console.log("Finding mentor and batch...");

    // Find the mentor
    const mentor = await prisma.user.findUnique({
      where: { email: "mentor@tesseracareerbridge.dev" },
      include: { mentorProfile: true },
    });

    if (!mentor || !mentor.mentorProfile) {
      console.error("Mentor profile not found");
      return;
    }

    console.log(`Found mentor: ${mentor.displayName} (ID: ${mentor.mentorProfile.id})`);

    // Find the first batch
    const batch = await prisma.batch.findFirst({
      include: { program: true },
    });

    if (!batch) {
      console.error("No batch found");
      return;
    }

    console.log(`Found batch: ${batch.name} (ID: ${batch.id}) in program: ${batch.program.title}`);

    // Check if mentor is already assigned
    const existingMentorship = await prisma.batchMentor.findFirst({
      where: {
        batchId: batch.id,
        mentorId: mentor.mentorProfile.id,
      },
    });

    if (existingMentorship) {
      console.log("Mentor is already assigned to this batch");
      return;
    }

    // Assign mentor to batch
    await prisma.batchMentor.create({
      data: {
        batchId: batch.id,
        mentorId: mentor.mentorProfile.id,
      },
    });

    console.log(`✅ Successfully assigned mentor ${mentor.email} to batch ${batch.name}`);
    console.log(`📋 Batch ID: ${batch.id}`);
    console.log(`👨‍🏫 Mentor ID: ${mentor.mentorProfile.id}`);
    console.log(`🎓 Program: ${batch.program.title}`);

  } catch (error) {
    console.error("Error assigning mentor:", error);
  } finally {
    await prisma.$disconnect();
  }
}

assignMentorToBatch();