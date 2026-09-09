import { prisma } from "@tesseracareerbridge/database";
import type { 
  AdminDashboardDto,
  AdminStudentListItem,
  AdminStudentDetail,
  AdminMentorListItem,
  AdminMentorDetail,
  AdminProgramListItem,
  AdminProgramDetail,
  AdminBatchListItem,
  AdminBatchDetail,
  AdminEnrollmentListItem,
  AdminEnrollmentDetail,
  TodayAttendanceDto,
  BatchAttendanceDto,
  StudentAttendanceHistoryDto,
  AdminAnnouncementListItem,
  AttendanceReportDto,
  DdpReportDto,
  AssignmentReportDto,
  InternshipProgressReportDto,
  CreateInternshipRequest,
  MentorInfo
} from "@tesseracareerbridge/shared";

export class AdminService {
  // Dashboard
  async getDashboard(): Promise<AdminDashboardDto> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [
      totalStudents,
      activeStudents,
      totalMentors,
      activeMentors,
      totalPrograms,
      activePrograms,
      totalBatches,
      activeBatches,
      totalEnrollments,
      activeEnrollments,
      todayAttendanceRecords,
      pendingReviews,
      recentAnnouncements
    ] = await Promise.all([
      prisma.studentProfile.count(),
      prisma.studentProfile.count({
        where: {
          user: {
            status: "ACTIVE"
          }
        }
      }),
      prisma.mentorProfile.count(),
      prisma.mentorProfile.count({
        where: {
          user: {
            status: "ACTIVE"
          }
        }
      }),
      prisma.program.count(),
      prisma.program.count({
        where: {
          status: "PUBLISHED"
        }
      }),
      prisma.batch.count(),
      prisma.batch.count({
        where: {
          status: {
            in: ["OPEN", "IN_PROGRESS"]
          }
        }
      }),
      prisma.enrollment.count(),
      prisma.enrollment.count({
        where: {
          status: "ACTIVE"
        }
      }),
      prisma.attendance.count({
        where: {
          occurredOn: {
            gte: today,
            lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
          }
        }
      }),
      prisma.assignmentSubmission.count({
        where: {
          status: {
            in: ["SUBMITTED", "UNDER_REVIEW"]
          }
        }
      }),
      prisma.announcement.findMany({
        take: 5,
        orderBy: {
          createdAt: "desc"
        },
        select: {
          id: true,
          title: true,
          createdAt: true
        }
      })
    ]);

    const recentAnnouncementsFormatted = recentAnnouncements.map(a => ({
      id: a.id,
      title: a.title,
      createdAt: a.createdAt.toISOString()
    }));

    const presentCount = await prisma.attendance.count({
      where: {
        occurredOn: {
          gte: today,
          lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
        },
        status: "PRESENT"
      }
    });

    const todayAttendanceTotal = todayAttendanceRecords;
    const todayAttendancePresent = presentCount;
    const todayAttendanceAbsent = todayAttendanceTotal - todayAttendancePresent;
    const todayAttendancePercentage = todayAttendanceTotal > 0 
      ? (todayAttendancePresent / todayAttendanceTotal) * 100 
      : 0;

