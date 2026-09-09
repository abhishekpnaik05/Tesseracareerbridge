import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ChevronRight, Check, Plus, Trash2 } from "lucide-react";
import { createInternship, getAvailableMentors, type CreateInternshipRequest, type MentorInfo } from "../../lib/admin";
import { LoadingState, Button, Input } from "../../components/ui";
import type { 
  InternshipBasicDetails, 
  InternshipProgramInfo, 
  WeekStructure, 
  InternshipCurriculumStructure,
  InternshipBatchSetup,
  InternshipEnrollmentConfig,
  InternshipResource,
  InternshipAnnouncementSetup,
  InternshipCategory,
  InternshipType,
  DifficultyLevel,
  BatchAssignmentMethod
} from "@tesseracareerbridge/shared";

const STEPS = [
  "Basic Details",
  "Program Information", 
  "Curriculum Structure",
  "Mentor Assignment",
  "Batch Setup",
  "Enrollment Configuration",
  "Resources",
  "Announcement",
  "Review & Confirm"
];

const CATEGORIES: InternshipCategory[] = ["Software Development", "Data Science", "Cloud Computing", "DevOps", "Cybersecurity", "AI/ML", "Mobile Development", "Web Development", "Other"];
const TYPES: InternshipType[] = ["Full-time", "Part-time", "Remote", "Hybrid", "On-site"];
const DIFFICULTY_LEVELS: DifficultyLevel[] = ["Beginner", "Intermediate", "Advanced"];
const STATUSES = ["DRAFT", "REGISTRATION_OPEN", "UPCOMING", "ACTIVE", "COMPLETED", "ARCHIVED"];
const BATCH_ASSIGNMENT_METHODS: BatchAssignmentMethod[] = ["AUTOMATIC", "MANUAL", "PENDING_APPROVAL"];

