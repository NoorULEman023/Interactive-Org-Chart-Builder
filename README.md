# NexusHR — Interactive Org Chart Builder

NexusHR is a premium, enterprise-grade, high-fidelity Human Resources SaaS application designed to build, manage, and visualize corporate reporting structures. Styled with a minimalist, clean light theme inspired by top-tier modern productivity products (such as Linear, Notion, and Atlassian), the platform provides an interactive D3.js visualization workspace coupled with detailed HR analytical dashboards and directory listings.

---

## 🎨 Design System & Visual Vibe

- **Background Canvas**: Soft light slate `#FAFAFA`
- **Cards & Elevators**: Pure clinical white `#FFFFFF`
- **Primary Highlights**: Royal Sapphire `#2563EB`
- **Borders & Grids**: Soft ash grey `#E5E7EB`
- **Typography**: Complete Inter sans-serif typeface pairing clean vertical weights
- **Philosophy**: Pure negative space layout, soft rounded corners (12px - 16px), and subtle micro-shadows. No visual noise, terminal logs, or flashy gradients.

---

## 🚀 Key Features

### 1. Interactive D3.js Visualization Canvas
- **Dynamic Layout Nodes**: Renders realistic corporate reporting relationships using high-performance SVG.
- **D3 Zoom & Pan**: Fluid canvas navigation supporting double-clicking, mouse dragging, and wheel zooming.
- **Orientation Toggle**: Effortlessly swap layout directions between **Vertical (Top-to-Bottom)** and **Horizontal (Left-to-Right)** with one click.
- **Tree Collapsing & Expansion**: Click collapse handles to dynamically hide children sub-trees and repack the layout tightly; shows a direct count of hidden reports.

### 2. Safeguarded Corporate CRUD Operations
- **Onboard Hires**: Add direct reports directly to existing nodes or onboard standalone root managers.
- **Profile Updates**: Modify employee compensation, contact emails, workplace presence, bios, and corporate locations.
- **Dependency Safeguard**: The editor checks and blocks circular reporting structures (e.g. preventing an employee from reporting to themselves or their subordinates).
- **Subordinate Re-routing**: When deleting a supervisor, their direct reports are not lost. They are automatically and safely re-routed to report directly to the deleted supervisor's manager.

### 3. Comprehensive HR Analytical Dashboards
- **Enterprise Statistics**: Live tracking of headcount, annual payroll investments, active departments, locations, and span-of-control ratios.
- **SVG Budget Progress Bars**: Real-time visualization of capital distribution and personnel shares per department.
- **Presence Distribution Donut**: Clean status tracking for Hybrid, Remote, Active, and On-leave divisions.

### 4. Advanced Directory & Tabular Spreadsheets
- **Roster Index**: Standard spreadsheet view displaying all active staff.
- **Fuzzy Search & Highlighting**: Instantly search staff by name, role, email, or department; click rows to pan-and-zoom center the employee's node on the canvas.
- **Multi-Level Filters**: Slice organization records by departments, office locations, and workplace حضور status.
- **Spreadsheet Sorting**: Sort employees alphabetically, by annual salaries, or by tenure start date.

### 5. Multi-format Serialization (Import & Export)
- **JSON Serialization**: Import and export standard JSON records of your employee state.
- **Vector SVG Export**: Download clean, scalable vector representations of the active reporting canvas.
- **High-Resolution PNG**: Render the SVG canvas to an HTML5 canvas and trigger a high-resolution `.png` download.

---

## 🛠️ Technology Stack

- **Framework**: React 19 + TypeScript
- **Bundler**: Vite 6.x
- **Animation**: Framer Motion
- **Visualization Layout**: D3.js (D3-Hierarchy, D3-Zoom, D3-Selection)
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Persistence**: Local Storage Engine

---

## 📂 Folder Structure

```text
/
├── public/                 # Static asset folders
├── src/
│   ├── components/         # Modular interface components
│   │   ├── AddEditModal.tsx       # Onboard & Profile modifier form
│   │   ├── DepartmentsView.tsx    # Department metrics and rosters
│   │   ├── DetailsPanel.tsx       # Right profile inspector sidebar
│   │   ├── DirectoryView.tsx      # Tabular spreadsheet grid directory
│   │   ├── OrgChartCanvas.tsx     # Interactive D3 SVG tree canvas
│   │   └── StatsDashboard.tsx     # HR analytical dashboards
│   ├── data/
│   │   └── sampleData.ts          # Default mock roster of 40 corporate staff
│   ├── App.tsx             # Application coordinator and file state manager
│   ├── index.css           # Global typography and Tailwind directives
│   ├── main.tsx            # React entrypoint binder
│   └── types.ts            # Shared TypeScript types and interfaces
├── package.json            # Dependency manifest
├── tsconfig.json           # Compiler configuration
└── vite.config.ts          # Vite bundler parameters
```

---

## ⚡ Installation & Execution

### Prerequisites
Ensure you have [Node.js](https://nodejs.org/) (v18+) installed on your machine.

### Setup Instructions

1. **Extract/Clone the project workspace**
2. **Install node dependencies**:
   ```bash
   npm install
   ```
3. **Execute local developer server**:
   ```bash
   npm run dev
   ```
   The local environment is exposed on port `3000` at [http://localhost:3000/](http://localhost:3000/).

4. **Verify Linter and Build Compilation**:
   ```bash
   npm run lint
   ```
   and
   ```bash
   npm run build
   ```

---

## 📸 Screenshots Section

*Visual indicators are rendered inside the live application iframe.*

1. **Workspace Interactive Tree**: Main page with custom bezel paths, hover actions, layout orientation controls, search bars, and the slider panel.
2. **Analytical Statistics**: Department budget trackers, progress bars, and presence donuters.
3. ** Roster Spreadsheet**: Tabular employee lists, quick-search, sorting filters.

---

## 🔮 Future Improvements

- **Drag-and-Drop Node Reassignment**: Allow dragging a card on the canvas and dropping it under a different supervisor card to automatically execute a reporting line rewrite.
- **Multiple Organizations**: Support managing multiple corporate profiles from a central workspace.
- **Salary Band Modeling**: HR tools to model future salary increases and department hiring forecasts.
- **Slack & G-Suite Sync**: Synchronize active employee rosters with enterprise directories automatically.

---

## 📄 License

Distributed under the Apache-2.0 License. See the header file declarations for supplementary licensing details.
