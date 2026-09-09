import { prisma } from "@tesseracareerbridge/database";

async function testAdminAnnouncementIntegration() {
  console.log("Testing Admin → Announcement integration...");

  try {
    // Find existing announcements
    const announcements = await prisma.announcement.findMany({
      take: 5,
      include: {
        author: {
          select: {
            displayName: true,
            email: true
          }
        },
        batch: {
          select: {
            name: true,
            program: {
              select: {
                title: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: "desc"
      }
    });

    if (announcements.length === 0) {
      console.log("No announcements found. Creating test announcement...");
      
      // Create test announcement
      const batch = await prisma.batch.findFirst();
      const user = await prisma.user.findFirst({
        where: {
          role: {
            in: ["ADMIN", "CONTENT_MANAGER", "SUPER_ADMIN"]
          }
        }
      });
      
      if (!batch || !user) {
        console.log("No batch or admin user found. Please create them first.");
        return;
      }

      const testAnnouncement = await prisma.announcement.create({
        data: {
          batchId: batch.id,
          authorId: user.id,
          title: "Test Announcement from Admin",
          body: "This is a test announcement created by the admin integration test.",
          priority: "NORMAL"
        },
        include: {
          author: {
            select: {
              displayName: true,
              email: true
            }
          },
          batch: {
            select: {
              name: true,
              program: {
                select: {
                  title: true
                }
              }
            }
          }
        }
      });

      console.log("Created test announcement:", testAnnouncement.title);
      console.log(`  - Author: ${testAnnouncement.author.displayName}`);
      console.log(`  - Target: ${testAnnouncement.batch.name} (${testAnnouncement.batch.program.title})`);
    } else {
      console.log(`Found ${announcements.length} announcements`);
      
      announcements.forEach(announcement => {
        const target = announcement.batch 
          ? `${announcement.batch.name} (${announcement.batch.program.title})`
          : "All users";
        
        console.log(`  - ${announcement.title} by ${announcement.author.displayName}`);
        console.log(`    Target: ${target}, Priority: ${announcement.priority}`);
        console.log(`    Created: ${announcement.createdAt.toISOString()}`);
      });
    }

    // Test that announcements can be filtered by batch
    const batch = await prisma.batch.findFirst();
    if (batch) {
      const batchAnnouncements = await prisma.announcement.findMany({
        where: {
          batchId: batch.id
        },
        include: {
          author: {
            select: {
              displayName: true
            }
          }
        }
      });

      console.log(`\nAnnouncements for batch "${batch.name}": ${batchAnnouncements.length}`);
      batchAnnouncements.forEach(a => {
        console.log(`  - ${a.title} by ${a.author.displayName}`);
      });
    }

    console.log("✅ Admin → Announcement integration test passed!");
  } catch (error) {
    console.error("❌ Test failed:", error);
  } finally {
    await prisma.$disconnect();
  }
}

testAdminAnnouncementIntegration();