import { prisma } from "./src/index.js";

async function assignAllBatchesToMentor() {
  try {
    console.log("🔍 Finding mentor and all batches...\n");

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

    // Find all batches
    const allBatches = await prisma.batch.findMany({
      include: { 
        program: true,
        mentors: {
          where: { mentorId: mentor.mentorProfile.id },
        },
      },
    });

    console.log(`📚 Total Batches Found: ${allBatches.length}\n`);

    let assignedCount = 0;
    let alreadyAssignedCount = 0;

    for (const batch of allBatches) {
      const isAlreadyAssigned = batch.mentors.length > 0;
      
      if (isAlreadyAssigned) {
        console.log(`⏭️  Skip: ${batch.name} (Program: ${batch.program.title}) - Already assigned`);
        alreadyAssignedCount++;
      } else {
        // Assign mentor to this batch
        await prisma.batchMentor.create({
          data: {
            batchId: batch.id,
            mentorId: mentor.mentorProfile.id,
          },
        });
        console.log(`✅ Assigned: ${batch.name} (Program: ${batch.program.title})`);
        assignedCount++;
      }
    }

    console.log(`\n📊 Summary:`);
    console.log(`   Total Batches: ${allBatches.length}`);
    console.log(`   Newly Assigned: ${assignedCount}`);
    console.log(`   Already Assigned: ${alreadyAssignedCount}`);
    console.log(`   Total Mentor Assignments: ${assignedCount + alreadyAssignedCount}`);

    console.log(`\n🎉 Mentor ${mentor.email} now has access to all ${allBatches.length} batches!`);

  } catch (error) {
    console.error("❌ Error assigning batches:", error);
  } finally {
    await prisma.$disconnect();
  }
}

assignAllBatchesToMentor();