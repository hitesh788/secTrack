# SecTrack Pro - Security Learning Tracker

SecTrack Pro is a full-stack MERN application for Network Security Engineers to track their learning goals, plan study topics, and log daily progress with comprehensive KPI tracking and PDF reporting functionalities.

## Tech Stack
- **Frontend**: React.js, Vite, Axios, Chart.js, React-ChartJS-2, jsPDF, Vanilla CSS (Premium Dark Theme/Glassmorphism design)
- **Backend**: Node.js, Express.js
- **Database**: MongoDB & Mongoose
- **Authentication**: JWT & bcrypt

---

## Folder Structure

```
SecTracker/
├── backend/
│   ├── models/
│   │   ├── Goal.js
│   │   ├── Log.js
│   │   ├── Topic.js
│   │   └── User.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── goals.js
│   │   ├── logs.js
│   │   └── topics.js
│   ├── middleware/
│   │   └── authMiddleware.js
│   ├── utils/
│   │   └── ai.js
│   ├── server.js
│   ├── package.json
│   └── .env
└── frontend/
    ├── src/
    │   ├── components/
    │   │   └── Sidebar.jsx
    │   ├── context/
    │   │   └── AuthContext.jsx
    │   ├── hooks/
    │   │   └── useAuth.js
    │   ├── pages/
    │   │   ├── Dashboard.jsx
    │   │   ├── GoalCreator.jsx
    │   │   ├── DailyLogs.jsx
    │   │   ├── TopicManager.jsx
    │   │   ├── Login.jsx
    │   │   ├── Register.jsx
    │   │   └── Reports.jsx
    │   ├── services/
    │   │   └── api.js
    │   ├── App.jsx
    │   ├── main.jsx
    │   └── index.css
    └── package.json
```

---

## How to Run Locally

### 1. Prerequisites
- Node.js (v16+)
- MongoDB running locally on `mongodb://127.0.0.1:27017` or a MongoDB Atlas URI.

### 2. Backend Setup
1. Open a terminal and navigate to the `backend` folder:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file based on `.env` (already present):
   ```
   PORT=5000
   MONGODB_URI=mongodb://127.0.0.1:27017/sectrack
   JWT_SECRET=supersecret123
   OPENAI_API_KEY=your_openai_key
   ```
4. Start the server:
   ```bash
   node server.js
   ```

### 3. Frontend Setup
1. In a new terminal, navigate to the `frontend` folder:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Vite dev server:
   ```bash
   npm run dev
   ```
4. Open the displayed local URL (typically `http://localhost:5173`) in your browser.

---

## API Documentation

### Authentication endpoints
- `POST /api/auth/register` : Register a user `(name, email, password)`
- `POST /api/auth/login` : Login user and return JWT `(email, password)`

### Goal endpoints
- **Protected Header Required**: `Authorization: Bearer <token>`
- `GET /api/goals` : Get user's goals
- `POST /api/goals` : Create a goal `(title, description, targetDate)`
- `POST /api/goals/:id/analyze` : Analyze goal with AI to generate topics

### Topic endpoints
- **Protected Header Required**: `Authorization: Bearer <token>`
- `GET /api/topics` : Query topics list (query param: `?goalId=optional_id`)
- `POST /api/topics` : Manually create a topic
- `PUT /api/topics/:id` : Update an existing topic (e.g. status)
- `DELETE /api/topics/:id` : Drop a topic

### Log endpoints
- **Protected Header Required**: `Authorization: Bearer <token>`
- `GET /api/logs` : Get log events (with topics populated)
- `POST /api/logs` : Create daily log entry `(topicId, date, completedTasks, hoursSpent, notes, statusUpdate)`

---

## Example AI Response for Goal Analysis

When triggering `POST /api/goals/:id/analyze` through the UI, the mock OpenAI response is generated as follows:

```json
[
  {
    "title": "OSI Model & TCP/IP",
    "description": "Understand basic networking protocols",
    "estimatedHours": 10,
    "priority": "High",
    "tags": ["Networking", "Fundamentals"]
  },
  {
    "title": "Wireshark & Packet Analysis",
    "description": "Hands-on packet capturing",
    "estimatedHours": 15,
    "priority": "High",
    "tags": ["Networking", "Tools"]
  },
  {
    "title": "Nmap & Scanning",
    "description": "Learn active reconnaissance",
    "estimatedHours": 12,
    "priority": "Medium",
    "tags": ["Security", "Tools"]
  }
]
```

---

## Sample Dummy Data to Add

**1. Create a Goal**
- **Title**: Become a Senior Network Security Engineer
- **Description**: I want to master TCP/IP networking, configure enterprise firewalls (Palo Alto, Fortinet), analyze advanced network intrusions with Wireshark, utilize Nmap for network mapping, and implement IDS/IPS sensors like Snort to protect enterprise assets.
- **Target Date**: 2026-12-31

**2. Analyze the Goal (Click "Analyze" in Dashboard)**
- The fake AI engine will extract these core subjects into "Topics":
  - OS Model & TCP/IP
  - Firewall configuration
  - Wireshark Analysis
  - ...etc.

**3. Test Logging Day 1**
- **Date**: 2026-05-01
- **Topic**: Wireshark & Packet Analysis
- **Update Topic**: 'In Progress'
- **Task Complete**: "Setup Wireshark & sniffed local loopback. Analyzed TCP handshake."
- **Hours spent**: 3.5

The Dashboard and Reports will automatically populate with KPI graphics. Enjoy!
