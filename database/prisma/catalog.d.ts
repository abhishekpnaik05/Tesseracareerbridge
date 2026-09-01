export interface CatalogProgram {
    slug: string;
    title: string;
    summary: string;
    description: string;
    durationWeeks: number;
    durationLabel: string;
    level: string;
    category: string;
    featured: boolean;
    availability: string;
    audience: string;
    learningApproach: string;
    learningDaysPerWeek: number;
    visualTone: "a" | "b" | "c" | "d";
    skills: string[];
    requirements: string[];
    outcomes: string[];
    benefits: {
        title: string;
        body: string;
    }[];
    faqs: {
        title: string;
        body: string;
    }[];
    weeks: {
        title: string;
        days: string[];
    }[];
    projects: {
        title: string;
        type: string;
        description: string;
        difficulty: string;
        skills: string[];
    }[];
    batches: {
        name: string;
        slug: string;
        startsAt: Date;
        endsAt: Date;
        enrollmentOpenDate: Date;
        enrollmentCloseDate: Date;
        capacity: number;
        status: "DRAFT" | "UPCOMING" | "OPEN" | "FULL" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
        description?: string;
    }[];
}
export declare const CATALOG_PROGRAMS: CatalogProgram[];
