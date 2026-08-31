-- ============================================================================
-- BHMS AI — SUPABASE POSTGRESQL MASTER DATABASE SCHEMA MIGRATION
-- Project URL: https://dxjopdtrtknlbrydzwaw.supabase.co
-- Target Schema: public
-- Includes: DDL Tables, Foreign Key Constraints, Indexes, RLS Policies
-- ============================================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- 1. USERS & PROFILES
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    auth_user_id UUID UNIQUE, -- References auth.users(id) in Supabase Auth
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    full_name TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'STUDENT', -- STUDENT, DOCTOR, FACULTY, PATIENT, ADMIN
    avatar_url TEXT,
    phone TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.student_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    year_of_study INT NOT NULL DEFAULT 1,
    college TEXT NOT NULL DEFAULT 'National Homoeopathic Medical College',
    target_exam TEXT NOT NULL DEFAULT 'AIAPGET & University Exams',
    streak_days INT NOT NULL DEFAULT 0,
    total_study_hours FLOAT NOT NULL DEFAULT 0.0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_student_user UNIQUE (user_id)
);

CREATE TABLE IF NOT EXISTS public.doctor_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    clinic_name TEXT NOT NULL DEFAULT 'Homoeopathic Healing Centre',
    registration_number TEXT NOT NULL DEFAULT 'CCH-2018-9482',
    specialization TEXT NOT NULL DEFAULT 'Classical Homoeopathy & Chronic Diseases',
    years_of_practice INT NOT NULL DEFAULT 5,
    clinic_address TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_doctor_user UNIQUE (user_id)
);

CREATE TABLE IF NOT EXISTS public.faculty_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    institution TEXT NOT NULL DEFAULT 'National Institute of Homoeopathy',
    designation TEXT NOT NULL DEFAULT 'Professor & HOD Organon of Medicine',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_faculty_user UNIQUE (user_id)
);

CREATE TABLE IF NOT EXISTS public.patient_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    age INT DEFAULT 32,
    gender TEXT DEFAULT 'Male',
    date_of_birth DATE,
    phone TEXT DEFAULT '+91 98765 43210',
    address TEXT DEFAULT '42, Sunrise Apartments, Pune, Maharashtra',
    emergency_contact TEXT DEFAULT '+91 98765 00000 (Spouse)',
    blood_group TEXT DEFAULT 'B+',
    allergies TEXT DEFAULT 'Dust mites, Pollen (no known drug allergies)',
    primary_doctor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_patient_user UNIQUE (user_id)
);

-- ============================================================================
-- 2. DOCTOR-PATIENT RELATIONSHIP & APPOINTMENTS
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.doctor_patient_relationships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    doctor_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    patient_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'active', -- pending, active, rejected, inactive
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_doc_patient UNIQUE (doctor_id, patient_id)
);

CREATE TABLE IF NOT EXISTS public.appointments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    doctor_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    appointment_date TIMESTAMPTZ NOT NULL,
    time_slot TEXT NOT NULL, -- e.g. "10:30 AM"
    appointment_type TEXT NOT NULL DEFAULT 'ONLINE_CONSULTATION',
    reason TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'PENDING', -- PENDING, CONFIRMED, IN_PROGRESS, COMPLETED, CANCELLED
    doctor_notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- 3. CLINICAL CASES, VISITS & NOTES
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.clinical_cases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    doctor_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    visit_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    chief_complaint TEXT NOT NULL,
    location TEXT,
    sensation TEXT,
    modalities TEXT,
    concomitants TEXT,
    mental_generals TEXT,
    physical_generals TEXT,
    past_history TEXT,
    family_history TEXT,
    personal_history TEXT,
    investigations TEXT,
    current_medications TEXT,
    raw_notes TEXT,
    structured_json JSONB,
    rubric_tags TEXT,
    remedy_considered TEXT,
    potency_prescribed TEXT,
    status TEXT NOT NULL DEFAULT 'DRAFT', -- DRAFT, SAVED, ANALYZED
    is_archived BOOLEAN NOT NULL DEFAULT FALSE,
    deleted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.clinical_visits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    case_id UUID REFERENCES public.clinical_cases(id) ON DELETE SET NULL,
    doctor_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    visit_number INT NOT NULL DEFAULT 1,
    visit_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    symptoms_summary TEXT NOT NULL,
    status_change TEXT NOT NULL DEFAULT 'UNCHANGED', -- IMPROVED, UNCHANGED, AGGRAVATED, NEW_SYMPTOMS
    observations TEXT,
    prescription_notes TEXT,
    next_follow_up_date TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.case_notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    case_id UUID NOT NULL REFERENCES public.clinical_cases(id) ON DELETE CASCADE,
    doctor_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    is_private BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- 4. PATIENT FOLLOW-UPS & DOCUMENTS
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.follow_ups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    doctor_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    clinical_case_id UUID REFERENCES public.clinical_cases(id) ON DELETE SET NULL,
    current_symptoms TEXT NOT NULL,
    previous_severity INT NOT NULL DEFAULT 7,
    current_severity INT NOT NULL DEFAULT 4,
    symptom_change TEXT NOT NULL DEFAULT 'IMPROVED', -- IMPROVED, UNCHANGED, AGGRAVATED
    new_symptoms TEXT,
    patient_questions TEXT,
    status TEXT NOT NULL DEFAULT 'SUBMITTED', -- SUBMITTED, REVIEWED, NEEDS_INFORMATION
    doctor_reply TEXT,
    reviewed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.patient_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    file_name TEXT NOT NULL,
    file_path TEXT NOT NULL,
    file_type TEXT DEFAULT 'LAB_REPORT',
    file_size TEXT DEFAULT '1.2 MB',
    document_type TEXT DEFAULT 'LAB_REPORT',
    ai_explanation TEXT,
    upload_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- 5. MESSAGES & NOTIFICATIONS
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    doctor_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    patient_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_conv_doc_pat UNIQUE (doctor_id, patient_id)
);

