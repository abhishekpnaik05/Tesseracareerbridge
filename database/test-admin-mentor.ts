import { prisma } from "@tesseracareerbridge/database";

async function testAdminMentorAssignment() {
  console.log("Testing Admin → Mentor integration...");

  try {
    // Find an existing batch
    let batch = await prisma.batch.findFirst();
    if (!batch) {
      console.log("No batch found. Creating test batch...");
      const program = await prisma.program.findFirst();
      if (!program) {
        console.log("No program found. Please create a program first.");
        return;
      }

      batch = await prisma.batch.create({
        data: {
          programId: program.id,
          name: "Test Batch for Admin",
          status: "DRAFT"
        }
      });
      console.log("Created test batch:", batch.id);
    }

    // Find an existing mentor
    const mentor = await prisma.mentorProfile.findFirst();
    if (!mentor) {
      console.log("No mentor found. Please create a mentor first.");
      return;
    }

    // Assign mentor to batch
    console.log("Assigning mentor", mentor.id, "to batch", batch.id);
    
    const existingAssignment = await prisma.batchMentor.findUnique({
      where: {
        batchId_mentorId: {
          batchId: batch!.id,
          mentorId: mentor.id
        }
      }
    });

    if (existingAssignment) {
      console.log("Mentor already assigned to this batch.");
    } else {
      const assignment = await prisma.batchMentor.create({
        data: {
          batchId: batch!.id,
          mentorId: mentor.id
        }
      });
      console.log("Created mentor assignment:", assignment);
    }

    // Verify mentor can see the batch
    const mentorBatches = await prisma.batchMentor.findMany({
      where: {
        mentorId: mentor.id
      },
      include: {
        batch: {
          include: {
            program: true
          }
        }
      }
    });

    console.log("Mentor's assigned batches:", mentorBatches.length);
    mentorBatches.forEach(bm => {
      console.log(`  - ${bm.batch.name} (${bm.batch.program.title})`);
    });

    console.log("✅ Admin → Mentor integration test passed!");
  } catch (error) {
    console.error("❌ Test failed:", error);
  } finally {
    await prisma.$disconnect();
  }
}

testAdminMentorAssignment();