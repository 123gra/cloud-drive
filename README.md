# Cloud-Based Storage Service (Mini Drive)

A simple cloud-based file storage application built using **Next.js** and **Supabase**, allowing users to securely upload, view, download, and delete files.

---

##  Features

- Email-based authentication using Supabase Magic Link
- Private storage for each authenticated user
- Upload files to cloud storage
- List uploaded files
- Download files
- Delete files
- Secure access using Supabase Row Level Security (RLS)

---

## Tech Stack

- Frontend: Next.js (App Router, React)
- Backend: Supabase (Auth, Storage, PostgreSQL)
- Language: TypeScript
- Authentication: Supabase Magic Link (OTP)
- Storage: Supabase Storage Buckets

---

##  Project Structure

cloud-drive/
│
├── apps/
│ ├── web/ # Frontend (Next.js)
│ └── api/ # Backend (Node / API services)
│
├── README.md
├── package.json
└── .env.example


---

## Live URL on Vercel


##  Setup Instructions

### 1. Clone the repository
git clone <repo-url>
cd cloud-drive
2. Install dependencies
bash
Copy code
npm install
3. Environment variables
Create .env file under apps/api and .env.local inside apps/web/:
.env
SUPABASE_URL=https://qberylehajwkvksnac.supabase.co
SUPABASE_SERVICE_ROLE_KEY=YOUR_SERVICE_ROLE_KEY
SUPABASE_STORAGE_BUCKET=drive
PORT=8080

.env.local
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
4. Supabase Configuration
Enable Email Authentication

Create a private bucket named user-files

Enable Row Level Security

Policies ensure users can access only their own files

5. Run the project

cd apps/web
npm run dev
Open:http://localhost:3000

🔹 Usage Flow
User logs in using email (Magic Link)

User uploads files to their private drive

Files are stored securely in Supabase

User can download or delete their files

User logs out

🔹 Security
Authentication handled by Supabase Auth

File access restricted by user ID

Storage policies prevent unauthorized access

🔹 Future Enhancements
Folder navigation

File preview

File sharing

Search functionality

UI improvements

🔹 Conclusion

This project demonstrates a basic cloud storage system with authentication, secure file handling, and modern web technologies.