CREATE TABLE IF NOT EXISTS public.messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE,
    patient_user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    doctor_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    sender_role TEXT NOT NULL, -- PATIENT, DOCTOR
    content TEXT NOT NULL,
    attachment_path TEXT,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'GENERAL', -- APPOINTMENT, FOLLOWUP, MESSAGE, REPORT
    target_route TEXT,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- 6. CONSULTATION & VIDEO SESSIONS
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.consultation_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    appointment_id UUID UNIQUE REFERENCES public.appointments(id) ON DELETE CASCADE,
    doctor_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    patient_user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    room_id TEXT UNIQUE NOT NULL,
    started_at TIMESTAMPTZ,
    ended_at TIMESTAMPTZ,
    duration_seconds INT NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'READY', -- READY, IN_PROGRESS, COMPLETED, CANCELLED
    doctor_notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.consultation_chat_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    consultation_session_id UUID NOT NULL REFERENCES public.consultation_sessions(id) ON DELETE CASCADE,
    sender_user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    sender_name TEXT NOT NULL,
    sender_role TEXT NOT NULL, -- DOCTOR, PATIENT
    message TEXT NOT NULL,
    attachment_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.video_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    doctor_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    patient_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    linked_case_id UUID REFERENCES public.clinical_cases(id) ON DELETE SET NULL,
    scheduled_at TIMESTAMPTZ,
    started_at TIMESTAMPTZ,
    ended_at TIMESTAMPTZ,
    duration_seconds INT NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'SCHEDULED', -- SCHEDULED, WAITING, ACTIVE, COMPLETED, CANCELLED
    join_token TEXT UNIQUE NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    provider TEXT NOT NULL DEFAULT 'DEMO_WEBRTC',
    consent_recorded BOOLEAN NOT NULL DEFAULT FALSE,
    deleted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.video_session_notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES public.video_sessions(id) ON DELETE CASCADE,
    note_text TEXT NOT NULL,
    pushed_to_record BOOLEAN NOT NULL DEFAULT FALSE,
    pushed_case_visit_id UUID REFERENCES public.clinical_visits(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- 7. STUDENT LEARNING & ACADEMIC ENGINE
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.clinical_logbooks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    patient_id_or_opd TEXT NOT NULL,
    patient_age INT NOT NULL,
    patient_gender TEXT NOT NULL,
    visit_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    department TEXT NOT NULL DEFAULT 'Medicine OPD',
    chief_complaint TEXT NOT NULL,
    duration TEXT,
    location TEXT,
    sensation TEXT,
    modalities TEXT,
    history_present_illness TEXT,
    past_history TEXT,
    family_history TEXT,
    personal_history TEXT,
    treatment_history TEXT,
    generals_physical TEXT,
    generals_mental TEXT,
    appetite TEXT,
    thirst TEXT,
    sleep TEXT,
    thermal_preference TEXT,
    examination_details TEXT,
    investigations_json JSONB,
    remedy_prescribed TEXT,
    potency_posology TEXT,
    case_totality_notes TEXT,
    status TEXT NOT NULL DEFAULT 'DRAFT', -- DRAFT, SUBMITTED, REVIEWED, RETURNED
    faculty_score FLOAT,
    faculty_feedback TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.quiz_questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    subject TEXT NOT NULL,
    topic TEXT NOT NULL,
    difficulty TEXT NOT NULL DEFAULT 'MEDIUM',
    question TEXT NOT NULL,
    option_a TEXT NOT NULL,
    option_b TEXT NOT NULL,
    option_c TEXT NOT NULL,
    option_d TEXT NOT NULL,
    correct_option TEXT NOT NULL, -- A, B, C, D
    explanation TEXT NOT NULL,
    reference_book TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.quiz_attempts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    subject TEXT NOT NULL,
    total_questions INT NOT NULL,
    correct_count INT NOT NULL,
    time_spent_sec INT NOT NULL,
    answers_json JSONB NOT NULL,
    topic_breakdown_json JSONB NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.viva_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    subject TEXT NOT NULL,
    difficulty TEXT NOT NULL DEFAULT 'MEDIUM',
    question_count INT NOT NULL DEFAULT 5,
    current_question_index INT NOT NULL DEFAULT 0,
    questions_json JSONB NOT NULL,
    answers_json JSONB,
    total_score FLOAT,
    feedback_json JSONB,
    status TEXT NOT NULL DEFAULT 'ACTIVE', -- ACTIVE, COMPLETED
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS public.viva_answers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    viva_session_id UUID NOT NULL REFERENCES public.viva_sessions(id) ON DELETE CASCADE,
    question_index INT NOT NULL,
    question_text TEXT NOT NULL,
    student_answer TEXT NOT NULL,
    grade TEXT NOT NULL, -- CORRECT, PARTIALLY_CORRECT, INCORRECT
    score_obtained FLOAT NOT NULL,
    model_explanation TEXT NOT NULL,
    correct_keypoints_json JSONB NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.learning_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    subject TEXT NOT NULL,
    mastery_level FLOAT NOT NULL DEFAULT 0.0,
    quizzes_taken INT NOT NULL DEFAULT 0,
    viva_count INT NOT NULL DEFAULT 0,
    cases_solved INT NOT NULL DEFAULT 0,
    weak_topics_json JSONB,
    strong_topics_json JSONB,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_user_subject UNIQUE (user_id, subject)
);

