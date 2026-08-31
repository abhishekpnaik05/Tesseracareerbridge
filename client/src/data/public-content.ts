export const JOURNEY_STEPS = [
  { n: "01", title: "Choose a Program", body: "Pick an internship that matches the skills you want to practice." },
  { n: "02", title: "Enroll in a Batch", body: "Join a scheduled cohort with mentors and a shared calendar." },
  { n: "03", title: "Follow Daily Learning", body: "Open today. Watch, read, and practice what that day requires." },
  { n: "04", title: "Complete DDP & Assignments", body: "Daily development practice and submissions keep progress honest." },
  { n: "05", title: "Build Projects", body: "Mini builds lead to a major project you can explain in an interview." },
  { n: "06", title: "Get Mentor Feedback", body: "Doubts, reviews, and course-correction — not silent video queues." },
  { n: "07", title: "Complete Final Evaluation", body: "Eligibility is earned. Evaluation confirms you can do the work." },
  { n: "08", title: "Receive Certificate", body: "A verified certificate after the work — not instead of the work." },
];

export const HOW_IT_WORKS_STAGES = [
  { id: "discover", title: "Discover", body: "Browse programs, duration, level, and outcomes. Nothing is hidden behind a login for the public preview." },
  { id: "choose", title: "Choose Program", body: "Select the internship that matches your semester, interest, and time." },
  { id: "enroll", title: "Enroll", body: "Join an open batch. Enrollment and payments are handled in later product steps." },
  { id: "learn", title: "Learn", body: "Each day has an objective, video, notes, and resources from the curriculum — not a random feed." },
  { id: "practice", title: "Practice", body: "Short tasks lock in what you watched before you move on." },
  { id: "ddp", title: "DDP", body: "Daily development practice asks you to apply the idea in writing or in a small exercise." },
  { id: "assignments", title: "Assignments", body: "Longer briefs with deadlines, submissions, and evaluation." },
  { id: "mentorship", title: "Mentorship", body: "Ask doubts, receive reviews, and stay accountable to a person who sees your batch." },
  { id: "projects", title: "Projects", body: "Ship work that can sit in a portfolio: mini projects, then a major project." },
  { id: "evaluation", title: "Evaluation", body: "Final assessment confirms eligibility for certification." },
  { id: "certificate", title: "Certificate", body: "Verified documents are issued after requirements are met." },
];

export const FAQ_CATEGORIES = [
  {
    id: "general",
    title: "General",
    items: [
      { id: "g1", title: "What is TesseraCareerBridge?", body: "A structured internship and career-learning platform. Students follow programs, batches, and day-wise work with mentorship and certification." },
      { id: "g2", title: "Who is it for?", body: "Primarily VTU students who need a serious internship rhythm — not a collection of unrelated lectures." },
    ],
  },
  {
    id: "programs",
    title: "Programs",
    items: [
      { id: "p1", title: "Are these the only internships you will ever offer?", body: "No. Programs are data-driven. New internships can be published without redesigning the website." },
      { id: "p2", title: "Do all programs use the same daily model?", body: "Yes in structure: weeks, days, practice, DDP, assignments, projects. Content differs by program." },
    ],
  },
  {
    id: "enrollment",
    title: "Enrollment",
    items: [
      { id: "e1", title: "How do I enroll?", body: "Choose a program, then enroll in an open batch. Account creation and payment flows arrive in later product work." },
      { id: "e2", title: "Can I switch batches?", body: "Batch changes are an operations decision. Contact support once your account exists." },
    ],
  },
  {
    id: "learning",
    title: "Learning",
    items: [
      { id: "l1", title: "What does a typical day look like?", body: "Objective, video, notes, resources, practice, then any DDP or assignment attached to that day." },
      { id: "l2", title: "Is the curriculum hard-coded in the app?", body: "No. Days and topics come from the database so each program can have its own syllabus." },
    ],
  },
  {
    id: "assignments",
    title: "Assignments",
    items: [
      { id: "a1", title: "How are assignments evaluated?", body: "Mentors review submissions for assigned batches. Scores and feedback live with the evaluation record." },
    ],
  },
  {
    id: "projects",
    title: "Projects",
    items: [
      { id: "pr1", title: "Will I have something to show in interviews?", body: "That is the point of mini projects, a major project, and a documented write-up — not only attendance." },
    ],
  },
  {
    id: "mentorship",
    title: "Mentorship",
    items: [
      { id: "m1", title: "Who sees my doubts?", body: "Mentors assigned to your batch. You are not posting into an empty forum." },
    ],
  },
  {
    id: "certificates",
    title: "Certificates",
    items: [
      { id: "c1", title: "When is a certificate issued?", body: "After eligibility requirements and final evaluation. Issuance is not automatic on day one." },
      { id: "c2", title: "Can someone verify it?", body: "Verification is planned as a public code on the issued document. That feature is not live yet." },
    ],
  },
];

