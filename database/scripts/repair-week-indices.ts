// Data repair script for existing week indices
// This script should be run from the server context where DATABASE_URL is properly loaded
// To use: Import this function and call it from within the server context

import { PrismaClient } from '@prisma/client';

export async function repairWeekIndices(prisma: PrismaClient) {
  console.log('Starting week index repair...');
  
  const programs = await prisma.program.findMany({
    select: { id: true, title: true }
  });
  
  console.log(`Found ${programs.length} programs to check`);
  
  let totalWeeksRepaired = 0;
  
  for (const program of programs) {
    console.log(`Processing program: ${program.title}`);
    
    const weeks = await prisma.week.findMany({
      where: { programId: program.id },
      orderBy: { index: 'asc' }
    });
    
    if (weeks.length === 0) {
      console.log('  No weeks found, skipping');
      continue;
    }
    
    console.log(`  Found ${weeks.length} weeks`);
    console.log('  Current indices:', weeks.map(w => w.index).join(', '));
    
    const needsRepair = weeks.some((week, index) => week.index !== index);
    
    if (!needsRepair) {
      console.log('  Week indices are already correct (0-based), skipping');
      continue;
    }
    
    const updatePromises = weeks.map((week, correctIndex) => {
      return prisma.week.update({
        where: { id: week.id },
        data: { index: correctIndex }
      });
    });
    
    await prisma.$transaction(updatePromises);
    
    console.log(`  Repaired ${weeks.length} weeks`);
    console.log('  New indices:', weeks.map((_, i) => i).join(', '));
    
    totalWeeksRepaired += weeks.length;
  }
  
  console.log(`✅ Repair complete! Repaired ${totalWeeksRepaired} weeks across ${programs.length} programs`);
  
  return { 
    success: true, 
    programsProcessed: programs.length, 
    weeksRepaired: totalWeeksRepaired 
  };
}