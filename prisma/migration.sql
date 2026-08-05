node.exe : Loaded Prisma config from prisma.config.ts.
At line:1 char:1
+ & "C:\Program Files\nodejs/node.exe" "C:\Users\rasha\AppData\Roaming\ ...
+ ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    + CategoryInfo          : NotSpecified: (Loaded Prisma c...isma.config.ts.:String) [], RemoteException
    + FullyQualifiedErrorId : NativeCommandError
 

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('DELEGATE', 'ORGANIZER', 'MODERATOR', 'ADMIN');

-- CreateEnum
CREATE TYPE "ExperienceLevel" AS ENUM ('FIRST_TIMER', 'BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT');

-- CreateEnum
CREATE TYPE "CertificateCategory" AS ENUM ('PARTICIPATION', 'AWARD', 'BEST_DELEGATE', 'HONORABLE_MENTION', 'SPECIAL_MENTION', 'VERBAL_COMMENDATION', 'RESEARCH_PAPER', 'OTHER');

-- CreateEnum
CREATE TYPE "SocialPlatform" AS ENUM ('LINKEDIN', 'TWITTER', 'INSTAGRAM', 'GITHUB', 'YOUTUBE', 'WEBSITE', 'OTHER');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('SYSTEM', 'ACHIEVEMENT', 'EVENT', 'REMINDER');

-- CreateEnum
CREATE TYPE "ActivityType" AS ENUM ('ACCOUNT_CREATED', 'PROFILE_UPDATED', 'PROFILE_COMPLETED', 'MUN_PROFILE_UPDATED', 'AWARD_ADDED', 'AWARD_REMOVED', 'CERTIFICATE_UPLOADED', 'CERTIFICATE_DELETED', 'COMMITTEE_ADDED', 'COMMITTEE_REMOVED', 'COUNTRY_ADDED', 'COUNTRY_REMOVED', 'SOCIAL_LINK_UPDATED', 'PORTFOLIO_UPDATED', 'SETTINGS_UPDATED');

-- CreateEnum
CREATE TYPE "ConferenceFormat" AS ENUM ('ONLINE', 'OFFLINE', 'HYBRID');

-- CreateEnum
CREATE TYPE "ReminderType" AS ENUM ('REGISTRATION_DEADLINE', 'COUNTRY_ALLOCATION', 'CONFERENCE_STARTS');

-- CreateEnum
CREATE TYPE "TaskStatus" AS ENUM ('TODO', 'IN_PROGRESS', 'DONE');

-- CreateEnum
CREATE TYPE "TaskPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'URGENT');

-- CreateEnum
CREATE TYPE "PositionPaperStatus" AS ENUM ('DRAFT', 'RESEARCH', 'COMPLETE');

-- CreateEnum
CREATE TYPE "ResolutionStatus" AS ENUM ('DRAFT', 'SUBMITTED', 'PASSED', 'FAILED');

-- CreateEnum
CREATE TYPE "AiSourceType" AS ENUM ('USER', 'CORPUS', 'CRAWLED', 'LIVE');

-- CreateEnum
CREATE TYPE "SimulationStatus" AS ENUM ('SETUP', 'RUNNING', 'PAUSED', 'FINISHED');

-- CreateEnum
CREATE TYPE "SimulationEventType" AS ENUM ('SPEECH', 'POI_ASKED', 'POI_ANSWERED', 'MOTION', 'VOTE', 'CRISIS', 'AWARD', 'CHAIR_ANNOUNCEMENT');

