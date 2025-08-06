
# 📇 Contact Management System for College

A web-based contact management system to help colleges store, verify, and maintain external contacts in an organized way. Built using **React.js (Frontend)**, **Express.js (Backend)**, and **MySQL (Database)**.

---

## 🚀 Features

### 👤 Users & Roles
- **User (Faculty)**: Adds contacts with form data or visiting card images.
- **Category A/B/C Manager**:
  - Verifies contact details
  - Classifies contacts into categories A (High), B (Medium), C (Low)
  - Edits, deletes, logs communication history
- **Admin**:
  - Full access to all contacts
  - Manages task assignment (manual + automated)
  - Dashboard for statistics and monitoring

---

### 🔍 Key Functionalities
- **LinkedIn-style Profile Page**  
  Each contact has a dedicated profile page displaying full details (not modal).

- **OCR from Visiting Cards**  
  Users can upload images; system extracts text using OCR and autofills contact fields.

- **Automatic Task Assignment**  
  Tasks are auto-assigned to category managers based on:
  - Time since last contact
  - Contact's birthday (for follow-up/wishing)

- **Communication Logs**  
  Track who added the contact, who verified, and all communication events.

- **Contact Verification Workflow**  
  New contacts are reviewed by middlemen (A/B/C managers), verified, categorized, and moved to a verified contacts table.

---

## 📁 Folder Structure

```
/client         # React frontend
/server         # Express backend
/database       # MySQL scripts and seed data
```

---

## 💡 Tech Stack

- **Frontend**: React.js, Tailwind CSS, MUI
- **Backend**: Node.js, Express.js
- **Database**: MySQL
- **OCR Integration**: Tesseract.js or external OCR API
- **Task Scheduler**: Node Cron / setInterval

---

## 🛠️ Setup Instructions

### 1. Clone the repository
```bash
git clone https://github.com/your-username/contact-management-college.git
cd contact-management-college
```

### 2. Install dependencies

**Frontend:**
```bash
cd client
npm install
```

**Backend:**
```bash
cd ../server
npm install
```

### 3. Setup `.env` file in `/server`

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=yourpassword
DB_NAME=contact_management
PORT=5000
```

### 4. Start the project

**Backend:**
```bash
npm start
```

**Frontend:**
```bash
cd ../client
npm start
```

---

## 🗃️ Database Schema

- **users** (faculty and roles)
- **contacts** (raw data)
- **verified_contacts** (after approval)
- **logs** (who added/contacted whom and when)
- **tasks** (automated/manual assignments)

---

## 🔒 Role-Based Access Control

| Role         | Add Contact | Verify | View All | Assign Tasks |
|--------------|-------------|--------|----------|---------------|
| User         | ✅           | ❌     | ❌       | ❌             |
| Cat A/B/C    | ✅/Edit/Delete ✅   | ✅ (own category) | ❌             |
| Admin        | ✅           | ✅     | ✅        | ✅             |

---

## 🧠 Future Improvements

- Email/SMS integration for follow-ups
- Analytics dashboard for contact engagement
- Export contacts to CSV/PDF
- Multi-language support

---

## 🤝 Contributions

Pull requests are welcome! Please open issues for bugs or feature requests.

---