export const PRIVACY_SECTIONS = [
  { title: "Introduction", body: "This page describes how TesseraCareerBridge intends to treat information. It is a structural draft, not a certified legal opinion." },
  { title: "Information collected", body: "Accounts may include name, email, academic identifiers, and learning activity. Exact fields will be listed when registration is live." },
  { title: "How information is used", body: "To operate internships: enrollment, learning progress, mentorship, evaluation, and certificates." },
  { title: "Data protection", body: "Access is role-scoped. Students see their own data. Mentors see assigned batches. Admins see what their permissions allow." },
  { title: "Cookies", body: "The site may use cookies required for session and preferences. A detailed cookie list will be published with production authentication." },
  { title: "Third-party services", body: "Future services may include email, object storage, and payments. Those processors will be named when contracted." },
  { title: "Student information", body: "Academic fields such as USN are collected only to run internships and documentation — not to sell lists." },
  { title: "Data retention", body: "Records needed for certificates and evaluations may be kept longer than day-to-day session data. Retention periods will be confirmed in a later legal review." },
  { title: "User rights", body: "You may request access or correction of your account data through the contact channel once accounts exist." },
  { title: "Contact", body: "Use the contact page. Do not send passwords or identity documents through unofficial channels." },
];

export const TERMS_SECTIONS = [
  { title: "Introduction", body: "These terms will govern use of TesseraCareerBridge. They are a placeholder structure until counsel reviews them." },
  { title: "Eligibility", body: "Programs may require student status, a specific university, or batch capacity. Eligibility is defined per program and batch." },
  { title: "Account", body: "You are responsible for credentials issued to you. Do not share logins." },
  { title: "Program enrollment", body: "Enrollment binds you to a program and batch. Completion rules are defined by that program’s curriculum and evaluations." },
  { title: "Learning content", body: "Videos, notes, and resources are licensed for enrolled students. Copying them for public distribution is not allowed." },
  { title: "Assignments", body: "Submissions must be your own work unless a brief says otherwise. Plagiarism can affect evaluation and certification." },
  { title: "Projects", body: "Project IP defaults to the student unless a batch agreement states otherwise. We may show anonymized examples in marketing only with permission." },
  { title: "Payments", body: "If a program is paid, prices, refunds, and invoices will be stated at checkout. Payment processing is not live on this site yet." },
  { title: "Intellectual property", body: "The TesseraCareerBridge product, design, and platform code remain ours. Your submissions remain yours as described above." },
  { title: "Student responsibilities", body: "Attend as required, submit on time, and treat mentors and peers professionally." },
  { title: "Termination", body: "We may suspend access for abuse, fraud, or serious academic misconduct. You may withdraw according to batch policy." },
  { title: "Limitation of liability", body: "The platform does not guarantee employment. Certificates confirm program completion, not a job offer." },
  { title: "Changes", body: "Terms may change. Material changes will be posted on this page." },
  { title: "Contact", body: "Questions about these terms: use the contact page." },
];
