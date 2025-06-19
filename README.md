# 🔥 Codeforces Visualizer

<div align="center">

[![Live Demo](https://img.shields.io/badge/🚀%20Live%20Demo-Visit%20App-blue?style=for-the-badge)](https://cf-visualizer-rho.vercel.app/)
[![GitHub](https://img.shields.io/github/license/shashank2401/cf-visualizer?style=for-the-badge)](LICENSE)
[![GitHub stars](https://img.shields.io/github/stars/shashank2401/cf-visualizer?style=for-the-badge)](https://github.com/shashank2401/cf-visualizer/stargazers)
[![GitHub forks](https://img.shields.io/github/forks/shashank2401/cf-visualizer?style=for-the-badge)](https://github.com/shashank2401/cf-visualizer/network)

</div>

---

## 🚀 Live Demo

Experience the visualizer live: [**Codeforces Visualizer**](https://cf-visualizer-rho.vercel.app/)

---

## ✨ Overview

Codeforces Visualizer is a sleek, intuitive web application designed to help competitive programmers and enthusiasts visualize their Codeforces journey and compare their performance with others. Built with modern web technologies, it provides comprehensive analytics and beautiful visualizations of your coding progress.

**Please Note:** This is an unofficial tool and is not affiliated with or endorsed by Codeforces. It utilizes the publicly available Codeforces API.

## 🎯 Key Highlights

- ⚡ **High Performance**: Optimized with sessionStorage caching and efficient API usage
- 📱 **Fully Responsive**: Seamless experience across all devices
- 🎨 **Modern UI/UX**: Clean and intuitive interface built with Tailwind CSS
- 📊 **Rich Visualizations**: Interactive charts and graphs powered by Recharts
- 🔄 **Real-time Data**: Live data fetching from Codeforces API
- 🚀 **Fast Loading**: Built with Vite for lightning-fast development and production builds

## 🌟 Features

### 👤 Individual Profile Visualization
- **📈 Rating Analysis:**
  - Current and max rating with rank information
  - Interactive rating graph to track progress over time
  - Historical rating changes with contest-wise breakdown
  
- **📊 Activity Insights:**
  - Submission heatmap showing daily coding activity
  - Problems solved distribution by rating categories
  - Language usage statistics with pie charts
  
- **🏆 Performance Metrics:**
  - Verdict distribution (Accepted, Wrong Answer, TLE, etc.)
  - Tag-wise problem solving analysis
  - Contest participation history and performance

### 👥 Profile Comparison
- **⚔️ Head-to-Head Analysis:**
  - Side-by-side comparison of two Codeforces handles
  - Visual comparison bars for key statistics
  - Rating progression overlay graphs
  
- **📈 Detailed Comparisons:**
  - Problems solved by rating categories
  - Tag-wise problem distribution comparison
  - Contest duel table for common contests
  - Performance metrics analysis

### 🎨 User Experience
- **🎯 Smart Loading:** Independent component loading prevents race conditions
- **⚡ Optimized Performance:** SessionStorage caching reduces API calls
- **🛡️ Error Handling:** Robust error management with user-friendly messages
- **📱 Mobile-First:** Responsive design optimized for all screen sizes

## 🛠️ Technologies Used

### Frontend Stack
- **[React](https://react.dev/)** - Modern UI library for building interactive interfaces
- **[Vite](https://vitejs.dev/)** - Next-generation frontend tooling for faster development
- **[Tailwind CSS](https://tailwindcss.com/)** - Utility-first CSS framework for rapid styling
- **[Recharts](https://recharts.org/)** - Powerful and customizable data visualization library

### Development & Deployment
- **[Vercel](https://vercel.com/)** - Seamless deployment and hosting
- **[Codeforces API](https://codeforces.com/api/help)** - Official API for fetching contest data
- **[pnpm](https://pnpm.io/)** - Fast, disk space efficient package manager

### Performance Optimizations
- **SessionStorage Caching** - Reduces redundant API calls across page reloads
- **Submission Limiting** - Caps at 2,000 submissions to prevent API rate limiting
- **Atomic Loading Strategy** - Ensures consistent data loading for comparisons
- **Independent Components** - Prevents cascade failures in UI rendering

## 📦 Installation & Local Development

### Prerequisites

Ensure you have the following installed on your system:

- **[Node.js](https://nodejs.org/)** (v16.x or higher recommended)
- **[pnpm](https://pnpm.io/installation)** (Preferred package manager)

```bash
# Install pnpm globally if you haven't already
npm install -g pnpm
```

### 🚀 Quick Start

1. **Clone the repository:**
   ```bash
   git clone https://github.com/shashank2401/cf-visualizer.git
   cd cf-visualizer
   ```

2. **Install dependencies:**
   ```bash
   pnpm install
   ```

3. **Start the development server:**
   ```bash
   pnpm run dev
   ```
   
   🎉 Your app will be running at `http://localhost:5173/`

### 📝 Available Scripts

```bash
# Development
pnpm run dev          # Start development server
pnpm run build        # Build for production
pnpm run preview      # Preview production build locally
pnpm run lint         # Run ESLint for code quality
```

## 🏗️ Project Structure

```
cf-visualizer/
├── public/           # Static assets
├── src/
│   ├── components/   # Reusable React components
│   ├── pages/        # Main application pages
│   ├── hooks/        # Custom React hooks
│   ├── utils/        # Utility functions and helpers
│   ├── styles/       # Global styles and CSS
│   └── App.jsx       # Main application component
├── package.json      # Project dependencies and scripts
└── vite.config.js    # Vite configuration
```

## 🤝 Contributing

Contributions are what make the open-source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**! 

### 🔄 How to Contribute

1. **🍴 Fork the Project**
2. **🌿 Create your Feature Branch**
   ```bash
   git checkout -b feature/AmazingFeature
   ```
3. **💾 Commit your Changes**
   ```bash
   git commit -m 'feat: Add some AmazingFeature'
   ```
4. **🚀 Push to the Branch**
   ```bash
   git push origin feature/AmazingFeature
   ```
5. **📬 Open a Pull Request**

### 📋 Contribution Guidelines

- Follow the existing code style and conventions
- Write clear, descriptive commit messages
- Add comments for complex logic
- Test your changes thoroughly
- Update documentation if needed

### 🐛 Reporting Issues

Found a bug or have a feature request? Please [open an issue](https://github.com/shashank2401/cf-visualizer/issues) with:
- Clear description of the problem/feature
- Steps to reproduce (for bugs)
- Expected vs actual behavior
- Screenshots if applicable

## 📈 Performance Notes

This application has been optimized for performance and reliability:

- **Caching Strategy**: Uses sessionStorage to cache API responses, reducing redundant calls
- **Rate Limiting**: Limits submissions fetch to 2,000 entries to avoid API constraints
- **Error Resilience**: Independent component loading ensures partial failures don't crash the entire page
- **Loading Strategy**: Atomic "all or nothing" approach for profile comparisons ensures data consistency

## 🙏 Acknowledgments

- **[Codeforces](https://codeforces.com/)** for providing the comprehensive API
- **[Vercel](https://vercel.com/)** for seamless deployment and hosting
- The competitive programming community for inspiration and feedback

## 👨‍💻 Authors

- **Shashank Raj** - *Initial work and core development*
- **Ayush Raghuvanshi** - *Performance optimizations and enhancements*

---

<div align="center">

**⭐ Star this repository if it helped you visualize your Codeforces journey! ⭐**

Made with ❤️ for the competitive programming community

</div>
