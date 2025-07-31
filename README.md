# 🎯 Interactive Retrospective Board

A modern, user-friendly web application for conducting team retrospectives with drag-and-drop sticky notes.

## 🌟 Live Demo

**[Try it now →](https://joshuamtm.github.io/retrospective-app/)**

## ✨ Features

### Core Functionality
- **6 Retrospective Sections**: KEEP, STOP, START, LESS, MORE, and PUZZLING
- **Interactive Sticky Notes**: Create, edit, delete, and color-code notes
- **Drag & Drop**: Move notes between sections seamlessly
- **Color Selection**: 4 color options (Yellow, Pink, Blue, Green)

### User Experience
- **Empty State Guidance**: Helpful onboarding for new users
- **Visual Feedback**: Clear drag indicators and hover effects
- **Mobile Responsive**: Works great on desktop, tablet, and mobile
- **Accessibility**: ARIA labels, keyboard navigation, and screen reader support

### Data Management
- **Export to PDF**: Save your retrospective board as a high-quality PDF
- **Export to JSON**: Export data for reliable reimporting
- **Import from JSON**: Load previous retrospective data
- **Clear Board**: Start fresh with confirmation dialog

### Help & Guidance
- **Comprehensive Help Modal**: Learn about retrospectives and how to use the app
- **Visual Hints**: Edit indicators and usage tips throughout the interface

## 🚀 Getting Started

### For Teams
1. Visit the [live application](https://joshuamtm.github.io/retrospective-app/)
2. Click "Get Started" or "Add Note" in any section
3. Double-click notes to edit them
4. Drag notes between sections to organize
5. Export your board when finished

### For Developers

```bash
# Clone the repository
git clone https://github.com/joshuamtm/retrospective-app.git
cd retrospective-app

# Install dependencies
npm install

# Start development server
npm start

# Build for production
npm run build

# Deploy to GitHub Pages
npm run deploy
```

## 🛠️ Technology Stack

- **React 18** with TypeScript
- **react-dnd** for drag and drop functionality
- **html-to-image** and **jsPDF** for PDF export
- **CSS3** with responsive design
- **GitHub Pages** for deployment

## 📱 Mobile Support

The application is fully responsive and provides an optimized experience on mobile devices:
- Stacked section layout for mobile screens
- Touch-friendly button sizes
- Simplified interactions for small screens

## ♿ Accessibility

Built with accessibility in mind:
- ARIA labels and landmarks
- Keyboard navigation support
- Focus indicators
- Screen reader compatibility
- High contrast ratios

## 🎨 Design Philosophy

This application follows modern UX principles:
- **Progressive Disclosure**: Features revealed as needed
- **Visual Hierarchy**: Clear information structure
- **Immediate Feedback**: Real-time response to user actions
- **Error Prevention**: Confirmations for destructive actions

## 📊 What is a Retrospective?

A retrospective is a team meeting held at the end of a project sprint or iteration to reflect on what happened and identify improvements for the future. It's a key practice in Agile methodologies that helps teams continuously improve their processes.

### The 5+1 Framework

- **KEEP**: What worked well and should continue
- **STOP**: What didn't work and should be discontinued
- **START**: New ideas or practices to try
- **LESS**: What to reduce or scale back
- **MORE**: What to do more of
- **PUZZLING**: Questions or unclear items needing discussion

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🙏 Acknowledgments

Built with [Claude Code](https://claude.ai/code) - Anthropic's AI coding assistant.

---

**Made with ❤️ for better team retrospectives**