export function AdminInternshipCreatePage() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [mentors, setMentors] = useState<MentorInfo[]>([]);
  const [loadingMentors, setLoadingMentors] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form data
  const [basicDetails, setBasicDetails] = useState<InternshipBasicDetails>({
    name: "",
    code: "",
    description: "",
    category: "Software Development",
    type: "Remote",
    department: "",
    skillArea: "",
    difficultyLevel: "Intermediate",
    durationWeeks: 8,
    startDate: "",
    endDate: "",
    registrationStartDate: "",
    registrationEndDate: "",
    maxStudents: 50,
    status: "DRAFT"
  });

  const [programInfo, setProgramInfo] = useState<InternshipProgramInfo>({
    overview: "",
    objectives: [],
    whatStudentsWillLearn: [],
    skillsDeveloped: [],
    prerequisites: [],
    eligibilityCriteria: [],
    expectedOutcomes: [],
    certificateInfo: "",
    guidelines: "",
    termsConditions: ""
  });

  const [curriculumStructure, setCurriculumStructure] = useState<InternshipCurriculumStructure>({
    totalWeeks: 8,
    weeks: Array.from({ length: 8 }, (_, i) => ({
      weekNumber: i + 1,
      title: `Week ${i + 1}`,
      description: ""
    }))
  });

  const [selectedMentor, setSelectedMentor] = useState<MentorInfo | null>(null);
  const [showMentorConfirmation, setShowMentorConfirmation] = useState(false);

  const [batchSetup, setBatchSetup] = useState<InternshipBatchSetup>({
    batchName: "",
    batchCode: "",
    startDate: "",
    endDate: "",
    maxCapacity: 50,
    assignedMentorId: "",
    enrollmentStatus: "OPEN"
  });

  const [enrollmentConfig, setEnrollmentConfig] = useState<InternshipEnrollmentConfig>({
    whoCanEnroll: "All Students",
    maxStudents: 50,
    registrationRequirement: "None",
    approvalRequired: false,
    enrollmentStartDate: "",
    enrollmentEndDate: "",
    eligibilityCriteria: [],
    batchAssignmentMethod: "AUTOMATIC"
  });

  const [resources, setResources] = useState<InternshipResource[]>([]);
  const [announcement, setAnnouncement] = useState<InternshipAnnouncementSetup | null>(null);

  // Load mentors on component mount
  useEffect(() => {
    async function loadMentors() {
      try {
        setLoadingMentors(true);
        const mentorData = await getAvailableMentors();
        setMentors(mentorData);
      } catch (err) {
        console.error("Failed to load mentors:", err);
      } finally {
        setLoadingMentors(false);
      }
    }
    loadMentors();
  }, []);

  function handleNext() {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
      setError(null);
    }
  }

  function handleBack() {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      setError(null);
    }
  }

  function handleStepClick(step: number) {
    if (step < currentStep) {
      setCurrentStep(step);
      setError(null);
    }
  }

  async function handleSubmit() {
    try {
      setLoading(true);
      setError(null);

      if (!selectedMentor) {
        setError("Please select a mentor before creating the internship.");
        return;
      }

      const requestData: CreateInternshipRequest = {
        basicDetails,
        programInfo,
        curriculumStructure,
        batchSetup: {
          ...batchSetup,
          assignedMentorId: selectedMentor.id
        },
        enrollmentConfig,
        resources,
        announcement
      };

      const result = await createInternship(requestData);
      
      // Navigate to the new internship detail page
      navigate(`/admin/internships/${result.batchId}`);
    } catch (err) {
      setError("Failed to create internship. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  function handleSaveAsDraft() {
    // Implement save as draft logic
    alert("Save as draft functionality - to be implemented with backend support");
  }

  function updateWeeksCount(count: number) {
    const newWeeks = Array.from({ length: count }, (_, i) => ({
      weekNumber: i + 1,
      title: curriculumStructure.weeks[i]?.title || `Week ${i + 1}`,
      description: curriculumStructure.weeks[i]?.description || ""
    }));
    
    setCurriculumStructure({
      totalWeeks: count,
      weeks: newWeeks
    });
  }

  function updateWeek(index: number, field: keyof WeekStructure, value: string) {
    const newWeeks = [...curriculumStructure.weeks];
    newWeeks[index] = { ...newWeeks[index], [field]: value };
    setCurriculumStructure({
      ...curriculumStructure,
      weeks: newWeeks
    });
  }

  function addArrayItem<T>(array: T[], setter: (items: T[]) => void, defaultValue: T) {
    setter([...array, defaultValue]);
  }

  function removeArrayItem<T>(array: T[], setter: (items: T[]) => void, index: number) {
    const newArray = array.filter((_, i) => i !== index);
    setter(newArray);
  }

  function updateArrayItem<T>(array: T[], setter: (items: T[]) => void, index: number, value: T) {
    const newArray = [...array];
    newArray[index] = value;
    setter(newArray);
  }

  if (loading && currentStep === STEPS.length - 1) {
    return (
      <div className="page">
        <div className="container">
          <LoadingState label="Creating internship..." />
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="container">
        <div className="page-header">
          <button className="btn-back" onClick={() => navigate("/admin/internships")}>
            <ArrowLeft />
            Back to Internships
          </button>
          <h1>Create New Internship</h1>
          <p className="text-muted">Set up a new internship program with all required configurations</p>
        </div>

        {/* Progress Steps */}
        <div className="stepper">
          {STEPS.map((step, index) => (
            <div
              key={step}
              className={`stepper-item ${index === currentStep ? "active" : ""} ${index < currentStep ? "completed" : ""}`}
              onClick={() => handleStepClick(index)}
            >
              <div className="stepper-number">
                {index < currentStep ? <Check /> : index + 1}
              </div>
              <div className="stepper-label">{step}</div>
              {index < STEPS.length - 1 && <ChevronRight className="stepper-arrow" />}
            </div>
          ))}
        </div>

        {/* Error Display */}
        {error && (
          <div className="alert alert-danger">
            {error}
          </div>
        )}

        {/* Step Content */}
        <div className="wizard-content">
          {currentStep === 0 && (
            <BasicDetailsStep
              data={basicDetails}
              onChange={setBasicDetails}
              categories={CATEGORIES}
              types={TYPES}
              difficultyLevels={DIFFICULTY_LEVELS}
              statuses={STATUSES}
            />
          )}

          {currentStep === 1 && (
            <ProgramInfoStep
              data={programInfo}
              onChange={setProgramInfo}
              onAddArrayItem={addArrayItem}
              onRemoveArrayItem={removeArrayItem}
              onUpdateArrayItem={updateArrayItem}
            />
          )}

          {currentStep === 2 && (
            <CurriculumStructureStep
              data={curriculumStructure}
              onChange={setCurriculumStructure}
              onUpdateWeek={updateWeek}
              onUpdateWeeksCount={updateWeeksCount}
            />
          )}

          {currentStep === 3 && (
            <MentorAssignmentStep
              mentors={mentors}
              loading={loadingMentors}
              selectedMentor={selectedMentor}
              onSelectMentor={setSelectedMentor}
              showConfirmation={showMentorConfirmation}
              onShowConfirmation={setShowMentorConfirmation}
            />
          )}

          {currentStep === 4 && (
            <BatchSetupStep
              data={batchSetup}
              onChange={setBatchSetup}
            />
          )}

          {currentStep === 5 && (
            <EnrollmentConfigStep
              data={enrollmentConfig}
              onChange={setEnrollmentConfig}
              batchAssignmentMethods={BATCH_ASSIGNMENT_METHODS}
              onAddArrayItem={addArrayItem}
              onRemoveArrayItem={removeArrayItem}
              onUpdateArrayItem={updateArrayItem}
            />
          )}

          {currentStep === 6 && (
            <ResourcesStep
              resources={resources}
              onChange={setResources}
              onAddArrayItem={addArrayItem}
              onRemoveArrayItem={removeArrayItem}
              onUpdateArrayItem={updateArrayItem}
            />
          )}

          {currentStep === 7 && (
            <AnnouncementStep
              data={announcement}
              onChange={setAnnouncement}
            />
          )}

          {currentStep === 8 && (
            <ReviewStep
              basicDetails={basicDetails}
              programInfo={programInfo}
              curriculumStructure={curriculumStructure}
              selectedMentor={selectedMentor}
              batchSetup={batchSetup}
              enrollmentConfig={enrollmentConfig}
              resources={resources}
              announcement={announcement}
            />
          )}
        </div>

        {/* Navigation Buttons */}
        <div className="wizard-actions">
          <Button
            variant="ghost"
            onClick={handleBack}
            disabled={currentStep === 0}
          >
            Back
          </Button>

          <div className="wizard-actions-right">
            {currentStep === STEPS.length - 1 ? (
              <>
                <Button
                  variant="outline"
                  onClick={handleSaveAsDraft}
                  disabled={loading}
                >
                  Save as Draft
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={loading}
                >
                  {loading ? "Creating..." : "Create Internship"}
                </Button>
              </>
            ) : (
              <Button
                onClick={handleNext}
                disabled={!selectedMentor && currentStep === 3}
              >
                Next
                <ChevronRight />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Step Components
function BasicDetailsStep({ 
  data, 
  onChange, 
  categories, 
  types, 
  difficultyLevels, 
  statuses 
}: any) {
  function handleChange(field: keyof InternshipBasicDetails, value: any) {
    onChange({ ...data, [field]: value });
  }

  return (
    <div className="wizard-step">
      <h2>Basic Details</h2>
      <p className="text-muted">Enter the fundamental information about this internship</p>

      <div className="form-grid">
        <div className="form-group">
          <label>Internship Name *</label>
          <Input
            type="text"
            value={data.name}
            onChange={(e) => handleChange("name", e.target.value)}
            placeholder="e.g., Full Stack Web Development Internship"
          />
        </div>

        <div className="form-group">
          <label>Short Name / Code *</label>
          <Input
            type="text"
            value={data.code}
            onChange={(e) => handleChange("code", e.target.value)}
            placeholder="e.g., FSD-2024"
          />
        </div>

        <div className="form-group">
          <label>Category *</label>
          <select
            value={data.category}
            onChange={(e) => handleChange("category", e.target.value)}
            className="form-select"
          >
            {categories.map((cat: InternshipCategory) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Type *</label>
          <select
            value={data.type}
            onChange={(e) => handleChange("type", e.target.value)}
            className="form-select"
          >
            {types.map((type: InternshipType) => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Department / Domain</label>
          <Input
            type="text"
            value={data.department}
            onChange={(e) => handleChange("department", e.target.value)}
            placeholder="e.g., Engineering"
          />
        </div>

        <div className="form-group">
          <label>Skill Area</label>
          <Input
            type="text"
            value={data.skillArea}
            onChange={(e) => handleChange("skillArea", e.target.value)}
            placeholder="e.g., Web Development"
          />
        </div>

        <div className="form-group">
          <label>Difficulty Level *</label>
          <select
            value={data.difficultyLevel}
            onChange={(e) => handleChange("difficultyLevel", e.target.value)}
            className="form-select"
          >
            {difficultyLevels.map((level: DifficultyLevel) => (
              <option key={level} value={level}>{level}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Duration (Weeks) *</label>
          <Input
            type="number"
            value={data.durationWeeks}
            onChange={(e) => handleChange("durationWeeks", parseInt(e.target.value) || 0)}
            min="1"
            max="52"
          />
        </div>

        <div className="form-group">
          <label>Start Date *</label>
          <Input
            type="date"
            value={data.startDate}
            onChange={(e) => handleChange("startDate", e.target.value)}
          />
        </div>

        <div className="form-group">
          <label>End Date *</label>
          <Input
            type="date"
            value={data.endDate}
            onChange={(e) => handleChange("endDate", e.target.value)}
          />
        </div>

        <div className="form-group">
          <label>Registration Start Date *</label>
          <Input
            type="date"
            value={data.registrationStartDate}
            onChange={(e) => handleChange("registrationStartDate", e.target.value)}
          />
        </div>

        <div className="form-group">
          <label>Registration End Date *</label>
          <Input
            type="date"
            value={data.registrationEndDate}
            onChange={(e) => handleChange("registrationEndDate", e.target.value)}
          />
        </div>

        <div className="form-group">
          <label>Maximum Students *</label>
          <Input
            type="number"
            value={data.maxStudents}
            onChange={(e) => handleChange("maxStudents", parseInt(e.target.value) || 0)}
            min="1"
          />
        </div>

        <div className="form-group">
          <label>Status *</label>
          <select
            value={data.status}
            onChange={(e) => handleChange("status", e.target.value)}
            className="form-select"
          >
            {statuses.map((status: string) => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>
        </div>

        <div className="form-group full-width">
          <label>Description</label>
          <textarea
            value={data.description}
            onChange={(e) => handleChange("description", e.target.value)}
            placeholder="Brief description of the internship..."
            rows={4}
            className="form-textarea"
          />
        </div>
      </div>
    </div>
  );
}

function ProgramInfoStep({ 
  data, 
  onChange, 
  onAddArrayItem, 
  onRemoveArrayItem, 
  onUpdateArrayItem 
}: any) {
  function handleChange(field: keyof InternshipProgramInfo, value: any) {
    onChange({ ...data, [field]: value });
  }

  return (
    <div className="wizard-step">
      <h2>Program Information</h2>
      <p className="text-muted">Define what students will learn and the program objectives</p>

      <div className="form-grid">
        <div className="form-group full-width">
          <label>Overview</label>
          <textarea
            value={data.overview}
            onChange={(e) => handleChange("overview", e.target.value)}
            placeholder="Program overview and description..."
            rows={4}
            className="form-textarea"
          />
        </div>

        <ArrayInputField
          label="Objectives"
          items={data.objectives}
          onAdd={() => onAddArrayItem(data.objectives, (items: string[]) => handleChange("objectives", items), "")}
          onRemove={(index: number) => onRemoveArrayItem(data.objectives, (items: string[]) => handleChange("objectives", items), index)}
          onUpdate={(index: number, value: string) => onUpdateArrayItem(data.objectives, (items: string[]) => handleChange("objectives", items), index, value)}
          placeholder="Enter learning objective"
        />

        <ArrayInputField
          label="What Students Will Learn"
          items={data.whatStudentsWillLearn}
          onAdd={() => onAddArrayItem(data.whatStudentsWillLearn, (items: string[]) => handleChange("whatStudentsWillLearn", items), "")}
          onRemove={(index: number) => onRemoveArrayItem(data.whatStudentsWillLearn, (items: string[]) => handleChange("whatStudentsWillLearn", items), index)}
          onUpdate={(index: number, value: string) => onUpdateArrayItem(data.whatStudentsWillLearn, (items: string[]) => handleChange("whatStudentsWillLearn", items), index, value)}
          placeholder="Enter learning topic"
        />

        <ArrayInputField
          label="Skills Developed"
          items={data.skillsDeveloped}
          onAdd={() => onAddArrayItem(data.skillsDeveloped, (items: string[]) => handleChange("skillsDeveloped", items), "")}
          onRemove={(index: number) => onRemoveArrayItem(data.skillsDeveloped, (items: string[]) => handleChange("skillsDeveloped", items), index)}
          onUpdate={(index: number, value: string) => onUpdateArrayItem(data.skillsDeveloped, (items: string[]) => handleChange("skillsDeveloped", items), index, value)}
          placeholder="Enter skill"
        />

        <ArrayInputField
          label="Prerequisites"
          items={data.prerequisites}
          onAdd={() => onAddArrayItem(data.prerequisites, (items: string[]) => handleChange("prerequisites", items), "")}
          onRemove={(index: number) => onRemoveArrayItem(data.prerequisites, (items: string[]) => handleChange("prerequisites", items), index)}
          onUpdate={(index: number, value: string) => onUpdateArrayItem(data.prerequisites, (items: string[]) => handleChange("prerequisites", items), index, value)}
          placeholder="Enter prerequisite"
        />

        <ArrayInputField
          label="Eligibility Criteria"
          items={data.eligibilityCriteria}
          onAdd={() => onAddArrayItem(data.eligibilityCriteria, (items: string[]) => handleChange("eligibilityCriteria", items), "")}
          onRemove={(index: number) => onRemoveArrayItem(data.eligibilityCriteria, (items: string[]) => handleChange("eligibilityCriteria", items), index)}
          onUpdate={(index: number, value: string) => onUpdateArrayItem(data.eligibilityCriteria, (items: string[]) => handleChange("eligibilityCriteria", items), index, value)}
          placeholder="Enter eligibility requirement"
        />

        <ArrayInputField
          label="Expected Outcomes"
          items={data.expectedOutcomes}
          onAdd={() => onAddArrayItem(data.expectedOutcomes, (items: string[]) => handleChange("expectedOutcomes", items), "")}
          onRemove={(index: number) => onRemoveArrayItem(data.expectedOutcomes, (items: string[]) => handleChange("expectedOutcomes", items), index)}
          onUpdate={(index: number, value: string) => onUpdateArrayItem(data.expectedOutcomes, (items: string[]) => handleChange("expectedOutcomes", items), index, value)}
          placeholder="Enter expected outcome"
        />

        <div className="form-group full-width">
          <label>Certificate Information</label>
          <textarea
            value={data.certificateInfo}
            onChange={(e) => handleChange("certificateInfo", e.target.value)}
            placeholder="Details about certification..."
            rows={3}
            className="form-textarea"
          />
        </div>

        <div className="form-group full-width">
          <label>Guidelines</label>
          <textarea
            value={data.guidelines}
            onChange={(e) => handleChange("guidelines", e.target.value)}
            placeholder="Program guidelines and rules..."
            rows={3}
            className="form-textarea"
          />
        </div>

        <div className="form-group full-width">
          <label>Terms & Conditions</label>
          <textarea
            value={data.termsConditions}
            onChange={(e) => handleChange("termsConditions", e.target.value)}
            placeholder="Terms and conditions..."
            rows={3}
            className="form-textarea"
          />
        </div>
      </div>
    </div>
  );
}

function CurriculumStructureStep({ 
  data, 
  onUpdateWeek, 
  onUpdateWeeksCount 
}: any) {
  return (
    <div className="wizard-step">
      <h2>Curriculum Structure</h2>
      <p className="text-muted">Define the high-level week structure for the internship</p>

      <div className="form-grid">
        <div className="form-group">
          <label>Total Number of Weeks</label>
          <Input
            type="number"
            value={data.totalWeeks}
            onChange={(e) => onUpdateWeeksCount(parseInt(e.target.value) || 1)}
            min="1"
            max="52"
          />
        </div>
      </div>

      <div className="weeks-structure">
        {data.weeks.map((week: WeekStructure, index: number) => (
          <div key={week.weekNumber} className="week-card">
            <div className="week-header">
              <span className="week-number">Week {week.weekNumber}</span>
            </div>
            <div className="week-form">
              <div className="form-group">
                <label>Week Title</label>
                <Input
                  type="text"
                  value={week.title}
                  onChange={(e) => onUpdateWeek(index, "title", e.target.value)}
                  placeholder="e.g., Introduction & Fundamentals"
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={week.description}
                  onChange={(e) => onUpdateWeek(index, "description", e.target.value)}
                  placeholder="Brief description of this week..."
                  rows={2}
                  className="form-textarea"
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function MentorAssignmentStep({ 
  mentors, 
  loading, 
  selectedMentor, 
  onSelectMentor, 
  showConfirmation, 
  onShowConfirmation 
}: any) {
  function handleSelectMentor(mentor: MentorInfo) {
    onSelectMentor(mentor);
    onShowConfirmation(true);
  }

  function handleConfirmSelection() {
    onShowConfirmation(false);
  }

  function handleCancelSelection() {
    onSelectMentor(null);
    onShowConfirmation(false);
  }

  if (loading) {
    return <LoadingState label="Loading available mentors..." />;
  }

  return (
    <div className="wizard-step">
      <h2>Mentor Assignment</h2>
      <p className="text-muted">Select the mentor who will be responsible for this internship</p>

      {!showConfirmation ? (
        <div className="mentors-grid">
          {mentors.length === 0 ? (
            <div className="empty-state">No available mentors found</div>
          ) : (
            mentors.map((mentor: MentorInfo) => (
              <div
                key={mentor.id}
                className={`mentor-card ${selectedMentor?.id === mentor.id ? "selected" : ""}`}
                onClick={() => handleSelectMentor(mentor)}
              >
                <div className="mentor-header">
                  <h3>{mentor.name}</h3>
                  <span className={`availability-badge ${mentor.availability === "Available" ? "available" : "fully-booked"}`}>
                    {mentor.availability}
                  </span>
                </div>
                <div className="mentor-details">
                  <p><strong>Email:</strong> {mentor.email}</p>
                  <p><strong>Expertise:</strong> {mentor.expertise.join(", ")}</p>
                  <p><strong>Current Internships:</strong> {mentor.currentInternships}</p>
                  <p><strong>Current Students:</strong> {mentor.currentStudentCount}</p>
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        <div className="mentor-confirmation">
          <div className="confirmation-card">
            <h3>Confirm Mentor Assignment</h3>
            <p>You are assigning this mentor to this internship:</p>
            <div className="selected-mentor-summary">
              <p><strong>Name:</strong> {selectedMentor?.name}</p>
              <p><strong>Email:</strong> {selectedMentor?.email}</p>
              <p><strong>Expertise:</strong> {selectedMentor?.expertise.join(", ")}</p>
            </div>
            <div className="confirmation-actions">
              <Button variant="outline" onClick={handleCancelSelection}>
                Cancel
              </Button>
              <Button onClick={handleConfirmSelection}>
                Confirm Assignment
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function BatchSetupStep({ data, onChange }: any) {
  function handleChange(field: keyof InternshipBatchSetup, value: any) {
    onChange({ ...data, [field]: value });
  }

  return (
    <div className="wizard-step">
      <h2>Batch Setup</h2>
      <p className="text-muted">Create the first batch for this internship</p>

      <div className="form-grid">
        <div className="form-group">
          <label>Batch Name *</label>
          <Input
            type="text"
            value={data.batchName}
            onChange={(e) => handleChange("batchName", e.target.value)}
            placeholder="e.g., FSD Internship — Batch 01"
          />
        </div>

        <div className="form-group">
          <label>Batch Code *</label>
          <Input
            type="text"
            value={data.batchCode}
            onChange={(e) => handleChange("batchCode", e.target.value)}
            placeholder="e.g., FSD-B01"
          />
        </div>

        <div className="form-group">
          <label>Start Date *</label>
          <Input
            type="date"
            value={data.startDate}
            onChange={(e) => handleChange("startDate", e.target.value)}
          />
        </div>

        <div className="form-group">
          <label>End Date *</label>
          <Input
            type="date"
            value={data.endDate}
            onChange={(e) => handleChange("endDate", e.target.value)}
          />
        </div>

        <div className="form-group">
          <label>Maximum Capacity *</label>
          <Input
            type="number"
            value={data.maxCapacity}
            onChange={(e) => handleChange("maxCapacity", parseInt(e.target.value) || 0)}
            min="1"
          />
        </div>

        <div className="form-group">
          <label>Enrollment Status</label>
          <select
            value={data.enrollmentStatus}
            onChange={(e) => handleChange("enrollmentStatus", e.target.value)}
            className="form-select"
          >
            <option value="OPEN">Open</option>
            <option value="CLOSED">Closed</option>
            <option value="UPCOMING">Upcoming</option>
          </select>
        </div>
      </div>
    </div>
  );
}

function EnrollmentConfigStep({ 
  data, 
  onChange, 
  batchAssignmentMethods, 
  onAddArrayItem, 
  onRemoveArrayItem, 
  onUpdateArrayItem 
}: any) {
  function handleChange(field: keyof InternshipEnrollmentConfig, value: any) {
    onChange({ ...data, [field]: value });
  }

  return (
    <div className="wizard-step">
      <h2>Enrollment Configuration</h2>
      <p className="text-muted">Configure how students can enroll in this internship</p>

      <div className="form-grid">
        <div className="form-group">
          <label>Who Can Enroll</label>
          <Input
            type="text"
            value={data.whoCanEnroll}
            onChange={(e) => handleChange("whoCanEnroll", e.target.value)}
            placeholder="e.g., All Students"
          />
        </div>

        <div className="form-group">
          <label>Maximum Students</label>
          <Input
            type="number"
            value={data.maxStudents}
            onChange={(e) => handleChange("maxStudents", parseInt(e.target.value) || 0)}
            min="1"
          />
        </div>

        <div className="form-group">
          <label>Registration Requirement</label>
          <Input
            type="text"
            value={data.registrationRequirement}
            onChange={(e) => handleChange("registrationRequirement", e.target.value)}
            placeholder="e.g., None"
          />
        </div>

        <div className="form-group">
          <label>Approval Required</label>
          <select
            value={data.approvalRequired.toString()}
            onChange={(e) => handleChange("approvalRequired", e.target.value === "true")}
            className="form-select"
          >
            <option value="false">No</option>
            <option value="true">Yes</option>
          </select>
        </div>

        <div className="form-group">
          <label>Enrollment Start Date</label>
          <Input
            type="date"
            value={data.enrollmentStartDate}
            onChange={(e) => handleChange("enrollmentStartDate", e.target.value)}
          />
        </div>

        <div className="form-group">
          <label>Enrollment End Date</label>
          <Input
            type="date"
            value={data.enrollmentEndDate}
            onChange={(e) => handleChange("enrollmentEndDate", e.target.value)}
          />
        </div>

        <div className="form-group">
          <label>Batch Assignment Method</label>
          <select
            value={data.batchAssignmentMethod}
            onChange={(e) => handleChange("batchAssignmentMethod", e.target.value)}
            className="form-select"
          >
            {batchAssignmentMethods.map((method: BatchAssignmentMethod) => (
              <option key={method} value={method}>{method}</option>
            ))}
          </select>
        </div>

        <ArrayInputField
          label="Eligibility Criteria"
          items={data.eligibilityCriteria}
          onAdd={() => onAddArrayItem(data.eligibilityCriteria, (items: string[]) => handleChange("eligibilityCriteria", items), "")}
          onRemove={(index: number) => onRemoveArrayItem(data.eligibilityCriteria, (items: string[]) => handleChange("eligibilityCriteria", items), index)}
          onUpdate={(index: number, value: string) => onUpdateArrayItem(data.eligibilityCriteria, (items: string[]) => handleChange("eligibilityCriteria", items), index, value)}
          placeholder="Enter eligibility criterion"
        />
      </div>
    </div>
  );
}

function ResourcesStep({ 
  resources, 
  onChange, 
  onAddArrayItem, 
  onRemoveArrayItem, 
  onUpdateArrayItem 
}: any) {
  function handleAddResource() {
    onAddArrayItem(resources, onChange, {
      title: "",
      type: "PDF",
      description: ""
    });
  }

  return (
    <div className="wizard-step">
      <h2>Resources (Optional)</h2>
      <p className="text-muted">Add general resources for the internship</p>

      <div className="resources-list">
        {resources.map((resource: InternshipResource, index: number) => (
          <div key={index} className="resource-card">
            <div className="resource-form">
              <div className="form-group">
                <label>Title</label>
                <Input
                  type="text"
                  value={resource.title}
                  onChange={(e) => onUpdateArrayItem(resources, onChange, index, { ...resource, title: e.target.value })}
                  placeholder="Resource title"
                />
              </div>
              <div className="form-group">
                <label>Type</label>
                <select
                  value={resource.type}
                  onChange={(e) => onUpdateArrayItem(resources, onChange, index, { ...resource, type: e.target.value })}
                  className="form-select"
                >
                  <option value="PDF">PDF</option>
                  <option value="VIDEO">Video</option>
                  <option value="LINK">Link</option>
                  <option value="DOCUMENT">Document</option>
                </select>
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={resource.description}
                  onChange={(e) => onUpdateArrayItem(resources, onChange, index, { ...resource, description: e.target.value })}
                  placeholder="Resource description"
                  rows={2}
                  className="form-textarea"
                />
              </div>
            </div>
            <Button
              variant="danger"
              size="sm"
              onClick={() => onRemoveArrayItem(resources, onChange, index)}
            >
              <Trash2 />
            </Button>
          </div>
        ))}

        <Button variant="outline" onClick={handleAddResource}>
          <Plus />
          Add Resource
        </Button>
      </div>
    </div>
  );
}

function AnnouncementStep({ data, onChange }: any) {
  function handleToggleAnnouncement() {
    if (data) {
      onChange(null);
    } else {
      onChange({
        title: "",
        body: "",
        priority: "NORMAL",
        targetAudience: "STUDENTS",
        sendImmediately: false
      });
    }
  }

  function handleChange(field: keyof InternshipAnnouncementSetup, value: any) {
    if (data) {
      onChange({ ...data, [field]: value });
    }
  }

  return (
    <div className="wizard-step">
      <h2>Announcement Setup (Optional)</h2>
      <p className="text-muted">Create an initial announcement for the internship</p>

      <div className="form-group">
        <label>
          <input
            type="checkbox"
            checked={data !== null}
            onChange={handleToggleAnnouncement}
          />
          Create announcement
        </label>
      </div>

      {data && (
        <div className="form-grid">
          <div className="form-group full-width">
            <label>Title</label>
            <Input
              type="text"
              value={data.title}
              onChange={(e) => handleChange("title", e.target.value)}
              placeholder="Announcement title"
            />
          </div>

          <div className="form-group full-width">
            <label>Body</label>
            <textarea
              value={data.body}
              onChange={(e) => handleChange("body", e.target.value)}
              placeholder="Announcement content..."
              rows={4}
              className="form-textarea"
            />
          </div>

          <div className="form-group">
            <label>Priority</label>
            <select
              value={data.priority}
              onChange={(e) => handleChange("priority", e.target.value)}
              className="form-select"
            >
              <option value="NORMAL">Normal</option>
              <option value="IMPORTANT">Important</option>
              <option value="URGENT">Urgent</option>
            </select>
          </div>

          <div className="form-group">
            <label>Target Audience</label>
            <select
              value={data.targetAudience}
              onChange={(e) => handleChange("targetAudience", e.target.value)}
              className="form-select"
            >
              <option value="STUDENTS">Students</option>
              <option value="SPECIFIC_PROGRAM">Specific Program</option>
              <option value="SPECIFIC_INTERNSHIP">Specific Internship</option>
              <option value="SPECIFIC_BATCH">Specific Batch</option>
            </select>
          </div>

          <div className="form-group">
            <label>
              <input
                type="checkbox"
                checked={data.sendImmediately}
                onChange={(e) => handleChange("sendImmediately", e.target.checked)}
              />
              Send immediately after creation
            </label>
          </div>
        </div>
      )}
    </div>
  );
}

function ReviewStep({ 
  basicDetails, 
  programInfo, 
  curriculumStructure, 
  selectedMentor, 
  batchSetup, 
  enrollmentConfig, 
  resources, 
  announcement 
}: any) {
  return (
    <div className="wizard-step">
      <h2>Review & Confirm</h2>
      <p className="text-muted">Review all the information before creating the internship</p>

      <div className="review-sections">
        <div className="review-section">
          <h3>Internship</h3>
          <ReviewRow label="Name" value={basicDetails.name} />
          <ReviewRow label="Code" value={basicDetails.code} />
          <ReviewRow label="Category" value={basicDetails.category} />
          <ReviewRow label="Duration" value={`${basicDetails.durationWeeks} weeks`} />
          <ReviewRow label="Start Date" value={basicDetails.startDate} />
          <ReviewRow label="End Date" value={basicDetails.endDate} />
          <ReviewRow label="Status" value={basicDetails.status} />
        </div>

        <div className="review-section">
          <h3>Program</h3>
          <ReviewRow label="Description" value={basicDetails.description} multiline />
          <ReviewRow label="Objectives" value={programInfo.objectives.join(", ")} multiline />
          <ReviewRow label="Skills" value={programInfo.skillsDeveloped.join(", ")} multiline />
          <ReviewRow label="Eligibility" value={programInfo.eligibilityCriteria.join(", ")} multiline />
        </div>

        <div className="review-section">
          <h3>Structure</h3>
          <ReviewRow label="Number of Weeks" value={curriculumStructure.totalWeeks.toString()} />
          <ReviewRow label="Week Names" value={curriculumStructure.weeks.map((w: WeekStructure) => w.title).join(", ")} multiline />
        </div>

        <div className="review-section">
          <h3>Mentor</h3>
          {selectedMentor ? (
            <>
              <ReviewRow label="Name" value={selectedMentor.name} />
              <ReviewRow label="Email" value={selectedMentor.email} />
            </>
          ) : (
            <p className="text-muted">No mentor selected</p>
          )}
        </div>

        <div className="review-section">
          <h3>Batch</h3>
          <ReviewRow label="Name" value={batchSetup.batchName} />
          <ReviewRow label="Dates" value={`${batchSetup.startDate} to ${batchSetup.endDate}`} />
          <ReviewRow label="Capacity" value={batchSetup.maxCapacity.toString()} />
        </div>

        <div className="review-section">
          <h3>Enrollment</h3>
          <ReviewRow label="Registration Dates" value={`${enrollmentConfig.enrollmentStartDate} to ${enrollmentConfig.enrollmentEndDate}`} />
          <ReviewRow label="Maximum Students" value={enrollmentConfig.maxStudents.toString()} />
          <ReviewRow label="Approval Settings" value={enrollmentConfig.approvalRequired ? "Approval Required" : "Automatic"} />
        </div>

        {resources.length > 0 && (
          <div className="review-section">
            <h3>Resources</h3>
            {resources.map((resource: InternshipResource, index: number) => (
              <div key={index} className="resource-review-item">
                <strong>{resource.title}</strong> ({resource.type})
              </div>
            ))}
          </div>
        )}

        {announcement && (
          <div className="review-section">
            <h3>Announcement</h3>
            <ReviewRow label="Title" value={announcement.title} />
            <ReviewRow label="Priority" value={announcement.priority} />
            <ReviewRow label="Send Immediately" value={announcement.sendImmediately ? "Yes" : "No"} />
          </div>
        )}
      </div>
    </div>
  );
}

function ReviewRow({ label, value, multiline }: { label: string; value: string; multiline?: boolean }) {
  return (
    <div className="review-row">
      <span className="review-label">{label}:</span>
      <span className={`review-value ${multiline ? "multiline" : ""}`}>{value || "-"}</span>
    </div>
  );
}

function ArrayInputField({ 
  label, 
  items, 
  onAdd, 
  onRemove, 
  onUpdate, 
  placeholder 
}: any) {
  return (
    <div className="form-group full-width">
      <label>{label}</label>
      <div className="array-input-list">
        {items.map((item: string, index: number) => (
          <div key={index} className="array-input-item">
            <Input
              type="text"
              value={item}
              onChange={(e) => onUpdate(index, e.target.value)}
              placeholder={placeholder}
            />
            <Button
              variant="danger"
              size="sm"
              onClick={() => onRemove(index)}
            >
              <Trash2 />
            </Button>
          </div>
        ))}
        <Button variant="outline" size="sm" onClick={onAdd}>
          <Plus />
          Add
        </Button>
      </div>
    </div>
  );
}