-- ============================================================================
-- 8. REPERTORY, REMEDIES & KNOWLEDGE BASE
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.repertory_rubrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    repertory_name TEXT NOT NULL DEFAULT 'Kent Repertory',
    rubric_text TEXT NOT NULL,
    category TEXT NOT NULL,
    source TEXT DEFAULT 'Kent',
    verified BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.remedies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT UNIQUE NOT NULL,
    common_name TEXT,
    source TEXT DEFAULT 'Boericke Materia Medica',
    verified BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.remedy_rubrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    remedy_id UUID NOT NULL REFERENCES public.remedies(id) ON DELETE CASCADE,
    rubric_id UUID NOT NULL REFERENCES public.repertory_rubrics(id) ON DELETE CASCADE,
    grade INT NOT NULL DEFAULT 1, -- 1, 2, 3
    CONSTRAINT uq_remedy_rubric UNIQUE (remedy_id, rubric_id)
);

CREATE TABLE IF NOT EXISTS public.repertory_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL DEFAULT 'Repertorization Session',
    selected_rubrics JSONB NOT NULL,
    results_json JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.knowledge_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    category TEXT NOT NULL, -- ORGANON, MATERIA_MEDICA, REPERTORY, PHARMACY, PHILOSOPHY
    author TEXT NOT NULL,
    source_book TEXT NOT NULL,
    edition TEXT,
    verification_status TEXT NOT NULL DEFAULT 'VERIFIED',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.knowledge_chunks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id UUID NOT NULL REFERENCES public.knowledge_documents(id) ON DELETE CASCADE,
    chapter_or_aphorism TEXT,
    section_title TEXT NOT NULL,
    content TEXT NOT NULL,
    keywords TEXT,
    verified_only BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.organon_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    aphorism_number INT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    summary TEXT NOT NULL,
    explanation TEXT NOT NULL,
    key_points JSONB,
    source TEXT NOT NULL DEFAULT 'Organon of Medicine (6th Edition)',
    verified BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- 9. MYSTERY CASES & FACULTY EVALUATION
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.mystery_cases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    case_number INT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    week_label TEXT NOT NULL DEFAULT 'Week 1',
    chief_complaint TEXT NOT NULL,
    patient_profile TEXT NOT NULL,
    case_narrative TEXT NOT NULL,
    symptoms_list_json JSONB NOT NULL,
    actual_remedy TEXT,
    actual_rationale TEXT,
    difficulty TEXT NOT NULL DEFAULT 'INTERMEDIATE',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.case_submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    case_id UUID NOT NULL REFERENCES public.mystery_cases(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    suggested_remedy TEXT NOT NULL,
    repertory_rubrics TEXT,
    reasoning TEXT NOT NULL,
    miasm_analysis TEXT,
    status TEXT NOT NULL DEFAULT 'SUBMITTED', -- SUBMITTED, REVIEWED, RETURNED
    score FLOAT,
    faculty_feedback TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_mystery_user UNIQUE (case_id, user_id)
);