    return {
      totalStudents,
      activeStudents,
      totalMentors,
      activeMentors,
      totalPrograms,
      activePrograms,
      totalBatches,
      activeBatches,
      totalEnrollments,
      activeEnrollments,
      todayAttendance: {
        total: todayAttendanceTotal,
        present: todayAttendancePresent,
        absent: todayAttendanceAbsent,
        percentage: todayAttendancePercentage
      },
      pendingReviews,
      recentAnnouncements: recentAnnouncementsFormatted
    };
  }

  // Student Management
  async getStudents(params: {
    page?: number;
    pageSize?: number;
    search?: string;
    program?: string;
    batch?: string;
    status?: string;
  }) {
    const page = params.page || 1;
    const pageSize = params.pageSize || 20;
    const skip = (page - 1) * pageSize;

    const where: any = {};

    if (params.search) {
      where.OR = [
        { user: { displayName: { contains: params.search, mode: "insensitive" } } },
        { user: { email: { contains: params.search, mode: "insensitive" } } }
      ];
    }

    if (params.status) {
      where.user = { ...where.user, status: params.status };
    }

    if (params.program || params.batch) {
      where.enrollments = {};
      if (params.program) {
        where.enrollments.program = { slug: params.program };
      }
      if (params.batch) {
        where.enrollments.batch = { id: params.batch };
      }
    }

    const [students, total] = await Promise.all([
      prisma.studentProfile.findMany({
        where,
        skip,
        take: pageSize,
        include: {
          user: {
            select: {
              id: true,
              displayName: true,
              email: true,
              status: true
            }
          }
        },
        orderBy: { createdAt: "desc" }
      }),
      prisma.studentProfile.count({ where })
    ]);

    // Get enrollments for each student separately
    const studentIds = students.map(s => s.id);
    const enrollments = await prisma.enrollment.findMany({
      where: {
        user: {
          studentProfile: {
            id: {
              in: studentIds
            }
          }
        }
      },
      take: 1,
      orderBy: { enrolledAt: "desc" },
      include: {
        program: {
          select: { title: true }
        },
        batch: {
          select: { name: true }
        },
        user: {
          select: {
            studentProfile: {
              select: {
                id: true
              }
            }
          }
        }
      }
    });

    // Create a map of studentProfileId to enrollment
    const enrollmentMap = new Map(enrollments.map(e => [e.user.studentProfile?.id, e]));

    const items: AdminStudentListItem[] = students.map(student => {
      const enrollment = enrollmentMap.get(student.id);
      return {
        id: student.id,
        userId: student.user.id,
        name: student.user.displayName,
        email: student.user.email,
        program: enrollment?.program.title || null,
        batch: enrollment?.batch.name || null,
        status: student.user.status,
        progress: null, // Calculate if needed
        attendance: null // Calculate if needed
      };
    });

    return {
      items,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize)
    };
  }

  async getStudent(studentId: string): Promise<AdminStudentDetail> {
    // Try to find by studentProfileId first, if not found try by userId
    let student = await prisma.studentProfile.findUnique({
      where: { id: studentId },
      include: {
        user: {
          select: {
            id: true,
            displayName: true,
            email: true,
            status: true
          }
        }
      }
    });

    // If not found, try to find by userId
    if (!student) {
      student = await prisma.studentProfile.findUnique({
        where: { userId: studentId },
        include: {
          user: {
            select: {
              id: true,
              displayName: true,
              email: true,
              status: true
            }
          }
        }
      });
    }

    if (!student) {
      throw new Error("Student not found");
    }

    // Get enrollments through the user
    const enrollments = await prisma.enrollment.findMany({
      where: {
        userId: student.userId
      },
      include: {
        program: {
          select: { title: true }
        },
        batch: {
          select: { name: true }
        }
      },
      orderBy: { enrolledAt: "desc" }
    });

    // Get attendance through the student profile
    const attendanceRecords = await prisma.attendance.findMany({
      where: {
        studentProfileId: student.id
      }
    });

    // Calculate progress
    const enrollmentIds = enrollments.map(e => e.id);
    const progressRecords = await prisma.progress.findMany({
      where: {
        enrollmentId: {
          in: enrollmentIds
        }
      }
    });

    const completedDays = progressRecords.filter((p: any) => p.status === "COMPLETED").length;
    const totalDays = progressRecords.length;
    const overallPercent = totalDays > 0 ? (completedDays / totalDays) * 100 : 0;

    // Calculate attendance
    const presentCount = attendanceRecords.filter((a: any) => a.status === "PRESENT").length;
    const absentCount = attendanceRecords.filter((a: any) => a.status === "ABSENT").length;
    const totalAttendance = presentCount + absentCount;
    const attendancePercentage = totalAttendance > 0 ? (presentCount / totalAttendance) * 100 : 0;

    // Calculate DPP performance
    const ddpAttempts = await prisma.ddpAttempt.findMany({
      where: {
        enrollmentId: {
          in: enrollmentIds
        }
      }
    });

    const completedDdps = ddpAttempts.filter((a: any) => a.status === "SUBMITTED").length;
    const passedDdps = ddpAttempts.filter((a: any) => a.passed === true).length;
    const averageScore = ddpAttempts.length > 0 && ddpAttempts.some((a: any) => a.score !== null)
      ? ddpAttempts.reduce((sum: number, a: any) => sum + (a.score || 0), 0) / ddpAttempts.filter((a: any) => a.score !== null).length
      : 0;

    // Calculate assignment performance
    const assignmentSubmissions = await prisma.assignmentSubmission.findMany({
      where: {
        enrollmentId: {
          in: enrollmentIds
        }
      }
    });

    const submittedAssignments = assignmentSubmissions.filter((a: any) => a.status === "SUBMITTED" || a.status === "EVALUATED").length;
    const pendingAssignments = assignmentSubmissions.filter((a: any) => a.status === "SUBMITTED" || a.status === "UNDER_REVIEW").length;
    const reviewedAssignments = assignmentSubmissions.filter((a: any) => a.status === "EVALUATED").length;
    const averageAssignmentScore = assignmentSubmissions.filter((a: any) => a.score !== null).length > 0
      ? assignmentSubmissions.reduce((sum: number, a: any) => sum + (a.score || 0), 0) / assignmentSubmissions.filter((a: any) => a.score !== null).length
      : 0;

    return {
      id: student.id,
      userId: student.user.id,
      name: student.user.displayName,
      email: student.user.email,
      phone: student.phone,
      university: student.university,
      branch: student.branch,
      semester: student.semester,
      status: student.user.status,
      enrollments: enrollments.map((e: any) => ({
        id: e.id,
        programTitle: e.program.title,
        batchName: e.batch.name,
        status: e.status,
        enrolledAt: e.enrolledAt.toISOString(),
        progress: 0 // Calculate per enrollment if needed
      })),
      progress: {
        overallPercent,
        weeksCompleted: 0, // Calculate if needed
        daysCompleted: completedDays
      },
      attendance: {
        present: presentCount,
        absent: absentCount,
        percentage: attendancePercentage
      },
      ddpPerformance: {
        averageScore,
        completed: completedDdps,
        passed: passedDdps,
        failed: completedDdps - passedDdps
      },
      assignmentPerformance: {
        submitted: submittedAssignments,
        pending: pendingAssignments,
        reviewed: reviewedAssignments,
        averageScore: averageAssignmentScore
      }
    };
  }

  // Mentor Management
  async getMentors(params: {
    page?: number;
    pageSize?: number;
    search?: string;
    status?: string;
  }) {
    const page = params.page || 1;
    const pageSize = params.pageSize || 20;
    const skip = (page - 1) * pageSize;

    const where: any = {};

    if (params.search) {
      where.OR = [
        { user: { displayName: { contains: params.search, mode: "insensitive" } } },
        { user: { email: { contains: params.search, mode: "insensitive" } } }
      ];
    }

    if (params.status) {
      where.user = { ...where.user, status: params.status };
    }

    const [mentors, total] = await Promise.all([
      prisma.mentorProfile.findMany({
        where,
        skip,
        take: pageSize,
        include: {
          user: {
            select: {
              id: true,
              displayName: true,
              email: true,
              status: true
            }
          },
          batches: {
            include: {
              batch: {
                include: {
                  enrollments: true
                }
              }
            }
          }
        },
        orderBy: { createdAt: "desc" }
      }),
      prisma.mentorProfile.count({ where })
    ]);

    const items: AdminMentorListItem[] = mentors.map(mentor => ({
      id: mentor.id,
      userId: mentor.user.id,
      name: mentor.user.displayName,
      email: mentor.user.email,
      title: mentor.title,
      status: mentor.user.status,
      assignedBatches: mentor.batches.length,
      assignedStudents: mentor.batches.reduce((sum, bm) => sum + bm.batch.enrollments.length, 0)
    }));

    return {
      items,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize)
    };
  }

  async getMentor(mentorId: string): Promise<AdminMentorDetail> {
    const mentor = await prisma.mentorProfile.findUnique({
      where: { id: mentorId },
      include: {
        user: {
          select: {
            id: true,
            displayName: true,
            email: true,
            status: true
          }
        },
        batches: {
          include: {
            batch: {
              include: {
                program: {
                  select: { title: true }
                },
                enrollments: true
              }
            }
          }
        },
        reviewedSubmissions: {
          take: 5,
          orderBy: { reviewedAt: "desc" }
        }
      }
    });

    if (!mentor) {
      throw new Error("Mentor not found");
    }

    const assignedInternships = mentor.batches.map(bm => ({
      id: bm.batch.id,
      programTitle: bm.batch.program.title,
      batchName: bm.batch.name,
      assignedAt: bm.batch.createdAt.toISOString()
    }));

    const studentCount = mentor.batches.reduce((sum, bm) => sum + bm.batch.enrollments.length, 0);

    const recentActivity = mentor.reviewedSubmissions.map(submission => ({
      type: "ASSIGNMENT_REVIEW",
      description: `Reviewed assignment submission`,
      createdAt: submission.reviewedAt?.toISOString() || submission.createdAt.toISOString()
    }));

    return {
      id: mentor.id,
      userId: mentor.user.id,
      name: mentor.user.displayName,
      email: mentor.user.email,
      title: mentor.title,
      bio: mentor.bio,
      phone: mentor.phone,
      skills: mentor.skills,
      experience: mentor.experience,
      linkedin: mentor.linkedin,
      github: mentor.github,
      status: mentor.user.status,
      assignedInternships,
      assignedBatches: mentor.batches.length,
      studentCount,
      recentActivity
    };
  }

  async assignMentorToBatch(batchId: string, mentorId: string): Promise<{ success: boolean }> {
    // Check if assignment already exists
    const existing = await prisma.batchMentor.findUnique({
      where: {
        batchId_mentorId: {
          batchId,
          mentorId
        }
      }
    });

    if (existing) {
      return { success: true };
    }

    await prisma.batchMentor.create({
      data: {
        batchId,
        mentorId
      }
    });

    return { success: true };
  }

  // Program Management
  async getPrograms(params: {
    page?: number;
    pageSize?: number;
    search?: string;
    status?: string;
    category?: string;
  }) {
    const page = params.page || 1;
    const pageSize = params.pageSize || 20;
    const skip = (page - 1) * pageSize;

    const where: any = {};

    if (params.search) {
      where.OR = [
        { title: { contains: params.search, mode: "insensitive" } },
        { summary: { contains: params.search, mode: "insensitive" } }
      ];
    }

    if (params.status) {
      where.status = params.status;
    }

    if (params.category) {
      where.category = params.category;
    }

    const [programs, total] = await Promise.all([
      prisma.program.findMany({
        where,
        skip,
        take: pageSize,
        include: {
          _count: {
            select: {
              batches: true,
              enrollments: true
            }
          }
        },
        orderBy: { createdAt: "desc" }
      }),
      prisma.program.count({ where })
    ]);

    const items: AdminProgramListItem[] = programs.map(program => ({
      id: program.id,
      slug: program.slug,
      title: program.title,
      summary: program.summary,
      durationWeeks: program.durationWeeks,
      level: program.level,
      category: program.category,
      status: program.status,
      featured: program.featured,
      batchCount: program._count.batches,
      enrollmentCount: program._count.enrollments
    }));

    return {
      items,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize)
    };
  }

  async getProgram(programId: string): Promise<AdminProgramDetail> {
    const program = await prisma.program.findUnique({
      where: { id: programId },
      include: {
        skills: {
          orderBy: { sortOrder: "asc" }
        },
        outcomes: {
          orderBy: { sortOrder: "asc" }
        },
        requirements: {
          orderBy: { sortOrder: "asc" }
        },
        _count: {
          select: {
            batches: true,
            enrollments: true
          }
        }
      }
    });

    if (!program) {
      throw new Error("Program not found");
    }

    return {
      id: program.id,
      slug: program.slug,
      title: program.title,
      summary: program.summary,
      description: program.description,
      durationWeeks: program.durationWeeks,
      durationLabel: program.durationLabel,
      level: program.level,
      category: program.category,
      audience: program.audience,
      learningApproach: program.learningApproach,
      learningDaysPerWeek: program.learningDaysPerWeek,
      status: program.status,
      featured: program.featured,
      availability: program.availability,
      skills: program.skills.map(s => s.name),
      outcomes: program.outcomes.map(o => o.body),
      requirements: program.requirements.map(r => r.body),
      batchCount: program._count.batches,
      enrollmentCount: program._count.enrollments,
      createdAt: program.createdAt.toISOString(),
      updatedAt: program.updatedAt.toISOString()
    };
  }

  async createProgram(data: {
    title: string;
    summary?: string;
    description?: string;
    durationWeeks?: number;
    durationLabel?: string;
    level?: string;
    category?: string;
    audience?: string;
    learningApproach?: string;
    learningDaysPerWeek?: number;
    skills?: string[];
    outcomes?: string[];
    requirements?: string[];
  }): Promise<AdminProgramDetail> {
    const slug = this.generateSlug(data.title);

    const program = await prisma.program.create({
      data: {
        slug,
        title: data.title,
        summary: data.summary,
        description: data.description,
        durationWeeks: data.durationWeeks,
        durationLabel: data.durationLabel,
        level: data.level,
        category: data.category,
        audience: data.audience,
        learningApproach: data.learningApproach,
        learningDaysPerWeek: data.learningDaysPerWeek,
        skills: {
          create: (data.skills || []).map((name, index) => ({
            name,
            sortOrder: index
          }))
        },
        outcomes: {
          create: (data.outcomes || []).map((body, index) => ({
            body,
            sortOrder: index
          }))
        },
        requirements: {
          create: (data.requirements || []).map((body, index) => ({
            body,
            sortOrder: index
          }))
        }
      },
      include: {
        skills: {
          orderBy: { sortOrder: "asc" }
        },
        outcomes: {
          orderBy: { sortOrder: "asc" }
        },
        requirements: {
          orderBy: { sortOrder: "asc" }
        },
        _count: {
          select: {
            batches: true,
            enrollments: true
          }
        }
      }
    });

    return {
      id: program.id,
      slug: program.slug,
      title: program.title,
      summary: program.summary,
      description: program.description,
      durationWeeks: program.durationWeeks,
      durationLabel: program.durationLabel,
      level: program.level,
      category: program.category,
      audience: program.audience,
      learningApproach: program.learningApproach,
      learningDaysPerWeek: program.learningDaysPerWeek,
      status: program.status,
      featured: program.featured,
      availability: program.availability,
      skills: program.skills.map(s => s.name),
      outcomes: program.outcomes.map(o => o.body),
      requirements: program.requirements.map(r => r.body),
      batchCount: program._count.batches,
      enrollmentCount: program._count.enrollments,
      createdAt: program.createdAt.toISOString(),
      updatedAt: program.updatedAt.toISOString()
    };
  }

  async updateProgram(programId: string, data: {
    title?: string;
    summary?: string;
    description?: string;
    durationWeeks?: number;
    durationLabel?: string;
    level?: string;
    category?: string;
    audience?: string;
    learningApproach?: string;
    learningDaysPerWeek?: number;
    status?: string;
    featured?: boolean;
    availability?: string;
    skills?: string[];
    outcomes?: string[];
    requirements?: string[];
  }): Promise<AdminProgramDetail> {
    const updateData: any = {};

    if (data.title !== undefined) updateData.title = data.title;
    if (data.summary !== undefined) updateData.summary = data.summary;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.durationWeeks !== undefined) updateData.durationWeeks = data.durationWeeks;
    if (data.durationLabel !== undefined) updateData.durationLabel = data.durationLabel;
    if (data.level !== undefined) updateData.level = data.level;
    if (data.category !== undefined) updateData.category = data.category;
    if (data.audience !== undefined) updateData.audience = data.audience;
    if (data.learningApproach !== undefined) updateData.learningApproach = data.learningApproach;
    if (data.learningDaysPerWeek !== undefined) updateData.learningDaysPerWeek = data.learningDaysPerWeek;
    if (data.status !== undefined) updateData.status = data.status;
    if (data.featured !== undefined) updateData.featured = data.featured;
    if (data.availability !== undefined) updateData.availability = data.availability;

    const program = await prisma.program.update({
      where: { id: programId },
      data: updateData,
      include: {
        skills: {
          orderBy: { sortOrder: "asc" }
        },
        outcomes: {
          orderBy: { sortOrder: "asc" }
        },
        requirements: {
          orderBy: { sortOrder: "asc" }
        },
        _count: {
          select: {
            batches: true,
            enrollments: true
          }
        }
      }
    });

    return {
      id: program.id,
      slug: program.slug,
      title: program.title,
      summary: program.summary,
      description: program.description,
      durationWeeks: program.durationWeeks,
      durationLabel: program.durationLabel,
      level: program.level,
      category: program.category,
      audience: program.audience,
      learningApproach: program.learningApproach,
      learningDaysPerWeek: program.learningDaysPerWeek,
      status: program.status,
      featured: program.featured,
      availability: program.availability,
      skills: program.skills.map(s => s.name),
      outcomes: program.outcomes.map(o => o.body),
      requirements: program.requirements.map(r => r.body),
      batchCount: program._count.batches,
      enrollmentCount: program._count.enrollments,
      createdAt: program.createdAt.toISOString(),
      updatedAt: program.updatedAt.toISOString()
    };
  }

  // Batch Management
  async getBatches(params: {
    page?: number;
    pageSize?: number;
    search?: string;
    programId?: string;
    status?: string;
  }) {
    const page = params.page || 1;
    const pageSize = params.pageSize || 20;
    const skip = (page - 1) * pageSize;

    const where: any = {};

    if (params.search) {
      where.OR = [
        { name: { contains: params.search, mode: "insensitive" } },
        { slug: { contains: params.search, mode: "insensitive" } }
      ];
    }

    if (params.programId) {
      where.programId = params.programId;
    }

    if (params.status) {
      where.status = params.status;
    }

    const [batches, total] = await Promise.all([
      prisma.batch.findMany({
        where,
        skip,
        take: pageSize,
        include: {
          program: {
            select: {
              id: true,
              title: true
            }
          },
          mentors: {
            include: {
              mentor: {
                include: {
                  user: {
                    select: {
                      id: true,
                      displayName: true
                    }
                  }
                }
              }
            },
            take: 1
          },
          _count: {
            select: {
              enrollments: true
            }
          }
        },
        orderBy: { createdAt: "desc" }
      }),
      prisma.batch.count({ where })
    ]);

    const items: AdminBatchListItem[] = batches.map(batch => ({
      id: batch.id,
      name: batch.name,
      slug: batch.slug,
      programId: batch.programId,
      programTitle: batch.program.title,
      startsAt: batch.startsAt?.toISOString() || null,
      endsAt: batch.endsAt?.toISOString() || null,
      status: batch.status,
      capacity: batch.capacity,
      enrolledCount: batch._count.enrollments,
      mentor: batch.mentors[0] ? {
        id: batch.mentors[0].mentor.id,
        name: batch.mentors[0].mentor.user.displayName
      } : null
    }));

    return {
      items,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize)
    };
  }

  async getBatch(batchId: string): Promise<AdminBatchDetail> {
    const batch = await prisma.batch.findUnique({
      where: { id: batchId },
      include: {
        program: {
          select: {
            id: true,
            title: true
          }
        },
        mentors: {
          include: {
            mentor: {
              include: {
                user: {
                  select: {
                    id: true,
                    displayName: true,
                    email: true
                  }
                }
              }
            }
          },
          take: 1
        },
        enrollments: {
          include: {
            user: {
              select: {
                id: true,
                displayName: true,
                email: true,
                status: true
              }
            }
          }
        }
      }
    });

    if (!batch) {
      throw new Error("Batch not found");
    }

    const students = await Promise.all(
      batch.enrollments.map(async (enrollment) => {
        const progressRecords = await prisma.progress.findMany({
          where: {
            enrollmentId: enrollment.id
          }
        });

        const completedDays = progressRecords.filter(p => p.status === "COMPLETED").length;
        const totalDays = progressRecords.length;
        const progress = totalDays > 0 ? (completedDays / totalDays) * 100 : 0;

        return {
          id: enrollment.user.id,
          name: enrollment.user.displayName,
          email: enrollment.user.email,
          status: enrollment.user.status,
          progress
        };
      })
    );

    return {
      id: batch.id,
      name: batch.name,
      slug: batch.slug,
      programId: batch.programId,
      programTitle: batch.program.title,
      startsAt: batch.startsAt?.toISOString() || null,
      endsAt: batch.endsAt?.toISOString() || null,
      enrollmentOpenDate: batch.enrollmentOpenDate?.toISOString() || null,
      enrollmentCloseDate: batch.enrollmentCloseDate?.toISOString() || null,
      status: batch.status,
      capacity: batch.capacity,
      enrolledCount: batch.enrollments.length,
      description: batch.description,
      mentor: batch.mentors[0] ? {
        id: batch.mentors[0].mentor.id,
        name: batch.mentors[0].mentor.user.displayName,
        email: batch.mentors[0].mentor.user.email
      } : null,
      students
    };
  }

  async createBatch(data: {
    programId: string;
    name: string;
    slug?: string;
    startsAt?: string;
    endsAt?: string;
    enrollmentOpenDate?: string;
    enrollmentCloseDate?: string;
    capacity?: number;
    description?: string;
  }): Promise<AdminBatchDetail> {
    const batch = await prisma.batch.create({
      data: {
        programId: data.programId,
        name: data.name,
        slug: data.slug || this.generateSlug(data.name),
        startsAt: data.startsAt ? new Date(data.startsAt) : null,
        endsAt: data.endsAt ? new Date(data.endsAt) : null,
        enrollmentOpenDate: data.enrollmentOpenDate ? new Date(data.enrollmentOpenDate) : null,
        enrollmentCloseDate: data.enrollmentCloseDate ? new Date(data.enrollmentCloseDate) : null,
        capacity: data.capacity,
        description: data.description
      },
      include: {
        program: {
          select: {
            id: true,
            title: true
          }
        },
        mentors: {
          include: {
            mentor: {
              include: {
                user: {
                  select: {
                    id: true,
                    displayName: true,
                    email: true
                  }
                }
              }
            }
          }
        },
        enrollments: {
          include: {
            user: {
              select: {
                id: true,
                displayName: true,
                email: true,
                status: true
              }
            }
          }
        }
      }
    });

    const students = batch.enrollments.map(enrollment => ({
      id: enrollment.user.id,
      name: enrollment.user.displayName,
      email: enrollment.user.email,
      status: enrollment.user.status,
      progress: 0
    }));

    return {
      id: batch.id,
      name: batch.name,
      slug: batch.slug,
      programId: batch.programId,
      programTitle: batch.program.title,
      startsAt: batch.startsAt?.toISOString() || null,
      endsAt: batch.endsAt?.toISOString() || null,
      enrollmentOpenDate: batch.enrollmentOpenDate?.toISOString() || null,
      enrollmentCloseDate: batch.enrollmentCloseDate?.toISOString() || null,
      status: batch.status,
      capacity: batch.capacity,
      enrolledCount: batch.enrollments.length,
      description: batch.description,
      mentor: batch.mentors[0] ? {
        id: batch.mentors[0].mentor.id,
        name: batch.mentors[0].mentor.user.displayName,
        email: batch.mentors[0].mentor.user.email
      } : null,
      students
    };
  }

  async updateBatch(batchId: string, data: {
    programId?: string;
    name?: string;
    slug?: string;
    startsAt?: string;
    endsAt?: string;
    enrollmentOpenDate?: string;
    enrollmentCloseDate?: string;
    capacity?: number;
    description?: string;
    status?: string;
  }): Promise<AdminBatchDetail> {
    const updateData: any = {};

    if (data.programId !== undefined) updateData.programId = data.programId;
    if (data.name !== undefined) updateData.name = data.name;
    if (data.slug !== undefined) updateData.slug = data.slug;
    if (data.startsAt !== undefined) updateData.startsAt = new Date(data.startsAt);
    if (data.endsAt !== undefined) updateData.endsAt = new Date(data.endsAt);
    if (data.enrollmentOpenDate !== undefined) updateData.enrollmentOpenDate = new Date(data.enrollmentOpenDate);
    if (data.enrollmentCloseDate !== undefined) updateData.enrollmentCloseDate = new Date(data.enrollmentCloseDate);
    if (data.capacity !== undefined) updateData.capacity = data.capacity;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.status !== undefined) updateData.status = data.status;

    const batch = await prisma.batch.update({
      where: { id: batchId },
      data: updateData,
      include: {
        program: {
          select: {
            id: true,
            title: true
          }
        },
        mentors: {
          include: {
            mentor: {
              include: {
                user: {
                  select: {
                    id: true,
                    displayName: true,
                    email: true
                  }
                }
              }
            }
          }
        },
        enrollments: {
          include: {
            user: {
              select: {
                id: true,
                displayName: true,
                email: true,
                status: true
              }
            }
          }
        }
      }
    });

    const students = batch.enrollments.map(enrollment => ({
      id: enrollment.user.id,
      name: enrollment.user.displayName,
      email: enrollment.user.email,
      status: enrollment.user.status,
      progress: 0
    }));

    return {
      id: batch.id,
      name: batch.name,
      slug: batch.slug,
      programId: batch.programId,
      programTitle: batch.program.title,
      startsAt: batch.startsAt?.toISOString() || null,
      endsAt: batch.endsAt?.toISOString() || null,
      enrollmentOpenDate: batch.enrollmentOpenDate?.toISOString() || null,
      enrollmentCloseDate: batch.enrollmentCloseDate?.toISOString() || null,
      status: batch.status,
      capacity: batch.capacity,
      enrolledCount: batch.enrollments.length,
      description: batch.description,
      mentor: batch.mentors[0] ? {
        id: batch.mentors[0].mentor.id,
        name: batch.mentors[0].mentor.user.displayName,
        email: batch.mentors[0].mentor.user.email
      } : null,
      students
    };
  }

  // Enrollment Management
  async getEnrollments(params: {
    page?: number;
    pageSize?: number;
    search?: string;
    programId?: string;
    batchId?: string;
    status?: string;
  }) {
    const page = params.page || 1;
    const pageSize = params.pageSize || 20;
    const skip = (page - 1) * pageSize;

    const where: any = {};

    if (params.search) {
      where.OR = [
        { user: { displayName: { contains: params.search, mode: "insensitive" } } },
        { user: { email: { contains: params.search, mode: "insensitive" } } }
      ];
    }

    if (params.programId) {
      where.programId = params.programId;
    }

    if (params.batchId) {
      where.batchId = params.batchId;
    }

    if (params.status) {
      where.status = params.status;
    }

    const [enrollments, total] = await Promise.all([
      prisma.enrollment.findMany({
        where,
        skip,
        take: pageSize,
        include: {
          user: {
            select: {
              id: true,
              displayName: true,
              email: true
            }
          },
          program: {
            select: {
              id: true,
              title: true
            }
          },
          batch: {
            select: {
              id: true,
              name: true
            }
          }
        },
        orderBy: { enrolledAt: "desc" }
      }),
      prisma.enrollment.count({ where })
    ]);

    const items: AdminEnrollmentListItem[] = await Promise.all(
      enrollments.map(async (enrollment) => {
        const progressRecords = await prisma.progress.findMany({
          where: {
            enrollmentId: enrollment.id
          }
        });

        const completedDays = progressRecords.filter(p => p.status === "COMPLETED").length;
        const totalDays = progressRecords.length;
        const progress = totalDays > 0 ? (completedDays / totalDays) * 100 : 0;

        return {
          id: enrollment.id,
          studentId: enrollment.user.id,
          studentName: enrollment.user.displayName,
          studentEmail: enrollment.user.email,
          programId: enrollment.programId,
          programTitle: enrollment.program.title,
          batchId: enrollment.batchId,
          batchName: enrollment.batch.name,
          status: enrollment.status,
          enrolledAt: enrollment.enrolledAt.toISOString(),
          progress
        };
      })
    );

    return {
      items,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize)
    };
  }

  async getEnrollment(enrollmentId: string): Promise<AdminEnrollmentDetail> {
    const enrollment = await prisma.enrollment.findUnique({
      where: { id: enrollmentId },
      include: {
        user: {
          select: {
            id: true,
            displayName: true,
            email: true
          }
        },
        program: {
          select: {
            id: true,
            title: true
          }
        },
        batch: {
          select: {
            id: true,
            name: true,
            mentors: {
              include: {
                mentor: {
                  include: {
                    user: {
                      select: {
                        id: true,
                        displayName: true
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    });

    if (!enrollment) {
      throw new Error("Enrollment not found");
    }

    const mentor = enrollment.batch.mentors[0]?.mentor || null;

    // Calculate progress
    const progressRecords = await prisma.progress.findMany({
      where: {
        enrollmentId: enrollment.id
      }
    });

    const completedDays = progressRecords.filter(p => p.status === "COMPLETED").length;
    const totalDays = progressRecords.length;
    const progress = totalDays > 0 ? (completedDays / totalDays) * 100 : 0;

    // Calculate attendance
    const attendanceRecords = await prisma.attendance.findMany({
      where: {
        batchId: enrollment.batchId,
        studentProfileId: enrollment.user.id
      }
    });

    const presentCount = attendanceRecords.filter(a => a.status === "PRESENT").length;
    const absentCount = attendanceRecords.filter(a => a.status === "ABSENT").length;
    const totalAttendance = presentCount + absentCount;
    const attendancePercentage = totalAttendance > 0 ? (presentCount / totalAttendance) * 100 : 0;

    // Calculate DDP performance
    const ddpAttempts = await prisma.ddpAttempt.findMany({
      where: {
        enrollmentId: enrollment.id
      }
    });

    const completedDdps = ddpAttempts.filter(a => a.status === "SUBMITTED").length;
    const passedDdps = ddpAttempts.filter(a => a.passed === true).length;
    const averageScore = ddpAttempts.length > 0 && ddpAttempts.some(a => a.score !== null)
      ? ddpAttempts.reduce((sum, a) => sum + (a.score || 0), 0) / ddpAttempts.filter(a => a.score !== null).length
      : 0;

    // Calculate assignment performance
    const assignmentSubmissions = await prisma.assignmentSubmission.findMany({
      where: {
        enrollmentId: enrollment.id
      }
    });

    const submittedAssignments = assignmentSubmissions.filter(a => a.status === "SUBMITTED" || a.status === "EVALUATED").length;
    const reviewedAssignments = assignmentSubmissions.filter(a => a.status === "EVALUATED").length;
    const averageAssignmentScore = assignmentSubmissions.filter(a => a.score !== null).length > 0
      ? assignmentSubmissions.reduce((sum, a) => sum + (a.score || 0), 0) / assignmentSubmissions.filter(a => a.score !== null).length
      : 0;

    return {
      id: enrollment.id,
      studentId: enrollment.user.id,
      studentName: enrollment.user.displayName,
      studentEmail: enrollment.user.email,
      programId: enrollment.programId,
      programTitle: enrollment.program.title,
      batchId: enrollment.batchId,
      batchName: enrollment.batch.name,
      mentorId: mentor?.id || null,
      mentorName: mentor?.user.displayName || null,
      status: enrollment.status,
      enrolledAt: enrollment.enrolledAt.toISOString(),
      activatedAt: enrollment.activatedAt?.toISOString() || null,
      completedAt: enrollment.completedAt?.toISOString() || null,
      progress,
      currentDay: completedDays,
      totalDays,
      attendance: {
        present: presentCount,
        absent: absentCount,
        percentage: attendancePercentage
      },
      ddpPerformance: {
        averageScore,
        completed: completedDdps,
        passed: passedDdps
      },
      assignmentPerformance: {
        submitted: submittedAssignments,
        reviewed: reviewedAssignments,
        averageScore: averageAssignmentScore
      }
    };
  }

  // Attendance Management
  async getTodayAttendance(): Promise<TodayAttendanceDto> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [totalRecords, presentRecords] = await Promise.all([
      prisma.attendance.count({
        where: {
          occurredOn: {
            gte: today,
            lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
          }
        }
      }),
      prisma.attendance.count({
        where: {
          occurredOn: {
            gte: today,
            lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
          },
          status: "PRESENT"
        }
      })
    ]);

    const total = totalRecords;
    const present = presentRecords;
    const absent = total - present;
    const percentage = total > 0 ? (present / total) * 100 : 0;

    return {
      date: today.toISOString(),
      totalStudents: total,
      present,
      absent,
      percentage
    };
  }

  async getBatchAttendance(batchId: string, date: string): Promise<BatchAttendanceDto> {
    const batch = await prisma.batch.findUnique({
      where: { id: batchId },
      include: {
        program: {
          select: {
            id: true,
            title: true
          }
        },
        enrollments: {
          include: {
            user: {
              select: {
                id: true,
                displayName: true,
                email: true
              }
            }
          }
        }
      }
    });

    if (!batch) {
      throw new Error("Batch not found");
    }

    const targetDate = new Date(date);
    targetDate.setHours(0, 0, 0, 0);

    // Get student profiles for all users in the batch
    const userIds = batch.enrollments.map(e => e.user.id);
    const studentProfiles = await prisma.studentProfile.findMany({
      where: {
        userId: {
          in: userIds
        }
      },
      select: {
        userId: true,
        id: true
      }
    });

    const userToStudentProfileMap = new Map(studentProfiles.map(sp => [sp.userId, sp.id]));

    const attendanceRecords = await prisma.attendance.findMany({
      where: {
        batchId,
        occurredOn: targetDate
      }
    });

    const students = batch.enrollments.map(enrollment => {
      const studentProfileId = userToStudentProfileMap.get(enrollment.user.id);
      const record = attendanceRecords.find(
        a => a.studentProfileId === studentProfileId
      );

      return {
        studentId: enrollment.user.id,
        studentName: enrollment.user.displayName,
        studentEmail: enrollment.user.email,
        status: record?.status || "ABSENT",
        markedBy: null, // Add if tracking who marked attendance
        updatedAt: record?.createdAt?.toISOString() || null
      };
    });

    return {
      batchId: batch.id,
      batchName: batch.name,
      programId: batch.programId,
      programTitle: batch.program.title,
      date: targetDate.toISOString(),
      students
    };
  }

  async getStudentAttendance(studentId: string): Promise<StudentAttendanceHistoryDto> {
    // First try to find by studentProfileId, if not found try by userId
    let student = await prisma.studentProfile.findUnique({
      where: { id: studentId },
      include: {
        user: {
          select: {
            displayName: true
          }
        }
      }
    });

    // If not found, try to find by userId
    if (!student) {
      student = await prisma.studentProfile.findUnique({
        where: { userId: studentId },
        include: {
          user: {
            select: {
              displayName: true
            }
          }
        }
      });
    }

    if (!student) {
      throw new Error("Student not found");
    }

    const attendanceRecords = await prisma.attendance.findMany({
      where: {
        studentProfileId: student.id
      },
      orderBy: {
        occurredOn: "desc"
      },
      take: 30
    });

    const records = attendanceRecords.map(record => ({
      date: record.occurredOn.toISOString(),
      status: record.status
    }));

    const present = records.filter(r => r.status === "PRESENT").length;
    const absent = records.filter(r => r.status === "ABSENT").length;
    const total = present + absent;
    const percentage = total > 0 ? (present / total) * 100 : 0;

    return {
      studentId: student.id,
      studentName: student.user.displayName,
      records,
      summary: {
        total,
        present,
        absent,
        percentage
      }
    };
  }

  // Announcement Management
  async getAnnouncements(params: { page?: number; pageSize?: number }) {
    const page = params.page || 1;
    const pageSize = params.pageSize || 20;
    const skip = (page - 1) * pageSize;

    const [announcements, total] = await Promise.all([
      prisma.announcement.findMany({
        skip,
        take: pageSize,
        include: {
          author: {
            select: {
              id: true,
              displayName: true
            }
          },
          batch: {
            select: {
              id: true,
              name: true
            }
          }
        },
        orderBy: { createdAt: "desc" }
      }),
      prisma.announcement.count()
    ]);

    const items: AdminAnnouncementListItem[] = announcements.map(announcement => ({
      id: announcement.id,
      title: announcement.title,
      body: announcement.body,
      priority: announcement.priority,
      audience: announcement.batchId ? "SPECIFIC_BATCH" : "ALL",
      batchId: announcement.batchId,
      batchName: announcement.batch?.name || null,
      authorId: announcement.authorId,
      authorName: announcement.author.displayName,
      createdAt: announcement.createdAt.toISOString()
    }));

    return {
      items,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize)
    };
  }

  async createAnnouncement(authorId: string, data: {
    title: string;
    body: string;
    priority: "NORMAL" | "IMPORTANT" | "URGENT";
    audience: "ALL" | "STUDENTS" | "MENTORS" | "SPECIFIC_BATCH";
    batchId?: string;
  }): Promise<AdminAnnouncementListItem> {
    const announcement = await prisma.announcement.create({
      data: {
        title: data.title,
        body: data.body,
        priority: data.priority,
        batchId: data.audience === "SPECIFIC_BATCH" ? data.batchId : null,
        authorId
      },
      include: {
        author: {
          select: {
            id: true,
            displayName: true
          }
        },
        batch: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    return {
      id: announcement.id,
      title: announcement.title,
      body: announcement.body,
      priority: announcement.priority,
      audience: announcement.batchId ? "SPECIFIC_BATCH" : "ALL",
      batchId: announcement.batchId,
      batchName: announcement.batch?.name || null,
      authorId: announcement.authorId,
      authorName: announcement.author.displayName,
      createdAt: announcement.createdAt.toISOString()
    };
  }

  async updateAnnouncement(announcementId: string, data: {
    title?: string;
    body?: string;
    priority?: "NORMAL" | "IMPORTANT" | "URGENT";
    audience?: "ALL" | "STUDENTS" | "MENTORS" | "SPECIFIC_BATCH";
    batchId?: string;
  }): Promise<AdminAnnouncementListItem> {
    const updateData: any = {};

    if (data.title !== undefined) updateData.title = data.title;
    if (data.body !== undefined) updateData.body = data.body;
    if (data.priority !== undefined) updateData.priority = data.priority;
    if (data.batchId !== undefined) updateData.batchId = data.batchId;

    const announcement = await prisma.announcement.update({
      where: { id: announcementId },
      data: updateData,
      include: {
        author: {
          select: {
            id: true,
            displayName: true
          }
        },
        batch: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    return {
      id: announcement.id,
      title: announcement.title,
      body: announcement.body,
      priority: announcement.priority,
      audience: announcement.batchId ? "SPECIFIC_BATCH" : "ALL",
      batchId: announcement.batchId,
      batchName: announcement.batch?.name || null,
      authorId: announcement.authorId,
      authorName: announcement.author.displayName,
      createdAt: announcement.createdAt.toISOString()
    };
  }

  async deleteAnnouncement(announcementId: string): Promise<{ success: boolean }> {
    await prisma.announcement.delete({
      where: { id: announcementId }
    });

    return { success: true };
  }

  // Reports
  async getAttendanceReport(params: {
    batchId?: string;
    studentId?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<AttendanceReportDto> {
    const where: any = {};

    if (params.batchId) {
      where.batchId = params.batchId;
    }

    if (params.studentId) {
      where.studentProfileId = params.studentId;
    }

    if (params.startDate || params.endDate) {
      where.occurredOn = {};
      if (params.startDate) {
        where.occurredOn.gte = new Date(params.startDate);
      }
      if (params.endDate) {
        where.occurredOn.lte = new Date(params.endDate);
      }
    }

    const attendanceRecords = await prisma.attendance.findMany({
      where,
      include: {
        batch: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    // Group by batch
    const byBatchMap = new Map<string, { present: number; absent: number }>();
    attendanceRecords.forEach(record => {
      const key = record.batchId;
      if (!byBatchMap.has(key)) {
        byBatchMap.set(key, { present: 0, absent: 0 });
      }
      const stats = byBatchMap.get(key)!;
      if (record.status === "PRESENT") {
        stats.present++;
      } else {
        stats.absent++;
      }
    });

    const byBatch = Array.from(byBatchMap.entries()).map(([batchId, stats]) => {
      const batch = attendanceRecords.find(r => r.batchId === batchId)?.batch;
      const total = stats.present + stats.absent;
      return {
        batchId,
        batchName: batch?.name || "Unknown",
        present: stats.present,
        absent: stats.absent,
        percentage: total > 0 ? (stats.present / total) * 100 : 0
      };
    });

    // Group by student
    const byStudentMap = new Map<string, { present: number; absent: number; name: string; email: string }>();
    attendanceRecords.forEach(record => {
      const key = record.studentProfileId;
      if (!byStudentMap.has(key)) {
        byStudentMap.set(key, { present: 0, absent: 0, name: "", email: "" });
      }
      const stats = byStudentMap.get(key)!;
      if (record.status === "PRESENT") {
        stats.present++;
      } else {
        stats.absent++;
      }
    });

    const byStudent = Array.from(byStudentMap.entries()).map(([studentId, stats]) => {
      const total = stats.present + stats.absent;
      return {
        studentId,
        studentName: stats.name,
        present: stats.present,
        absent: stats.absent,
        percentage: total > 0 ? (stats.present / total) * 100 : 0
      };
    });

    // Group by date
    const byDateMap = new Map<string, { present: number; absent: number }>();
    attendanceRecords.forEach(record => {
      const key = record.occurredOn.toISOString().split('T')[0];
      if (!byDateMap.has(key)) {
        byDateMap.set(key, { present: 0, absent: 0 });
      }
      const stats = byDateMap.get(key)!;
      if (record.status === "PRESENT") {
        stats.present++;
      } else {
        stats.absent++;
      }
    });

    const byDate = Array.from(byDateMap.entries()).map(([date, stats]) => {
      const total = stats.present + stats.absent;
      return {
        date,
        present: stats.present,
        absent: stats.absent,
        percentage: total > 0 ? (stats.present / total) * 100 : 0
      };
    });

    return { byBatch, byStudent, byDate };
  }

  async getDdpReport(params: {
    batchId?: string;
    ddpId?: string;
  }): Promise<DdpReportDto> {
    const where: any = {};

    if (params.batchId) {
      where.enrollment = {
        batchId: params.batchId
      };
    }

    if (params.ddpId) {
      where.ddpId = params.ddpId;
    }

    const attempts = await prisma.ddpAttempt.findMany({
      where,
      include: {
        ddp: {
          select: {
            id: true,
            title: true
          }
        },
        enrollment: {
          include: {
            user: {
              select: {
                id: true,
                displayName: true
              }
            }
          }
        }
      }
    });

    // Group by DDP
    const byDdpMap = new Map<string, { attempts: number; totalScore: number; passed: number }>();
    attempts.forEach(attempt => {
      const key = attempt.ddpId;
      if (!byDdpMap.has(key)) {
        byDdpMap.set(key, { attempts: 0, totalScore: 0, passed: 0 });
      }
      const stats = byDdpMap.get(key)!;
      stats.attempts++;
      if (attempt.score !== null) {
        stats.totalScore += attempt.score;
      }
      if (attempt.passed === true) {
        stats.passed++;
      }
    });

    const byDdp = Array.from(byDdpMap.entries()).map(([ddpId, stats]) => {
      const ddp = attempts.find(a => a.ddpId === ddpId)?.ddp;
      const averageScore = stats.attempts > 0 ? stats.totalScore / stats.attempts : 0;
      const passRate = stats.attempts > 0 ? (stats.passed / stats.attempts) * 100 : 0;
      return {
        ddpId,
        ddpTitle: ddp?.title || "Unknown",
        attempts: stats.attempts,
        averageScore,
        passRate
      };
    });

    // Group by student
    const byStudentMap = new Map<string, { attempts: number; totalScore: number; passed: number; name: string }>();
    attempts.forEach(attempt => {
      const key = attempt.enrollment.user.id;
      if (!byStudentMap.has(key)) {
        byStudentMap.set(key, { attempts: 0, totalScore: 0, passed: 0, name: attempt.enrollment.user.displayName });
      }
      const stats = byStudentMap.get(key)!;
      stats.attempts++;
      if (attempt.score !== null) {
        stats.totalScore += attempt.score;
      }
      if (attempt.passed === true) {
        stats.passed++;
      }
    });

    const byStudent = Array.from(byStudentMap.entries()).map(([studentId, stats]) => {
      const averageScore = stats.attempts > 0 ? stats.totalScore / stats.attempts : 0;
      return {
        studentId,
        studentName: stats.name,
        averageScore,
        completed: stats.attempts,
        passed: stats.passed
      };
    });

    return { byDdp, byStudent };
  }

  async getAssignmentReport(params: {
    batchId?: string;
    assignmentId?: string;
  }): Promise<AssignmentReportDto> {
    const where: any = {};

    if (params.batchId) {
      where.enrollment = {
        batchId: params.batchId
      };
    }

    if (params.assignmentId) {
      where.assignmentId = params.assignmentId;
    }

    const submissions = await prisma.assignmentSubmission.findMany({
      where,
      include: {
        assignment: {
          select: {
            id: true,
            title: true
          }
        },
        enrollment: {
          include: {
            user: {
              select: {
                id: true,
                displayName: true
              }
            }
          }
        }
      }
    });

    // Group by assignment
    const byAssignmentMap = new Map<string, { submissions: number; pendingReviews: number; reviewed: number; totalScore: number; resubmissions: number }>();
    submissions.forEach(submission => {
      const key = submission.assignmentId;
      if (!byAssignmentMap.has(key)) {
        byAssignmentMap.set(key, { submissions: 0, pendingReviews: 0, reviewed: 0, totalScore: 0, resubmissions: 0 });
      }
      const stats = byAssignmentMap.get(key)!;
      stats.submissions++;
      if (submission.status === "SUBMITTED" || submission.status === "UNDER_REVIEW") {
        stats.pendingReviews++;
      }
      if (submission.status === "EVALUATED") {
        stats.reviewed++;
        if (submission.score !== null) {
          stats.totalScore += submission.score;
        }
      }
      if (submission.attemptNumber > 1) {
        stats.resubmissions++;
      }
    });

    const byAssignment = Array.from(byAssignmentMap.entries()).map(([assignmentId, stats]) => {
      const assignment = submissions.find(s => s.assignmentId === assignmentId)?.assignment;
      const averageScore = stats.reviewed > 0 ? stats.totalScore / stats.reviewed : 0;
      return {
        assignmentId,
        assignmentTitle: assignment?.title || "Unknown",
        submissions: stats.submissions,
        pendingReviews: stats.pendingReviews,
        reviewed: stats.reviewed,
        averageScore,
        resubmissions: stats.resubmissions
      };
    });

    // Group by student
    const byStudentMap = new Map<string, { submitted: number; totalScore: number; name: string }>();
    submissions.forEach(submission => {
      const key = submission.enrollment.user.id;
      if (!byStudentMap.has(key)) {
        byStudentMap.set(key, { submitted: 0, totalScore: 0, name: submission.enrollment.user.displayName });
      }
      const stats = byStudentMap.get(key)!;
      stats.submitted++;
      if (submission.score !== null) {
        stats.totalScore += submission.score;
      }
    });

    const byStudent = Array.from(byStudentMap.entries()).map(([studentId, stats]) => {
      const averageScore = stats.submitted > 0 ? stats.totalScore / stats.submitted : 0;
      return {
        studentId,
        studentName: stats.name,
        submitted: stats.submitted,
        averageScore
      };
    });

    return { byAssignment, byStudent };
  }

  async getInternshipProgressReport(params: {
    batchId?: string;
  }): Promise<InternshipProgressReportDto> {
    const where: any = {};

    if (params.batchId) {
      where.id = params.batchId;
    }

    const batches = await prisma.batch.findMany({
      where,
      include: {
        program: {
          select: {
            title: true
          }
        },
        enrollments: {
          include: {
            progress: true
          }
        }
      }
    });

    const byInternship = await Promise.all(
      batches.map(async (batch) => {
        const studentCount = batch.enrollments.length;
        
        let totalProgress = 0;
        let totalCompletedDays = 0;
        let totalDays = 0;
        let totalDdpCompletion = 0;
        let totalAssignmentCompletion = 0;

        for (const enrollment of batch.enrollments) {
          const completedDays = enrollment.progress.filter(p => p.status === "COMPLETED").length;
          const enrollmentDays = enrollment.progress.length;
          const enrollmentProgress = enrollmentDays > 0 ? (completedDays / enrollmentDays) * 100 : 0;

          totalProgress += enrollmentProgress;
          totalCompletedDays += completedDays;
          totalDays += enrollmentDays;

          // DDP completion
          const ddpAttempts = await prisma.ddpAttempt.count({
            where: {
              enrollmentId: enrollment.id,
              status: "SUBMITTED"
            }
          });
          totalDdpCompletion += ddpAttempts;

          // Assignment completion
          const assignmentSubmissions = await prisma.assignmentSubmission.count({
            where: {
              enrollmentId: enrollment.id,
              status: "EVALUATED"
            }
          });
          totalAssignmentCompletion += assignmentSubmissions;
        }

        const averageProgress = studentCount > 0 ? totalProgress / studentCount : 0;
        const ddpCompletion = studentCount > 0 ? totalDdpCompletion / studentCount : 0;
        const assignmentCompletion = studentCount > 0 ? totalAssignmentCompletion / studentCount : 0;

        return {
          batchId: batch.id,
          batchName: batch.name,
          students: studentCount,
          averageProgress,
          completedDays: totalCompletedDays,
          ddpCompletion,
          assignmentCompletion
        };
      })
    );

    return { byInternship };
  }

  private generateSlug(text: string): string {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  }

  // Internship Creation
  async getAvailableMentors(): Promise<MentorInfo[]> {
    const mentors = await prisma.mentorProfile.findMany({
      where: {
        user: {
          status: "ACTIVE"
        }
      },
      include: {
        user: {
          select: {
            id: true,
            displayName: true,
            email: true
          }
        },
        batches: {
          include: {
            batch: {
              include: {
                enrollments: true
              }
            }
          }
        }
      }
    });

    return mentors.map(mentor => ({
      id: mentor.id,
      name: mentor.user.displayName,
      email: mentor.user.email,
      expertise: mentor.skills ? mentor.skills.split(',').map(s => s.trim()) : [],
      currentInternships: mentor.batches.length,
      currentStudentCount: mentor.batches.reduce((sum, bm) => sum + bm.batch.enrollments.length, 0),
      availability: mentor.batches.length < 5 ? "Available" : "Fully Booked"
    }));
  }

  async getInternships(params: {
    page?: number;
    pageSize?: number;
    search?: string;
    status?: string;
  }) {
    const page = params.page || 1;
    const pageSize = params.pageSize || 20;
    const skip = (page - 1) * pageSize;

    const where: any = {};

    if (params.search) {
      where.OR = [
        { name: { contains: params.search, mode: "insensitive" } },
        { slug: { contains: params.search, mode: "insensitive" } }
      ];
    }

    if (params.status) {
      where.status = params.status;
    }

    const [batches, total] = await Promise.all([
      prisma.batch.findMany({
        where,
        skip,
        take: pageSize,
        include: {
          program: {
            select: {
              id: true,
              title: true,
              slug: true,
              category: true,
              level: true,
              durationWeeks: true
            }
          },
          mentors: {
            include: {
              mentor: {
                include: {
                  user: {
                    select: {
                      id: true,
                      displayName: true
                    }
                  }
                }
              }
            },
            take: 1
          },
          _count: {
            select: {
              enrollments: true
            }
          }
        },
        orderBy: { createdAt: "desc" }
      }),
      prisma.batch.count({ where })
    ]);

    const items = batches.map(batch => ({
      id: batch.id,
      name: batch.name,
      slug: batch.slug,
      programId: batch.programId,
      programTitle: batch.program.title,
      programSlug: batch.program.slug,
      category: batch.program.category,
      level: batch.program.level,
      durationWeeks: batch.program.durationWeeks,
      startsAt: batch.startsAt?.toISOString() || null,
      endsAt: batch.endsAt?.toISOString() || null,
      status: batch.status,
      capacity: batch.capacity,
      enrolledCount: batch._count.enrollments,
      mentor: batch.mentors[0] ? {
        id: batch.mentors[0].mentor.id,
        name: batch.mentors[0].mentor.user.displayName
      } : null
    }));

    return {
      items,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize)
    };
  }

  async getInternship(internshipId: string) {
    const batch = await prisma.batch.findUnique({
      where: { id: internshipId },
      include: {
        program: {
          select: {
            id: true,
            title: true,
            slug: true,
            description: true,
            category: true,
            level: true,
            durationWeeks: true,
            skills: {
              orderBy: { sortOrder: "asc" }
            },
            outcomes: {
              orderBy: { sortOrder: "asc" }
            },
            requirements: {
              orderBy: { sortOrder: "asc" }
            }
          }
        },
        mentors: {
          include: {
            mentor: {
              include: {
                user: {
                  select: {
                    id: true,
                    displayName: true,
                    email: true
                  }
                }
              }
            }
          }
        },
        enrollments: {
          include: {
            user: {
              select: {
                id: true,
                displayName: true,
                email: true,
                status: true
              }
            }
          }
        }
      }
    });

    if (!batch) {
      throw new Error("Internship not found");
    }

    return {
      id: batch.id,
      name: batch.name,
      slug: batch.slug,
      programId: batch.programId,
      programTitle: batch.program.title,
      programSlug: batch.program.slug,
      description: batch.program.description,
      category: batch.program.category,
      level: batch.program.level,
      durationWeeks: batch.program.durationWeeks,
      skills: batch.program.skills.map(s => s.name),
      outcomes: batch.program.outcomes.map(o => o.body),
      requirements: batch.program.requirements.map(r => r.body),
      startsAt: batch.startsAt?.toISOString() || null,
      endsAt: batch.endsAt?.toISOString() || null,
      enrollmentOpenDate: batch.enrollmentOpenDate?.toISOString() || null,
      enrollmentCloseDate: batch.enrollmentCloseDate?.toISOString() || null,
      status: batch.status,
      capacity: batch.capacity,
      enrolledCount: batch.enrollments.length,
      mentor: batch.mentors[0] ? {
        id: batch.mentors[0].mentor.id,
        name: batch.mentors[0].mentor.user.displayName,
        email: batch.mentors[0].mentor.user.email
      } : null,
      students: batch.enrollments.map(e => ({
        id: e.user.id,
        name: e.user.displayName,
        email: e.user.email,
        status: e.user.status
      }))
    };
  }

  async updateInternshipStatus(internshipId: string, status: string) {
    const batch = await prisma.batch.update({
      where: { id: internshipId },
      data: { status: status as any }
    });

    return {
      id: batch.id,
      status: batch.status
    };
  }

  async assignMentorToInternship(internshipId: string, mentorId: string) {
    // Check if mentor exists
    const mentor = await prisma.mentorProfile.findUnique({
      where: { id: mentorId }
    });

    if (!mentor) {
      throw new Error("Mentor not found");
    }

    // Check if batch exists
    const batch = await prisma.batch.findUnique({
      where: { id: internshipId }
    });

    if (!batch) {
      throw new Error("Internship not found");
    }

    // Check if assignment already exists
    const existing = await prisma.batchMentor.findUnique({
      where: {
        batchId_mentorId: {
          batchId: internshipId,
          mentorId
        }
      }
    });

    if (existing) {
      return { success: true };
    }

    // Create assignment
    await prisma.batchMentor.create({
      data: {
        batchId: internshipId,
        mentorId
      }
    });

    return { success: true };
  }

  async createInternship(data: CreateInternshipRequest): Promise<{ batchId: string; programId: string }> {
    // Step 1: Create or update Program
    const programSlug = this.generateSlug(data.basicDetails.name);
    
    let program;
    const existingProgram = await prisma.program.findUnique({
      where: { slug: programSlug }
    });

    if (existingProgram) {
      // Update existing program
      program = await prisma.program.update({
        where: { id: existingProgram.id },
        data: {
          title: data.basicDetails.name,
          summary: data.basicDetails.description,
          description: data.programInfo.overview,
          durationWeeks: data.basicDetails.durationWeeks,
          durationLabel: `${data.basicDetails.durationWeeks} Weeks`,
          level: data.basicDetails.difficultyLevel,
          category: data.basicDetails.category,
          audience: data.programInfo.eligibilityCriteria.join('\n'),
          learningApproach: data.programInfo.objectives.join('\n'),
          status: "PUBLISHED",
          skills: {
            deleteMany: {},
            create: data.programInfo.skillsDeveloped.map((name, index) => ({
              name,
              sortOrder: index
            }))
          },
          outcomes: {
            deleteMany: {},
            create: data.programInfo.expectedOutcomes.map((body, index) => ({
              body,
              sortOrder: index
            }))
          },
          requirements: {
            deleteMany: {},
            create: data.programInfo.prerequisites.map((body, index) => ({
              body,
              sortOrder: index
            }))
          }
        }
      });
    } else {
      // Create new program
      program = await prisma.program.create({
        data: {
          slug: programSlug,
          title: data.basicDetails.name,
          summary: data.basicDetails.description,
          description: data.programInfo.overview,
          durationWeeks: data.basicDetails.durationWeeks,
          durationLabel: `${data.basicDetails.durationWeeks} Weeks`,
          level: data.basicDetails.difficultyLevel,
          category: data.basicDetails.category,
          audience: data.programInfo.eligibilityCriteria.join('\n'),
          learningApproach: data.programInfo.objectives.join('\n'),
          status: "PUBLISHED",
          skills: {
            create: data.programInfo.skillsDeveloped.map((name, index) => ({
              name,
              sortOrder: index
            }))
          },
          outcomes: {
            create: data.programInfo.expectedOutcomes.map((body, index) => ({
              body,
              sortOrder: index
            }))
          },
          requirements: {
            create: data.programInfo.prerequisites.map((body, index) => ({
              body,
              sortOrder: index
            }))
          }
        }
      });
    }

    // Step 2: Create curriculum structure (weeks)
    // Delete existing weeks for this program if updating
    await prisma.week.deleteMany({
      where: { programId: program.id }
    });

    // Create new weeks based on curriculum structure
    for (const weekData of data.curriculumStructure.weeks) {
      await prisma.week.create({
        data: {
          programId: program.id,
          index: weekData.weekNumber,
          title: weekData.title,
          objective: weekData.description,
          description: weekData.description,
          status: "DRAFT"
        }
      });
    }

    // Step 3: Create batch
    const batchSlug = this.generateSlug(data.batchSetup.batchName);
    const batchData: any = {
      programId: program.id,
      name: data.batchSetup.batchName,
      slug: batchSlug,
      startsAt: new Date(data.batchSetup.startDate),
      endsAt: new Date(data.batchSetup.endDate),
      enrollmentOpenDate: new Date(data.enrollmentConfig.enrollmentStartDate),
      enrollmentCloseDate: new Date(data.enrollmentConfig.enrollmentEndDate),
      capacity: data.batchSetup.maxCapacity,
      description: data.basicDetails.description,
      status: data.basicDetails.status as any,
    };

    // Only add mentor assignment if a valid mentor ID is provided
    if (data.batchSetup.assignedMentorId && data.batchSetup.assignedMentorId.trim() !== "") {
      // Validate that the mentor exists
      const mentorExists = await prisma.mentorProfile.findUnique({
        where: { id: data.batchSetup.assignedMentorId }
      });

      if (mentorExists) {
        batchData.mentors = {
          create: {
            mentorId: data.batchSetup.assignedMentorId
          }
        };
      }
    }

    const batch = await prisma.batch.create({
      data: batchData
    });

    // Step 4: Create announcement if provided
    if (data.announcement && data.announcement.sendImmediately) {
      // Get admin user ID - for now, we'll use a default or pass it in the request
      // This should be improved to get the actual admin user from the request context
      const adminUsers = await prisma.user.findMany({
        where: { role: "ADMIN" },
        take: 1
      });

      if (adminUsers.length > 0) {
        await prisma.announcement.create({
          data: {
            title: data.announcement.title,
            body: data.announcement.body,
            priority: data.announcement.priority,
            batchId: batch.id,
            authorId: adminUsers[0].id
          }
        });
      }
    }

    return {
      batchId: batch.id,
      programId: program.id
    };
  }
}

export const adminService = new AdminService();