-- CreateEnum
CREATE TYPE "SimulationAward" AS ENUM ('NONE', 'BEST_DELEGATE', 'OUTSTANDING_DELEGATE', 'HONORABLE_MENTION', 'VERBAL_COMMENDATION');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "clerkId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "firstName" TEXT,
    "lastName" TEXT,
    "username" TEXT,
    "phoneNumber" TEXT,
    "avatarUrl" TEXT,
    "bio" VARCHAR(1000),
    "school" TEXT,
    "university" TEXT,
    "grade" TEXT,
    "city" TEXT,
    "state" TEXT,
    "country" TEXT,
    "interests" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "role" "Role" NOT NULL DEFAULT 'DELEGATE',
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MunProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "experienceLevel" "ExperienceLevel" NOT NULL DEFAULT 'BEGINNER',
    "munsAttended" INTEGER NOT NULL DEFAULT 0,
    "awardsWon" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MunProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Award" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "issuer" TEXT,
    "category" TEXT,
    "year" INTEGER,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Award_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Certificate" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "issuer" TEXT,
    "category" "CertificateCategory" NOT NULL DEFAULT 'OTHER',
    "issueYear" INTEGER,
    "fileName" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "sizeBytes" INTEGER NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "fileKey" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Certificate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Committee" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "conferenceName" TEXT,
    "year" INTEGER,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Committee_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CountryRepresented" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "conferenceName" TEXT,
    "year" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CountryRepresented_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SocialLink" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "platform" "SocialPlatform" NOT NULL,
    "url" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SocialLink_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL DEFAULT 'SYSTEM',
    "title" TEXT NOT NULL,
    "body" TEXT,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Activity" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "ActivityType" NOT NULL,
    "message" TEXT NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Activity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserSettings" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "theme" TEXT NOT NULL DEFAULT 'system',
    "notificationsEnabled" BOOLEAN NOT NULL DEFAULT true,
    "emailNotifications" BOOLEAN NOT NULL DEFAULT true,
    "certificateUploads" BOOLEAN NOT NULL DEFAULT true,
    "newFeatures" BOOLEAN NOT NULL DEFAULT true,
    "eventReminders" BOOLEAN NOT NULL DEFAULT true,
    "profilePublic" BOOLEAN NOT NULL DEFAULT true,
    "showAwards" BOOLEAN NOT NULL DEFAULT true,
    "showCertificates" BOOLEAN NOT NULL DEFAULT true,
    "showStats" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserSettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Organizer" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "school" TEXT,
    "university" TEXT,
    "website" TEXT,
    "email" TEXT,
    "instagram" TEXT,
    "logoUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Organizer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Venue" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT,
    "city" TEXT NOT NULL,
    "state" TEXT,
    "country" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "mapsUrl" TEXT,
    "conferenceId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Venue_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Conference" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "tagline" TEXT,
    "description" TEXT NOT NULL,
    "theme" TEXT,
    "format" "ConferenceFormat" NOT NULL DEFAULT 'OFFLINE',
    "difficulty" "ExperienceLevel" NOT NULL DEFAULT 'BEGINNER',
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "registrationOpen" BOOLEAN NOT NULL DEFAULT true,
    "externalDelegates" BOOLEAN NOT NULL DEFAULT true,
    "fee" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "registrationDeadline" TIMESTAMP(3),
    "capacity" INTEGER,
    "website" TEXT,
    "instagram" TEXT,
    "email" TEXT,
    "school" TEXT,
    "university" TEXT,
    "city" TEXT NOT NULL,
    "state" TEXT,
    "country" TEXT NOT NULL,
    "logoUrl" TEXT,
    "bannerUrl" TEXT,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "published" BOOLEAN NOT NULL DEFAULT true,
    "organizerId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Conference_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ConferenceCommittee" (
    "id" TEXT NOT NULL,
    "conferenceId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "topic" TEXT,
    "description" TEXT,
    "difficulty" "ExperienceLevel" NOT NULL DEFAULT 'INTERMEDIATE',
    "maxDelegates" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ConferenceCommittee_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CountryMatrixEntry" (
    "id" TEXT NOT NULL,
    "committeeId" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "seats" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CountryMatrixEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AgendaItem" (
    "id" TEXT NOT NULL,
    "conferenceId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "startAt" TIMESTAMP(3) NOT NULL,
    "endAt" TIMESTAMP(3),
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AgendaItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ConferenceSocialLink" (
    "id" TEXT NOT NULL,
    "conferenceId" TEXT NOT NULL,
    "platform" "SocialPlatform" NOT NULL,
    "url" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ConferenceSocialLink_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Brochure" (
    "id" TEXT NOT NULL,
    "conferenceId" TEXT NOT NULL,
    "title" TEXT,
    "fileName" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "sizeBytes" INTEGER NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "fileKey" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Brochure_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GalleryImage" (
    "id" TEXT NOT NULL,
    "conferenceId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "alt" TEXT,
    "caption" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GalleryImage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ConferenceAward" (
    "id" TEXT NOT NULL,
    "conferenceId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ConferenceAward_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ConferenceFaq" (
    "id" TEXT NOT NULL,
    "conferenceId" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ConferenceFaq_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Secretariat" (
    "id" TEXT NOT NULL,
    "conferenceId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "photoUrl" TEXT,
    "bio" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Secretariat_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Review" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "conferenceId" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "title" TEXT,
    "body" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Review_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Bookmark" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "conferenceId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Bookmark_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Reminder" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "conferenceId" TEXT NOT NULL,
    "type" "ReminderType" NOT NULL,
    "remindAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Reminder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Workspace" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "conferenceId" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Workspace_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Folder" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "parentId" TEXT,
    "name" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Folder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Note" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "folderId" TEXT,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "pinned" BOOLEAN NOT NULL DEFAULT false,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Note_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkspaceTask" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "status" "TaskStatus" NOT NULL DEFAULT 'TODO',
    "priority" "TaskPriority" NOT NULL DEFAULT 'MEDIUM',
    "dueAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WorkspaceTask_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TimelineEvent" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "description" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TimelineEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkspaceAttachment" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "sizeBytes" INTEGER NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "fileKey" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WorkspaceAttachment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkspaceCommittee" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "topic" TEXT,
    "country" TEXT,
    "role" TEXT NOT NULL DEFAULT 'DELEGATE',
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WorkspaceCommittee_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PositionPaper" (
    "id" TEXT NOT NULL,
    "committeeId" TEXT NOT NULL,
    "title" TEXT,
    "content" TEXT NOT NULL,
    "status" "PositionPaperStatus" NOT NULL DEFAULT 'DRAFT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PositionPaper_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Resolution" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "committeeId" TEXT,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "status" "ResolutionStatus" NOT NULL DEFAULT 'DRAFT',
    "sponsors" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Resolution_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AiDocument" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT,
    "isCorpus" BOOLEAN NOT NULL DEFAULT false,
    "sourceType" "AiSourceType" NOT NULL DEFAULT 'USER',
    "title" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'READY',
    "chunkCount" INTEGER NOT NULL DEFAULT 0,
    "fileKey" TEXT,
    "fileUrl" TEXT,
    "originUrl" TEXT,
    "retrievedAt" TIMESTAMP(3),
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AiDocument_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AiChunk" (
    "id" TEXT NOT NULL,
    "documentId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "heading" TEXT,
    "chunkIndex" INTEGER NOT NULL,
    "embedding" BYTEA,

    CONSTRAINT "AiChunk_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AiMemory" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AiMemory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CommitteeSimulation" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "committeeName" TEXT NOT NULL,
    "topic" TEXT,
    "country" TEXT,
    "userRole" TEXT NOT NULL DEFAULT 'DELEGATE',
    "status" "SimulationStatus" NOT NULL DEFAULT 'SETUP',
    "currentSpeakerIndex" INTEGER NOT NULL DEFAULT 0,
    "speakersListJson" JSONB DEFAULT '[]',
    "startedAt" TIMESTAMP(3),
    "endedAt" TIMESTAMP(3),
    "totalSpeechCount" INTEGER NOT NULL DEFAULT 0,
    "totalPoiCount" INTEGER NOT NULL DEFAULT 0,
    "totalMotionCount" INTEGER NOT NULL DEFAULT 0,
    "awardDelegates" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "awardBestDelegates" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "awardOutstandingDelegates" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "chairNotes" JSONB DEFAULT '[]',
    "speakingTimeLimitSec" INTEGER NOT NULL DEFAULT 90,
    "totalSpeakingTimeSec" INTEGER NOT NULL DEFAULT 0,
    "totalVoteCount" INTEGER NOT NULL DEFAULT 0,
    "delegateScores" JSONB DEFAULT '[]',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CommitteeSimulation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SimulationDelegate" (
    "id" TEXT NOT NULL,
    "simulationId" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "countryFlag" TEXT DEFAULT '≡ƒÅ│∩╕Å',
    "isAi" BOOLEAN NOT NULL DEFAULT true,
    "isChair" BOOLEAN NOT NULL DEFAULT false,
    "isRapporteur" BOOLEAN NOT NULL DEFAULT false,
    "displayName" TEXT NOT NULL,
    "speakingStyle" TEXT,
    "policyStance" TEXT,
    "speakingCount" INTEGER NOT NULL DEFAULT 0,
    "poiCount" INTEGER NOT NULL DEFAULT 0,
    "motionCount" INTEGER NOT NULL DEFAULT 0,
    "award" "SimulationAward" DEFAULT 'NONE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SimulationDelegate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SimulationEvent" (
    "id" TEXT NOT NULL,
    "simulationId" TEXT NOT NULL,
    "delegateId" TEXT,
    "type" "SimulationEventType" NOT NULL,
    "content" TEXT NOT NULL,
    "metadata" JSONB DEFAULT '{}',
    "speakingTimeSec" DOUBLE PRECISION,
    "poiTargetDelegateId" TEXT,
    "motionType" TEXT,
    "voteChoice" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SimulationEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AiScore" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "feature" TEXT NOT NULL DEFAULT 'debate',
    "transcript" TEXT,
    "durationSec" DOUBLE PRECISION,
    "result" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AiScore_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_clerkId_key" ON "User"("clerkId");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE INDEX "User_role_idx" ON "User"("role");

-- CreateIndex
CREATE INDEX "User_country_idx" ON "User"("country");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_username_idx" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "MunProfile_userId_key" ON "MunProfile"("userId");

-- CreateIndex
CREATE INDEX "Award_userId_idx" ON "Award"("userId");

-- CreateIndex
CREATE INDEX "Certificate_userId_idx" ON "Certificate"("userId");

-- CreateIndex
CREATE INDEX "Certificate_category_idx" ON "Certificate"("category");

-- CreateIndex
CREATE INDEX "Committee_userId_idx" ON "Committee"("userId");

-- CreateIndex
CREATE INDEX "CountryRepresented_userId_idx" ON "CountryRepresented"("userId");

-- CreateIndex
CREATE INDEX "SocialLink_userId_idx" ON "SocialLink"("userId");

-- CreateIndex
CREATE INDEX "Notification_userId_read_idx" ON "Notification"("userId", "read");

-- CreateIndex
CREATE INDEX "Activity_userId_createdAt_idx" ON "Activity"("userId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "UserSettings_userId_key" ON "UserSettings"("userId");

-- CreateIndex
CREATE INDEX "Organizer_name_idx" ON "Organizer"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Venue_conferenceId_key" ON "Venue"("conferenceId");

-- CreateIndex
CREATE INDEX "Venue_city_idx" ON "Venue"("city");

-- CreateIndex
CREATE INDEX "Venue_country_idx" ON "Venue"("country");

-- CreateIndex
CREATE UNIQUE INDEX "Conference_slug_key" ON "Conference"("slug");

-- CreateIndex
CREATE INDEX "Conference_country_idx" ON "Conference"("country");

-- CreateIndex
CREATE INDEX "Conference_city_idx" ON "Conference"("city");

-- CreateIndex
CREATE INDEX "Conference_state_idx" ON "Conference"("state");

-- CreateIndex
CREATE INDEX "Conference_school_idx" ON "Conference"("school");

-- CreateIndex
CREATE INDEX "Conference_university_idx" ON "Conference"("university");

-- CreateIndex
CREATE INDEX "Conference_format_idx" ON "Conference"("format");

-- CreateIndex
CREATE INDEX "Conference_difficulty_idx" ON "Conference"("difficulty");

-- CreateIndex
CREATE INDEX "Conference_startDate_idx" ON "Conference"("startDate");

-- CreateIndex
CREATE INDEX "Conference_published_featured_idx" ON "Conference"("published", "featured");

-- CreateIndex
CREATE INDEX "ConferenceCommittee_conferenceId_idx" ON "ConferenceCommittee"("conferenceId");

-- CreateIndex
CREATE INDEX "ConferenceCommittee_name_idx" ON "ConferenceCommittee"("name");

-- CreateIndex
CREATE INDEX "CountryMatrixEntry_committeeId_idx" ON "CountryMatrixEntry"("committeeId");

-- CreateIndex
CREATE INDEX "AgendaItem_conferenceId_idx" ON "AgendaItem"("conferenceId");

-- CreateIndex
CREATE INDEX "ConferenceSocialLink_conferenceId_idx" ON "ConferenceSocialLink"("conferenceId");

-- CreateIndex
CREATE INDEX "Brochure_conferenceId_idx" ON "Brochure"("conferenceId");

-- CreateIndex
CREATE INDEX "GalleryImage_conferenceId_idx" ON "GalleryImage"("conferenceId");

-- CreateIndex
CREATE INDEX "ConferenceAward_conferenceId_idx" ON "ConferenceAward"("conferenceId");

-- CreateIndex
CREATE INDEX "ConferenceFaq_conferenceId_idx" ON "ConferenceFaq"("conferenceId");

-- CreateIndex
CREATE INDEX "Secretariat_conferenceId_idx" ON "Secretariat"("conferenceId");

-- CreateIndex
CREATE INDEX "Review_conferenceId_idx" ON "Review"("conferenceId");

-- CreateIndex
CREATE INDEX "Review_rating_idx" ON "Review"("rating");

-- CreateIndex
CREATE UNIQUE INDEX "Review_userId_conferenceId_key" ON "Review"("userId", "conferenceId");

-- CreateIndex
CREATE INDEX "Bookmark_userId_idx" ON "Bookmark"("userId");

-- CreateIndex
CREATE INDEX "Bookmark_conferenceId_idx" ON "Bookmark"("conferenceId");

-- CreateIndex
CREATE UNIQUE INDEX "Bookmark_userId_conferenceId_key" ON "Bookmark"("userId", "conferenceId");

-- CreateIndex
CREATE INDEX "Reminder_userId_idx" ON "Reminder"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Reminder_userId_conferenceId_type_key" ON "Reminder"("userId", "conferenceId", "type");

-- CreateIndex
CREATE INDEX "Workspace_userId_idx" ON "Workspace"("userId");

-- CreateIndex
CREATE INDEX "Workspace_conferenceId_idx" ON "Workspace"("conferenceId");

-- CreateIndex
CREATE INDEX "Folder_workspaceId_idx" ON "Folder"("workspaceId");

-- CreateIndex
CREATE INDEX "Note_workspaceId_idx" ON "Note"("workspaceId");

-- CreateIndex
CREATE INDEX "Note_folderId_idx" ON "Note"("folderId");

-- CreateIndex
CREATE INDEX "WorkspaceTask_workspaceId_status_idx" ON "WorkspaceTask"("workspaceId", "status");

-- CreateIndex
CREATE INDEX "TimelineEvent_workspaceId_idx" ON "TimelineEvent"("workspaceId");

-- CreateIndex
CREATE INDEX "TimelineEvent_date_idx" ON "TimelineEvent"("date");

-- CreateIndex
CREATE INDEX "WorkspaceAttachment_workspaceId_idx" ON "WorkspaceAttachment"("workspaceId");

-- CreateIndex
CREATE INDEX "WorkspaceCommittee_workspaceId_idx" ON "WorkspaceCommittee"("workspaceId");

-- CreateIndex
CREATE UNIQUE INDEX "PositionPaper_committeeId_key" ON "PositionPaper"("committeeId");

-- CreateIndex
CREATE INDEX "Resolution_workspaceId_idx" ON "Resolution"("workspaceId");

-- CreateIndex
CREATE INDEX "AiDocument_workspaceId_idx" ON "AiDocument"("workspaceId");

-- CreateIndex
CREATE INDEX "AiDocument_isCorpus_idx" ON "AiDocument"("isCorpus");

-- CreateIndex
CREATE INDEX "AiDocument_sourceType_idx" ON "AiDocument"("sourceType");

-- CreateIndex
CREATE INDEX "AiDocument_workspaceId_sourceType_idx" ON "AiDocument"("workspaceId", "sourceType");

-- CreateIndex
CREATE INDEX "AiChunk_documentId_idx" ON "AiChunk"("documentId");

-- CreateIndex
CREATE INDEX "AiMemory_workspaceId_idx" ON "AiMemory"("workspaceId");

-- CreateIndex
CREATE UNIQUE INDEX "AiMemory_workspaceId_category_key" ON "AiMemory"("workspaceId", "category");

-- CreateIndex
CREATE INDEX "CommitteeSimulation_userId_idx" ON "CommitteeSimulation"("userId");

-- CreateIndex
CREATE INDEX "CommitteeSimulation_status_idx" ON "CommitteeSimulation"("status");

-- CreateIndex
CREATE INDEX "SimulationDelegate_simulationId_idx" ON "SimulationDelegate"("simulationId");

-- CreateIndex
CREATE INDEX "SimulationEvent_simulationId_type_idx" ON "SimulationEvent"("simulationId", "type");

-- CreateIndex
CREATE INDEX "SimulationEvent_simulationId_createdAt_idx" ON "SimulationEvent"("simulationId", "createdAt");

-- CreateIndex
CREATE INDEX "AiScore_workspaceId_idx" ON "AiScore"("workspaceId");

-- AddForeignKey
ALTER TABLE "MunProfile" ADD CONSTRAINT "MunProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Award" ADD CONSTRAINT "Award_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Certificate" ADD CONSTRAINT "Certificate_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Committee" ADD CONSTRAINT "Committee_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CountryRepresented" ADD CONSTRAINT "CountryRepresented_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SocialLink" ADD CONSTRAINT "SocialLink_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Activity" ADD CONSTRAINT "Activity_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserSettings" ADD CONSTRAINT "UserSettings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Venue" ADD CONSTRAINT "Venue_conferenceId_fkey" FOREIGN KEY ("conferenceId") REFERENCES "Conference"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Conference" ADD CONSTRAINT "Conference_organizerId_fkey" FOREIGN KEY ("organizerId") REFERENCES "Organizer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConferenceCommittee" ADD CONSTRAINT "ConferenceCommittee_conferenceId_fkey" FOREIGN KEY ("conferenceId") REFERENCES "Conference"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CountryMatrixEntry" ADD CONSTRAINT "CountryMatrixEntry_committeeId_fkey" FOREIGN KEY ("committeeId") REFERENCES "ConferenceCommittee"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AgendaItem" ADD CONSTRAINT "AgendaItem_conferenceId_fkey" FOREIGN KEY ("conferenceId") REFERENCES "Conference"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConferenceSocialLink" ADD CONSTRAINT "ConferenceSocialLink_conferenceId_fkey" FOREIGN KEY ("conferenceId") REFERENCES "Conference"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Brochure" ADD CONSTRAINT "Brochure_conferenceId_fkey" FOREIGN KEY ("conferenceId") REFERENCES "Conference"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GalleryImage" ADD CONSTRAINT "GalleryImage_conferenceId_fkey" FOREIGN KEY ("conferenceId") REFERENCES "Conference"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConferenceAward" ADD CONSTRAINT "ConferenceAward_conferenceId_fkey" FOREIGN KEY ("conferenceId") REFERENCES "Conference"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConferenceFaq" ADD CONSTRAINT "ConferenceFaq_conferenceId_fkey" FOREIGN KEY ("conferenceId") REFERENCES "Conference"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Secretariat" ADD CONSTRAINT "Secretariat_conferenceId_fkey" FOREIGN KEY ("conferenceId") REFERENCES "Conference"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_conferenceId_fkey" FOREIGN KEY ("conferenceId") REFERENCES "Conference"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Bookmark" ADD CONSTRAINT "Bookmark_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Bookmark" ADD CONSTRAINT "Bookmark_conferenceId_fkey" FOREIGN KEY ("conferenceId") REFERENCES "Conference"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reminder" ADD CONSTRAINT "Reminder_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reminder" ADD CONSTRAINT "Reminder_conferenceId_fkey" FOREIGN KEY ("conferenceId") REFERENCES "Conference"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Workspace" ADD CONSTRAINT "Workspace_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Workspace" ADD CONSTRAINT "Workspace_conferenceId_fkey" FOREIGN KEY ("conferenceId") REFERENCES "Conference"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Folder" ADD CONSTRAINT "Folder_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Folder" ADD CONSTRAINT "Folder_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Folder"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Note" ADD CONSTRAINT "Note_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Note" ADD CONSTRAINT "Note_folderId_fkey" FOREIGN KEY ("folderId") REFERENCES "Folder"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkspaceTask" ADD CONSTRAINT "WorkspaceTask_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TimelineEvent" ADD CONSTRAINT "TimelineEvent_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkspaceAttachment" ADD CONSTRAINT "WorkspaceAttachment_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkspaceCommittee" ADD CONSTRAINT "WorkspaceCommittee_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PositionPaper" ADD CONSTRAINT "PositionPaper_committeeId_fkey" FOREIGN KEY ("committeeId") REFERENCES "WorkspaceCommittee"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Resolution" ADD CONSTRAINT "Resolution_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Resolution" ADD CONSTRAINT "Resolution_committeeId_fkey" FOREIGN KEY ("committeeId") REFERENCES "WorkspaceCommittee"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AiDocument" ADD CONSTRAINT "AiDocument_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AiChunk" ADD CONSTRAINT "AiChunk_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "AiDocument"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AiMemory" ADD CONSTRAINT "AiMemory_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommitteeSimulation" ADD CONSTRAINT "CommitteeSimulation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SimulationDelegate" ADD CONSTRAINT "SimulationDelegate_simulationId_fkey" FOREIGN KEY ("simulationId") REFERENCES "CommitteeSimulation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SimulationEvent" ADD CONSTRAINT "SimulationEvent_simulationId_fkey" FOREIGN KEY ("simulationId") REFERENCES "CommitteeSimulation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SimulationEvent" ADD CONSTRAINT "SimulationEvent_delegateId_fkey" FOREIGN KEY ("delegateId") REFERENCES "SimulationDelegate"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AiScore" ADD CONSTRAINT "AiScore_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

