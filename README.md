# 📚 Briefly - AI-Powered Study Tools

<div align="center">

<img src="frontend/public/briefly-logo.png" alt="Briefly Logo" width="60" height="60">

**Transform how you learn with AI-powered study tools built for students**

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![NestJS](https://img.shields.io/badge/NestJS-E0234E?logo=nestjs&logoColor=white)](https://nestjs.com/)
[![Next.js](https://img.shields.io/badge/Next.js-000000?logo=next.js&logoColor=white)](https://nextjs.org/)
[![Prisma](https://img.shields.io/badge/Prisma-2D3748?logo=prisma&logoColor=white)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-336791?logo=postgresql&logoColor=white)](https://www.postgresql.org/)

</div>

---

## 🌟 Overview

**Briefly** is a comprehensive AI-powered learning platform designed to revolutionize how students study and retain information. Built with modern web technologies, it offers four powerful tools that transform educational content into interactive study materials.

### 🎯 Key Features

- **🤖 AI Flashcards**: Instantly convert any text into interactive flashcards for efficient memorization
- **📝 Smart Summarizer**: Condense lengthy articles, papers, and textbooks into clear, concise summaries
- **📚 Study Guide Generator**: Create comprehensive study guides with organized sections and key concepts
- **🧠 Quiz Creator**: Generate practice quizzes to test knowledge and identify weak areas
- **🔐 Secure Authentication**: JWT-based auth with Google and Facebook OAuth integration
- **📊 Progress Tracking**: Save and organize all your study materials in one place
- **🎨 Modern UI**: Beautiful, responsive interface built with Tailwind CSS

---

## 🏗️ Architecture & Tech Stack

### Backend Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Next.js       │    │   NestJS        │    │   PostgreSQL    │
│   Frontend      │◄──►│   API Backend   │◄──►│   Database      │
│   (Port 3000)   │    │   (Port 3001)   │    │   (Prisma ORM)  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                              │
                              ▼
                       ┌─────────────────┐
                       │   Google AI     │
                       │   Gemini API    │
                       └─────────────────┘
```

### Technology Stack

#### Backend (NestJS)
- **Framework**: NestJS - Progressive Node.js framework
- **Language**: TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT with Passport.js (Google & Facebook OAuth)
- **AI Integration**: Google Generative AI (Gemini)
- **Security**: Helmet, CSRF protection, rate limiting
- **Validation**: class-validator & class-transformer

#### Frontend (Next.js)
- **Framework**: Next.js 16 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **UI Components**: Custom component library
- **State Management**: React hooks
- **File Processing**: PDF.js, Mammoth.js (Word docs)
- **Drag & Drop**: @dnd-kit libraries
- **Analytics**: Vercel Analytics

#### DevOps & Tools
- **Containerization**: Docker support
- **Deployment**: Railway, Vercel
- **Database**: Prisma migrations
- **Linting**: ESLint
- **Testing**: Jest
- **Version Control**: Git

---

## 📋 Features & Capabilities

### 🤖 AI-Powered Tools

#### 1. AI Flashcards Generator
- **Input**: Any text content (articles, notes, textbooks)
- **Output**: Interactive flashcards with questions and answers
- **Features**:
  - Automatic question-answer pair generation
  - Customizable topics and categories
  - Study mode with progress tracking
  - Auto-save to personal library

#### 2. Smart Text Summarizer
- **Input**: Long-form content (articles, papers, documents)
- **Output**: Concise summaries in multiple lengths
- **Features**:
  - Short, medium, and long summary options
  - Key points extraction
  - Original text preservation
  - Length comparison metrics

#### 3. Study Guide Generator
- **Input**: Course materials, lecture notes, textbooks
- **Output**: Structured study guides with sections
- **Features**:
  - Organized content structure
  - Key concepts highlighting
  - Subject-based categorization
  - Comprehensive coverage

#### 4. Quiz Creator
- **Input**: Study materials and topics
- **Output**: Multiple-choice quizzes
- **Features**:
  - Customizable difficulty levels (easy, medium, hard)
  - Configurable question count
  - Answer validation and scoring
  - Progress tracking

### 🔐 Security & Privacy

- **Authentication**: JWT tokens with refresh mechanism
- **OAuth Integration**: Google and Facebook login
- **Rate Limiting**: 100 requests/minute per user, 10 AI requests/minute
- **Data Privacy**: All processing done securely, no data retention for AI inputs
- **CSRF Protection**: Built-in cross-site request forgery prevention
- **Input Validation**: Comprehensive validation on all endpoints

### 📱 User Experience

- **Responsive Design**: Works perfectly on desktop, tablet, and mobile
- **Dark Mode**: Full dark theme support
- **Accessibility**: WCAG compliant with proper ARIA labels
- **Performance**: Optimized loading with Next.js features
- **Progressive Web App**: Installable on mobile devices

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- PostgreSQL database
- Google AI API key (for Gemini)
- OAuth credentials (Google & Facebook)

### Environment Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/briefly.git
   cd briefly
   ```

2. **Backend Setup**
   ```bash
   cd backend

   # Install dependencies
   npm install

   # Create environment file
   cp .env.example .env.local

   # Configure your environment variables
   # Edit .env.local with your database URL, JWT secrets, OAuth credentials, etc.
   ```

3. **Frontend Setup**
   ```bash
   cd ../frontend

   # Install dependencies
   npm install

   # Copy environment file
   cp .env.example .env.local
   ```

4. **Database Setup**
   ```bash
   cd ../backend

   # Generate Prisma client
   npm run prisma:generate

   # Run database migrations
   npm run prisma:migrate

   # (Optional) Seed database with sample data
   npm run prisma:seed
   ```

5. **Start Development Servers**

   **Terminal 1 - Backend:**
   ```bash
   cd backend
   npm run start:dev
   ```

   **Terminal 2 - Frontend:**
   ```bash
   cd frontend
   npm run dev
   ```

6. **Access the Application**

   - Frontend: http://localhost:3000
   - Backend API: http://localhost:3001

---

## 📖 API Documentation

### Authentication Endpoints

#### POST `/auth/login`
Traditional email/password login
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

#### GET `/auth/google`
Google OAuth login redirect

#### GET `/auth/facebook`
Facebook OAuth login redirect

#### POST `/auth/refresh`
Refresh JWT access token
```json
{
  "refreshToken": "your_refresh_token"
}
```

### AI Tools Endpoints

#### POST `/ai/flashcards`
Generate flashcards from text
```json
{
  "text": "Your study material here...",
  "topic": "Optional topic name"
}
```

#### POST `/ai/summarize`
Summarize text content
```json
{
  "text": "Long text to summarize...",
  "length": "medium" // "short" | "medium" | "long"
}
```

#### POST `/ai/study-guide`
Generate study guide
```json
{
  "content": "Study material content...",
  "subject": "Optional subject"
}
```

#### POST `/ai/quiz`
Generate quiz questions
```json
{
  "content": "Quiz content...",
  "numberOfQuestions": 10,
  "difficulty": "medium" // "easy" | "medium" | "hard"
}
```

### Study Content Management

#### GET `/flashcard-sets`
List user's flashcard sets

#### GET `/quiz-sets`
List user's quiz sets

#### GET `/study-guides`
List user's study guides

#### GET `/summaries`
List user's summaries

---

## 🔧 Development

### Project Structure

```
briefly/
├── backend/                    # NestJS API server
│   ├── src/
│   │   ├── ai/                # AI service integration
│   │   ├── auth/              # Authentication module
│   │   ├── common/            # Shared utilities
│   │   ├── config/            # Configuration
│   │   ├── prisma/            # Database service
│   │   ├── study-content/     # Study tools modules
│   │   └── users/             # User management
│   ├── prisma/
│   │   ├── schema.prisma      # Database schema
│   │   └── migrations/        # Database migrations
│   └── test/                  # E2E tests
├── frontend/                   # Next.js client
│   ├── app/                   # App router pages
│   ├── components/            # React components
│   ├── lib/                   # Utilities and API client
│   └── public/                # Static assets
└── README.md
```

### Available Scripts

#### Backend Scripts
```bash
npm run start:dev      # Start development server with hot reload
npm run build          # Build production bundle
npm run start:prod     # Start production server
npm run test           # Run unit tests
npm run test:e2e       # Run end-to-end tests
npm run prisma:studio  # Open Prisma database GUI
```

#### Frontend Scripts
```bash
npm run dev           # Start development server
npm run build         # Build for production
npm run start         # Start production server
npm run lint          # Run ESLint
```

### Database Management

```bash
# Create new migration
npx prisma migrate dev --name your_migration_name

# Reset database (WARNING: deletes all data)
npx prisma migrate reset

# Generate Prisma client after schema changes
npx prisma generate

# View database in browser
npx prisma studio
```


---

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Commit changes**: `git commit -m 'Add amazing feature'`
4. **Push to branch**: `git push origin feature/amazing-feature`
5. **Open a Pull Request**

### Development Guidelines

- Follow TypeScript best practices
- Write meaningful commit messages
- Add tests for new features
- Update documentation as needed
- Ensure code passes linting

### Code Quality

- **Linting**: ESLint configuration
- **Testing**: Jest for unit and integration tests
- **Type Safety**: Full TypeScript coverage
- **Code Style**: Prettier formatting

---

## 🙏 Acknowledgments

- **Developed by**: Jared Omen
- **AI Powered by**: Google Generative AI (Gemini)
- **UI Framework**: Built with Next.js and Tailwind CSS
- **Icons**: Lucide React icons
- **Database**: Prisma ORM with PostgreSQL

---


<div align="center">

**Made with ❤️ for students worldwide**

</div>