CREATE TABLE IF NOT EXISTS public.faculty_feedback (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    submission_id UUID NOT NULL REFERENCES public.case_submissions(id) ON DELETE CASCADE,
    faculty_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    feedback TEXT NOT NULL,
    score FLOAT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.mystery_case_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    case_id UUID NOT NULL REFERENCES public.mystery_cases(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    user_name TEXT NOT NULL,
    user_role TEXT NOT NULL DEFAULT 'STUDENT',
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- 10. AI CONVERSATIONS & MESSAGES
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.ai_conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    role TEXT NOT NULL, -- STUDENT, DOCTOR, PATIENT
    title TEXT NOT NULL,
    context_type TEXT NOT NULL, -- TUTOR, VIRTUAL_PATIENT, CASE_ANALYSIS
    metadata_json JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.ai_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES public.ai_conversations(id) ON DELETE CASCADE,
    sender TEXT NOT NULL, -- USER, AI, SYSTEM
    content TEXT NOT NULL,
    sources_json JSONB,
    latency_ms INT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- 11. INDEXES FOR HIGH-PERFORMANCE QUERYING
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_appointments_doc_date ON public.appointments(doctor_id, appointment_date);
CREATE INDEX IF NOT EXISTS idx_appointments_patient ON public.appointments(patient_user_id);
CREATE INDEX IF NOT EXISTS idx_clinical_cases_doc_pat ON public.clinical_cases(doctor_id, patient_id);
CREATE INDEX IF NOT EXISTS idx_followups_doc_status ON public.follow_ups(doctor_id, status);
CREATE INDEX IF NOT EXISTS idx_messages_conv ON public.messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_read ON public.notifications(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_quiz_questions_sub ON public.quiz_questions(subject);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_user ON public.quiz_attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_knowledge_chunks_doc ON public.knowledge_chunks(document_id);

-- ============================================================================
-- 12. ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS on core sensitive tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patient_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clinical_cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.follow_ups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patient_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- 1. Profiles RLS
CREATE POLICY "Public profiles are readable by authenticated users" 
    ON public.profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can update their own profile" 
    ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = auth_user_id);

-- 2. Appointments RLS
CREATE POLICY "Patients can view their own appointments" 
    ON public.appointments FOR SELECT TO authenticated 
    USING (patient_user_id IN (SELECT id FROM public.profiles WHERE auth_user_id = auth.uid()));
CREATE POLICY "Doctors can view appointments assigned to them" 
    ON public.appointments FOR SELECT TO authenticated 
    USING (doctor_id IN (SELECT id FROM public.profiles WHERE auth_user_id = auth.uid()));

-- 3. Clinical Cases RLS
CREATE POLICY "Doctors can view and manage their own patient cases" 
    ON public.clinical_cases FOR ALL TO authenticated 
    USING (doctor_id IN (SELECT id FROM public.profiles WHERE auth_user_id = auth.uid()));

-- 4. Patient Documents RLS
CREATE POLICY "Patients can view their uploaded documents" 
    ON public.patient_documents FOR SELECT TO authenticated 
    USING (patient_user_id IN (SELECT id FROM public.profiles WHERE auth_user_id = auth.uid()));

-- 5. Notifications RLS
CREATE POLICY "Users can view their own notifications" 
    ON public.notifications FOR ALL TO authenticated 
    USING (user_id IN (SELECT id FROM public.profiles WHERE auth_user_id = auth.uid()));

-- ============================================================================
-- END OF SUPABASE POSTGRESQL MASTER SCHEMA MIGRATION SCRIPT
-- ============================================================================
