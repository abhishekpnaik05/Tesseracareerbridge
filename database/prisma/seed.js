import bcrypt from "bcryptjs";
import { prisma } from "../src/index.js";
import { CATALOG_PROGRAMS } from "./catalog.js";
const DEV_PASSWORD = process.env.SEED_DEV_PASSWORD ?? "DevPass123";
async function upsertUser(input) {
    const passwordHash = await bcrypt.hash(DEV_PASSWORD, 12);
    return prisma.user.upsert({
        where: { email: input.email },
        update: {
            displayName: input.displayName,
            role: input.role,
            status: "ACTIVE",
            phone: input.phone,
            emailVerifiedAt: new Date(),
            passwordHash,
        },
        create: {
            email: input.email,
            displayName: input.displayName,
            role: input.role,
            status: "ACTIVE",
            phone: input.phone,
            emailVerifiedAt: new Date(),
            passwordHash,
        },
    });
}
async function main() {
    if (process.env.NODE_ENV === "production") {
        console.log("Skipping development user seed in production.");
        return;
    }
    const student = await upsertUser({
        email: "student@tesseracareerbridge.dev",
        displayName: "Dev Student",
        role: "STUDENT",
        phone: "+91 90000 00001",
    });
    await prisma.studentProfile.upsert({
        where: { userId: student.id },
        update: {
            college: "Example Engineering College",
            university: "VTU",
            usn: "1XX20CS000",
            branch: "Computer Science",
            semester: 6,
            phone: "+91 90000 00001",
            city: "Bengaluru",
            state: "Karnataka",
            graduationYear: 2027,
        },
        create: {
            userId: student.id,
            college: "Example Engineering College",
            university: "VTU",
            usn: "1XX20CS000",
            branch: "Computer Science",
            semester: 6,
            phone: "+91 90000 00001",
            city: "Bengaluru",
            state: "Karnataka",
            graduationYear: 2027,
        },
    });
    const mentor = await upsertUser({
        email: "mentor@tesseracareerbridge.dev",
        displayName: "Dev Mentor",
        role: "MENTOR",
        phone: "+91 90000 00002",
    });
    await prisma.mentorProfile.upsert({
        where: { userId: mentor.id },
        update: {
            title: "Industry Mentor",
            bio: "Development mentor account for local testing.",
            phone: "+91 90000 00002",
            skills: "Mentoring, reviews",
            experience: "8 years",
        },
        create: {
            userId: mentor.id,
            title: "Industry Mentor",
            bio: "Development mentor account for local testing.",
            phone: "+91 90000 00002",
            skills: "Mentoring, reviews",
            experience: "8 years",
        },
    });
    await upsertUser({
        email: "admin@tesseracareerbridge.dev",
        displayName: "Dev Admin",
        role: "ADMIN",
        phone: "+91 90000 00003",
    });
    await upsertUser({
        email: "content@tesseracareerbridge.dev",
        displayName: "Dev Content Manager",
        role: "CONTENT_MANAGER",
        phone: "+91 90000 00004",
    });
    await upsertUser({
        email: "superadmin@tesseracareerbridge.dev",
        displayName: "Dev Super Admin",
        role: "SUPER_ADMIN",
        phone: "+91 90000 00005",
    });
    await prisma.notification.deleteMany({ where: { userId: student.id } });
    await prisma.notification.createMany({
        data: [
            {
                userId: student.id,
                title: "Complete your profile",
                body: "Add a profile photo so mentors can recognize you.",
                category: "ACCOUNT",
                priority: "NORMAL",
                href: "/student/profile",
            },
            {
                userId: student.id,
                title: "Explore internship programs",
                body: "Enrollment opens in a later step. You can review programs now.",
                category: "LEARNING",
                priority: "LOW",
                href: "/student/programs",
            },
        ],
    });
    await seedCatalog();
    await seedTestEnrollment(student.id);
    console.log("Seeded development users, published programs, and test enrollment (password is SEED_DEV_PASSWORD / DevPass123).");
}
async function seedCatalog() {
    for (const item of CATALOG_PROGRAMS) {
        const program = await prisma.program.upsert({
            where: { slug: item.slug },
            update: {
                title: item.title,
                summary: item.summary,
                description: item.description,
                durationWeeks: item.durationWeeks,
                durationLabel: item.durationLabel,
                level: item.level,
                category: item.category,
                featured: item.featured,
                status: "PUBLISHED",
                availability: item.availability,
                audience: item.audience,
                learningApproach: item.learningApproach,
                learningDaysPerWeek: item.learningDaysPerWeek,
                visualTone: item.visualTone,
            },
            create: {
                slug: item.slug,
                title: item.title,
                summary: item.summary,
                description: item.description,
                durationWeeks: item.durationWeeks,
                durationLabel: item.durationLabel,
                level: item.level,
                category: item.category,
                featured: item.featured,
                status: "PUBLISHED",
                availability: item.availability,
                audience: item.audience,
                learningApproach: item.learningApproach,
                learningDaysPerWeek: item.learningDaysPerWeek,
                visualTone: item.visualTone,
            },
        });
        await prisma.$transaction([
            prisma.programSkill.deleteMany({ where: { programId: program.id } }),
            prisma.programOutcome.deleteMany({ where: { programId: program.id } }),
            prisma.programRequirement.deleteMany({ where: { programId: program.id } }),
            prisma.programBenefit.deleteMany({ where: { programId: program.id } }),
            prisma.programFaq.deleteMany({ where: { programId: program.id } }),
            prisma.programProjectPreview.deleteMany({ where: { programId: program.id } }),
            prisma.week.deleteMany({ where: { programId: program.id } }),
        ]);
        await prisma.programSkill.createMany({
            data: item.skills.map((name, sortOrder) => ({ programId: program.id, name, sortOrder })),
        });
        await prisma.programOutcome.createMany({
            data: item.outcomes.map((body, sortOrder) => ({ programId: program.id, body, sortOrder })),
        });
        await prisma.programRequirement.createMany({
            data: item.requirements.map((body, sortOrder) => ({ programId: program.id, body, sortOrder })),
        });
        await prisma.programBenefit.createMany({
            data: item.benefits.map((benefit, sortOrder) => ({
                programId: program.id,
                title: benefit.title,
                body: benefit.body,
                sortOrder,
            })),
        });
        await prisma.programFaq.createMany({
            data: item.faqs.map((faq, sortOrder) => ({
                programId: program.id,
                title: faq.title,
                body: faq.body,
                sortOrder,
            })),
        });
        await prisma.programProjectPreview.createMany({
            data: item.projects.map((project, sortOrder) => ({
                programId: program.id,
                title: project.title,
                type: project.type,
                description: project.description,
                difficulty: project.difficulty,
                skills: project.skills,
                sortOrder,
            })),
        });
        for (const batch of item.batches) {
            const existingBatch = await prisma.batch.findFirst({
                where: { slug: batch.slug },
            });
            if (existingBatch) {
                await prisma.batch.update({
                    where: { id: existingBatch.id },
                    data: {
                        name: batch.name,
                        startsAt: batch.startsAt,
                        endsAt: batch.endsAt,
                        enrollmentOpenDate: batch.enrollmentOpenDate,
                        enrollmentCloseDate: batch.enrollmentCloseDate,
                        capacity: batch.capacity,
                        status: batch.status,
                        description: batch.description,
                    },
                });
            }
            else {
                await prisma.batch.create({
                    data: {
                        programId: program.id,
                        name: batch.name,
                        slug: batch.slug,
                        startsAt: batch.startsAt,
                        endsAt: batch.endsAt,
                        enrollmentOpenDate: batch.enrollmentOpenDate,
                        enrollmentCloseDate: batch.enrollmentCloseDate,
                        capacity: batch.capacity,
                        status: batch.status,
                        description: batch.description,
                    },
                });
            }
        }
        for (const [weekIndex, week] of item.weeks.entries()) {
            await prisma.week.create({
                data: {
                    programId: program.id,
                    index: weekIndex + 1,
                    title: week.title,
                    objective: week.title,
                    description: `Week ${weekIndex + 1}: ${week.title}`,
                    status: "PUBLISHED",
                    days: {
                        create: week.days.map((title, dayIndex) => ({
                            index: dayIndex + 1,
                            title,
                            objective: title,
                            description: `Day ${dayIndex + 1}: ${title}`,
                            estimatedDuration: 120,
                            status: "PUBLISHED",
                        })),
                    },
                },
            });
        }
    }
    await prisma.program.upsert({
        where: { slug: "internal-draft" },
        update: { status: "DRAFT", title: "Internal draft (unpublished)", summary: "Must not appear on the public catalog." },
        create: {
            slug: "internal-draft",
            title: "Internal draft (unpublished)",
            summary: "Must not appear on the public catalog.",
            status: "DRAFT",
        },
    });
}
async function seedTestEnrollment(studentId) {
    const fullStackProgram = await prisma.program.findUnique({
        where: { slug: "full-stack" },
        include: { batches: true },
    });
    if (!fullStackProgram || fullStackProgram.batches.length === 0) {
        console.log("Skipping test enrollment: Full Stack program or batch not found.");
        return;
    }
    const batch = fullStackProgram.batches[0];
    const existingEnrollment = await prisma.enrollment.findFirst({
        where: {
            userId: studentId,
            batchId: batch.id,
        },
    });
    if (existingEnrollment) {
        console.log("Test enrollment already exists, skipping creation but will seed learning content.");
        // Still seed learning content for existing enrollment
        await seedLearningContent(fullStackProgram.id, existingEnrollment.id);
        return;
    }
    const enrollment = await prisma.enrollment.create({
        data: {
            userId: studentId,
            programId: fullStackProgram.id,
            batchId: batch.id,
            status: "ACTIVE",
            enrolledAt: new Date(),
            activatedAt: new Date(),
        },
    });
    const weeks = await prisma.week.findMany({
        where: { programId: fullStackProgram.id, status: "PUBLISHED" },
        include: { days: { where: { status: "PUBLISHED" }, orderBy: { index: "asc" } } },
        orderBy: { index: "asc" },
    });
    let dayCount = 0;
    for (const week of weeks) {
        for (const day of week.days) {
            dayCount++;
            if (dayCount <= 8) {
                await prisma.progress.create({
                    data: {
                        enrollmentId: enrollment.id,
                        dayId: day.id,
                        status: dayCount < 8 ? "COMPLETED" : "IN_PROGRESS",
                        completedAt: dayCount < 8 ? new Date() : null,
                    },
                });
            }
        }
    }
    console.log(`Created test enrollment with ${dayCount} days of progress.`);
    // Seed learning content for the first few days
    await seedLearningContent(fullStackProgram.id, enrollment.id);
}
async function seedLearningContent(programId, enrollmentId) {
    const weeks = await prisma.week.findMany({
        where: { programId, status: "PUBLISHED" },
        include: { days: { where: { status: "PUBLISHED" }, orderBy: { index: "asc" } } },
        orderBy: { index: "asc" },
    });
    for (const week of weeks) {
        for (const day of week.days) {
            // Only seed content for the first 3 days
            if (day.index > 3)
                continue;
            // Create video
            await prisma.video.create({
                data: {
                    dayId: day.id,
                    title: `Video Lesson: ${day.title}`,
                    durationSeconds: 1800, // 30 minutes
                    sortOrder: 1,
                },
            });
            // Create note
            await prisma.note.create({
                data: {
                    dayId: day.id,
                    title: `Study Notes: ${day.title}`,
                    body: `# ${day.title}\n\n## Key Concepts\n\n- Concept 1: Understanding the fundamentals\n- Concept 2: Practical applications\n- Concept 3: Best practices\n\n## Examples\n\nHere are some practical examples to help you understand the material.\n\n## Summary\n\nThis day covers the essential concepts you need to master before moving to the next topic.`,
                    sortOrder: 2,
                },
            });
            // Create resource
            await prisma.resource.create({
                data: {
                    dayId: day.id,
                    title: `Reference Material: ${day.title}`,
                    sortOrder: 3,
                },
            });
            // Create practice task
            await prisma.practiceTask.create({
                data: {
                    dayId: day.id,
                    title: `Practice Exercise: ${day.title}`,
                    instructions: `Complete the following practice exercise to reinforce your learning:\n\n1. Review the concepts from the video lesson\n2. Read through the study notes\n3. Complete the hands-on exercise\n4. Test your understanding with the practice questions`,
                    sortOrder: 4,
                },
            });
            // Create DDP (only for day 1)
            if (day.index === 1) {
                console.log(`Creating DDP for day ${day.id} (${day.title})`);
                try {
                    const ddp = await prisma.ddp.create({
                        data: {
                            programId,
                            dayId: day.id,
                            title: "Daily Development Practice - Day 1",
                            description: "Answer the following questions to test your understanding of today's material.",
                            instructions: "Read each question carefully and select the best answer. You can navigate between questions and review your answers before submitting.",
                            durationMinutes: 15,
                            passingScore: 70,
                            maxAttempts: 3,
                            status: "PUBLISHED",
                        },
                    });
                    console.log(`Created DDP with ID: ${ddp.id}`);
                    // Create DDP questions with options
                    const question1 = await prisma.ddpQuestion.create({
                        data: {
                            ddpId: ddp.id,
                            prompt: "What is the main purpose of HTML in web development?",
                            explanation: "HTML provides the structure and content of web pages.",
                            type: "MCQ_SINGLE",
                            points: 1,
                            sortOrder: 1,
                            status: "PUBLISHED",
                        },
                    });
                    // Add options for question 1
                    await prisma.ddpQuestionOption.create({
                        data: { questionId: question1.id, text: "To style web pages", isCorrect: false, sortOrder: 1 },
                    });
                    await prisma.ddpQuestionOption.create({
                        data: { questionId: question1.id, text: "To provide structure and content", isCorrect: true, sortOrder: 2 },
                    });
                    await prisma.ddpQuestionOption.create({
                        data: { questionId: question1.id, text: "To add interactivity", isCorrect: false, sortOrder: 3 },
                    });
                    await prisma.ddpQuestionOption.create({
                        data: { questionId: question1.id, text: "To manage databases", isCorrect: false, sortOrder: 4 },
                    });
                    const question2 = await prisma.ddpQuestion.create({
                        data: {
                            ddpId: ddp.id,
                            prompt: "Which of the following are valid HTML elements? (Select all that apply)",
                            explanation: "div, p, and h1 are all valid HTML elements for structuring content.",
                            type: "MCQ_MULTIPLE",
                            points: 1,
                            sortOrder: 2,
                            status: "PUBLISHED",
                        },
                    });
                    // Add options for question 2
                    await prisma.ddpQuestionOption.create({
                        data: { questionId: question2.id, text: "div", isCorrect: true, sortOrder: 1 },
                    });
                    await prisma.ddpQuestionOption.create({
                        data: { questionId: question2.id, text: "p", isCorrect: true, sortOrder: 2 },
                    });
                    await prisma.ddpQuestionOption.create({
                        data: { questionId: question2.id, text: "h1", isCorrect: true, sortOrder: 3 },
                    });
                    await prisma.ddpQuestionOption.create({
                        data: { questionId: question2.id, text: "loop", isCorrect: false, sortOrder: 4 },
                    });
                    const question3 = await prisma.ddpQuestion.create({
                        data: {
                            ddpId: ddp.id,
                            prompt: "HTML elements can have attributes that provide additional information about the element.",
                            explanation: "HTML attributes provide additional information about elements and are always specified in the start tag.",
                            type: "TRUE_FALSE",
                            points: 1,
                            sortOrder: 3,
                            status: "PUBLISHED",
                        },
                    });
                    // Add options for question 3
                    await prisma.ddpQuestionOption.create({
                        data: { questionId: question3.id, text: "True", isCorrect: true, sortOrder: 1 },
                    });
                    await prisma.ddpQuestionOption.create({
                        data: { questionId: question3.id, text: "False", isCorrect: false, sortOrder: 2 },
                    });
                    console.log("Created 3 questions for DDP");
                }
                catch (error) {
                    console.error("Error creating DDP:", error);
                }
            }
            // Create assignment (only for day 1)
            if (day.index === 1) {
                await prisma.assignment.create({
                    data: {
                        programId,
                        dayId: day.id,
                        title: "Day 1 Assignment",
                        brief: "Complete the assignment to demonstrate your understanding of the concepts covered today. Submit your work by the end of the week.",
                        dueAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
                    },
                });
            }
            // Create activity progress for the first day
            if (day.index === 1) {
                let dayProgress = await prisma.progress.findUnique({
                    where: {
                        enrollmentId_dayId: {
                            enrollmentId,
                            dayId: day.id,
                        },
                    },
                });
                // Create progress if it doesn't exist
                if (!dayProgress) {
                    dayProgress = await prisma.progress.create({
                        data: {
                            enrollmentId,
                            dayId: day.id,
                            status: "IN_PROGRESS",
                        },
                    });
                }
                // Mark video as completed
                const video = await prisma.video.findFirst({ where: { dayId: day.id } });
                if (video) {
                    await prisma.studentActivityProgress.create({
                        data: {
                            enrollmentId,
                            progressId: dayProgress.id,
                            contentType: "VIDEO",
                            contentId: video.id,
                            status: "COMPLETED",
                            progressPercent: 100,
                            lastAccessedAt: new Date(),
                            completedAt: new Date(),
                            startedAt: new Date(),
                        },
                    });
                }
                // Mark note as completed
                const note = await prisma.note.findFirst({ where: { dayId: day.id } });
                if (note) {
                    await prisma.studentActivityProgress.create({
                        data: {
                            enrollmentId,
                            progressId: dayProgress.id,
                            contentType: "NOTE",
                            contentId: note.id,
                            status: "COMPLETED",
                            progressPercent: 100,
                            lastAccessedAt: new Date(),
                            completedAt: new Date(),
                            startedAt: new Date(),
                        },
                    });
                }
            }
        }
    }
    console.log("Seeded learning content for first 3 days.");
}
main()
    .catch((error) => {
    console.error(error);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
