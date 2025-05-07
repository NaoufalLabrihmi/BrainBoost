# 🧠 Brain Boost

> **Compete. Learn. Win.**

Brain Boost is the ultimate learning competition platform. Students and teachers engage in real-time quizzes, climb leaderboards, earn points, and unlock real rewards—all in a vibrant, collaborative community. Designed for modern classrooms and self-learners alike, Brain Boost transforms knowledge into an exciting, gamified experience.

---

## 🚀 Features

- **Interactive Quizzes**: Teachers create engaging quizzes (multiple-choice, true/false, short answer). Students join with a unique code and compete live.
- **Kahoot-Style Points**: Fast, correct answers earn more points. Real-time scoring and leaderboards keep the competition fierce.
- **Rewards Shop**: Students redeem points for real prizes in a built-in shop.
- **Collaborative Forum**: Ask questions, share knowledge, and help others in a supportive community.
- **Admin Dashboard**: Manage users, quizzes, and monitor platform activity.
- **Modern UI/UX**: Beautiful, accessible, and responsive design with dark mode.
- **Secure Auth**: Email/password authentication powered by Supabase.
- **Real-Time Updates**: Live quiz sessions, instant feedback, and dynamic leaderboards.

---

## 🛠️ Tech Stack

- **Frontend**: React 18, Vite, TypeScript, Tailwind CSS, shadcn/ui, Radix UI, Zustand, React Query
- **Backend**: [Supabase](https://supabase.com/) (Postgres, Auth, Realtime, Storage)
- **Other**: Chart.js, Recharts, Framer Motion, Lucide Icons

---

## ⚡ Quick Start

### 1. **Clone the Repository**
```bash
git clone (https://github.com/NaoufalLabrihmi/BrainBoost.git)
cd BrainBoost
```

### 2. **Install Dependencies**
```bash
npm install
# or
yarn install
```

### 3. **Configure Environment Variables**
Create a `.env` file in the root with the following:
```env
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```
You can find these in your [Supabase project settings](https://app.supabase.com/).

### 4. **Set Up Supabase Database**
- Create a new project on [Supabase](https://app.supabase.com/).
- (Optional) Add seed data for quizzes, products, etc.

### 5. **Start the App**
```bash
npm run dev
# or
yarn dev
```
Visit [http://localhost:8080](http://localhost:8080) in your browser.

---

## 🧑‍💻 Usage Guide

### 👩‍🏫 **For Teachers**
1. **Sign Up** as a teacher.
2. **Create Quizzes**: Add questions, set time limits, and publish.
3. **Share Access Code**: Students join your quiz with a unique code.
4. **Start Live Session**: Monitor real-time answers and leaderboard.

### 👨‍🎓 **For Students**
1. **Sign Up** as a student.
2. **Join Quizzes**: Enter the access code provided by your teacher.
3. **Compete**: Answer questions quickly and accurately to earn points.
4. **Redeem Rewards**: Spend points in the shop for real prizes.

### 💬 **Forum**
- Ask questions, help others, and build your learning network.

---

## 🏗️ Project Structure

```
├── src/
│   ├── pages/         # Main app pages (Dashboard, Quizzes, Shop, Forum, etc.)
│   ├── components/    # Reusable UI components
│   ├── lib/           # Auth, API, and utility logic
│   ├── integrations/  # Supabase client setup
│   └── ...
├── supabase/
│   └──               # Supabase backend setup
├── public/            # Static assets
├── package.json       # Project metadata and scripts
└── ...
```

---

## 🧩 Environment Variables

| Variable                | Description                  |
|------------------------ |-----------------------------|
| VITE_SUPABASE_URL       | Your Supabase project URL    |
| VITE_SUPABASE_ANON_KEY  | Supabase anon/public API key |

---

## 📝 Contribution Guide

1. **Fork** this repo and create your branch: `git checkout -b feature/your-feature`
2. **Commit** your changes: `git commit -am 'Add new feature'`
3. **Push** to the branch: `git push origin feature/your-feature`
4. **Open a Pull Request**

All contributions are welcome! Please follow the existing code style and add tests where possible.

---

## 🦾 Accessibility & Best Practices
- Fully keyboard navigable
- Screen reader friendly (aria labels, descriptions)
- Responsive and mobile-first design
- Linting and formatting enforced

---

## 📦 Scripts

| Command        | Description                |
|----------------|---------------------------|
| npm run dev    | Start development server   |
| npm run build  | Build for production      |
| npm run preview| Preview production build   |
| npm run lint   | Lint codebase             |

---

## 🌐 Deployment
- Deploy on [Vercel](https://vercel.com/), [Netlify](https://netlify.com/), or any static host.
- Set the required environment variables in your deployment dashboard.

---

## 📄 License

All rights reserved. No one is allowed to update, modify, or work on this project without the explicit permission of Naoufal Labrihmi.

---

## ✨ Credits

Made with ❤️ by Naoufal Labrihmi.

---

> **Ready to boost your brain? Jump in, compete, and become a champion of knowledge!**
