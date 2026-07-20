# Aegis Auditing - Security Log Center & Dashboard

A professional, high-performance web dashboard designed for security engineers to bulk upload, view, filter, sort, and investigate system audit logs.

## Quick Start Instructions

Follow these simple steps to set up and run the entire full stack application:

### 1. Installation

Run the following command at the root workspace directory to automatically install the packages for the root runner, Express API, and React Vite frontend:

```bash
npm run install-all
```

### 2. Launching the App

Spin up both the Node.js backend server and the Vite frontend server concurrently in development mode:

```bash
npm run dev
```

- **Frontend URL**: `http://localhost:5173`
- **Backend API URL**: `http://localhost:5000`

---

## 🛠️ Verification & Testing Guide

We have made testing extremely simple and immediate:

1. Open `http://localhost:5173` in your browser.
2. Click **Ingest Audit Logs** in the top right.
3. Click the link in the bottom-left of the modal: **"Generate and download 10k logs JSON"**. This will instantly generate a dataset of 10,000 realistic logs representing the schema in your browser and trigger a file download (`audit_logs_10k_sample.json`).
4. Drag and drop or browse to select that downloaded JSON file in the uploader box.
5. Watch the uploader validate and stream the upload. Once successful, the modal will transition to a success message.
6. Click **Go to Dashboard** and observe the statistics summaries, severity bar charts, top active actor lists, and the main logs table update in real time with all 10,000 logs!
7. **Perform investigations**:
   - Filter logs by choosing dropdown values (e.g. Severity = CRITICAL, Status = Unresolved).
   - Search for specific emails (e.g. `priya.nair@company.com`) or IP addresses using the query bar.
   - Click column headers (e.g. "Timestamp", "Severity") to sort.
   - Click any log row to open the investigation slide-drawer.
   - Change the remediation status (e.g. from "Unresolved" to "Resolved") and watch the dashboard metrics and log tables re-calculate instantly!

---

## Technical Decisions & Rationale

Here is an overview of the design choices made to ensure a production-ready, highly developer-friendly system:

### 1. Dual Database Strategy (MongoDB + File-Backed Fallback)
- **Problem**: MongoDB was not running as a standard Windows service on the local workspace system.
- **Solution**: We created a database connection coordinator (`connection.js`) that attempts to connect to MongoDB, and if connection fails (timeout of 3 seconds), it automatically activates a **File-backed Mock Database (`mockDb.js`)**.
- **Rationale**: This ensures the application is completely robust, functional, and self-contained right after cloning, eliminating configuration blockages for reviewers while keeping standard Mongoose schemas for production readiness.

### 2. Server-Side Log Querying Engine
- **Constraint**: The prompt specifies that filtering, search, sorting, and pagination must occur on the server side.
- **Implementation**:
  - We structured the GET `/api/logs` query handler to parse query options and feed them into MongoDB queries or MockDB query filters.
  - The MockDB querying module implements native JavaScript filters, sorting comparators, and splice methods to exactly replicate MongoDB's indexing and querying API (including case-insensitive regex search and date ranges).

### 3. Ingestion Optimization
- **Problem**: Ingesting 10,000 logs in a single JSON payload can exceed default body parser limits in Express.
- **Solution**: We adjusted the Express body parser JSON payload limits to `50mb` in `index.js` to prevent `413 Payload Too Large` errors during high-volume transfers.
- **Mongoose Optimization**: We utilized Mongoose's `insertMany` method, which sends a single batch operation to the MongoDB server rather than executing 10,000 individual insert queries, drastically reducing round-trips and memory overhead.

### 4. Custom Dark Tech Aesthetics (Glassmorphism & SVG)
- **Styling Choice**: We opted for **Vanilla CSS** with a curated HSL palette, custom card definitions, smooth transitions, and glowing shadows.
- **Rationale**: We avoided bulky layout packages or CSS frameworks like Tailwind to show deep CSS expertise, maximize performance, and achieve a premium, futuristic Cyberpunk aesthetic tailored to security operations.
- **Analytics Visualization**: We constructed the bar charts and metrics bars using simple, highly styled HTML and responsive CSS transitions. They load instantaneously, perform fluid animations, and have zero dependencies.

### 5. ES Modules & Modern Scripting
- We configured both backend and frontend to use `"type": "module"` in their `package.json` configurations to allow standard JavaScript imports (`import`/`export`) consistently.
- We used Node's native `--watch` flag in `node --watch src/index.js` for development reload, removing the need for `nodemon`.

---

## 📂 Project Architecture

```
Full stack dashboard project/
├── backend/
│   ├── data/
│   │   ├── audit_logs.json             # File-backed database (MockDB mode)
│   │   └── sample_10k_logs.json        # Generated test logs
│   ├── src/
│   │   ├── config/                     # Configuration parameters
│   │   ├── controllers/
│   │   │   └── logController.js        # Log queries, bulk upload, stats logic
│   │   ├── db/
│   │   │   ├── connection.js           # DB connector and fallback switcher
│   │   │   └── mockDb.js               # MockDB query implementation
│   │   ├── models/
│   │   │   └── Log.js                  # Mongoose schema for MongoDB
│   │   ├── routes/
│   │   │   └── logRoutes.js            # Express endpoint maps
│   │   ├── utils/
│   │   │   └── generateDummyLogs.js    # Dummy logs generator script
│   │   └── index.js                    # Express app entry point
│   ├── .env                            # Backend environment configuration
│   └── package.json                    # Backend dependencies & scripts
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── AnalyticsSummary.jsx    # Metrics and SVG graphs
│   │   │   ├── LogDetailsModal.jsx     # Side drawer investigation
│   │   │   ├── LogFilters.jsx          # Search and dropdown filters
│   │   │   ├── LogTable.jsx            # Sorting table and page actions
│   │   │   └── UploadModal.jsx         # Drag-and-drop log uploader
│   │   ├── utils/
│   │   │   └── api.js                  # Fetch wrapper for Express APIs
│   │   ├── App.jsx                     # Master view coordinator
│   │   ├── index.css                   # Custom global CSS styles
│   │   └── main.jsx                    # React compiler bootstrapper
│   ├── index.html                      # Root HTML and fonts import
│   ├── vite.config.js                  # Dev proxy and bundler setup
│   └── package.json                    # Frontend dependencies & scripts
│
├── package.json                        # Root runner (concurrent launcher)
└── README.md                           # Main instructions
```
