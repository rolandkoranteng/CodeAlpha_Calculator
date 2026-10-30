# Modern Glassmorphic Calculator 🧮

A sleek, responsive, and feature-rich Calculator built with semantic **HTML5**, modern **CSS3** (Glassmorphism & CSS Variables), and vanilla **JavaScript (ES6+)**.

Developed as part of the **CodeAlpha Web Development Internship — Task 2**.

---

## 🚀 Live Demo & Preview
To run the calculator locally:
1. Clone or download this repository.
2. Double-click or open `index.html` directly in any modern web browser (Chrome, Edge, Firefox, Safari).
3. No build tools, external libraries, or local server installations required!

---

## 🌟 Key Features

### 1. Core Arithmetic Operations
- **Addition (`+`)**, **Subtraction (`−`)**, **Multiplication (`×`)**, **Division (`÷`)**
- **Modulo / Remainder (`%`)** support
- **Sign toggle (`±`)** for positive and negative numbers
- **Decimal point (`.`)** validation (prevents duplicate decimal points)
- **PEMDAS / BODMAS Order of Operations** (multiplication and division take precedence over addition and subtraction)
- **Safe Evaluation Engine**: Custom tokenizer and parser instead of unsafe `eval()`.
- **Division by Zero Protection**: Graceful `"Cannot divide by 0"` alert instead of application crashing.
- **Precision Correction**: Eliminates floating-point artifacts (e.g. `0.1 + 0.2 = 0.3`).

### 2. User Interface & Display
- **Triple Display Hierarchy**:
  - **Expression History Row**: Displays previous operands and chained operations.
  - **Main Display**: Large, easy-to-read numbers with automatic font scaling for up to 16 digits.
  - **Real-Time Result Preview**: Live calculation preview as you type before pressing equals (`=`).
- **Click-to-Copy**: Click anywhere on the display screen to copy the result to your clipboard with visual badge confirmation.
- **Auto-Formatting**: Comma separators for readable thousands and millions (e.g., `1,234,567.89`).

### 3. ✨ Bonus Enhancements
- ⌨️ **Full Keyboard Support**:
  - Numbers `0`–`9` and `.`
  - Operators: `+`, `-`, `*`, `/`, `%` (also accepts `x` or `X` for multiply)
  - `Enter` or `=` to calculate
  - `Backspace` or `Delete` to remove the last character
  - `Escape` or `c` / `C` for All Clear (`AC`)
  - `n` for sign toggle (`±`)
  - **Visual Key-Press Feedback**: Interactive button flash matching each pressed keyboard key.
- 🌓 **Dark & Light Mode Toggle**: Smooth theme transition with user preference saved in `localStorage`.
- 📜 **Interactive Calculation History**:
  - View calculation history with timestamps.
  - Click any past calculation to reload the result into the display.
  - History persists across browser sessions using `localStorage`.
  - Clear history option included.
- 🔊 **Synthesized Audio Feedback**:
  - High-tech subtle click feedback powered by the native **Web Audio API** (zero external MP3/WAV assets needed).
  - One-click mute/unmute toggle saved in `localStorage`.
- 📱 **Mobile & Desktop Responsive**: Beautiful glassmorphic design with fluid layout and ambient glowing background orbs.

---

## ⌨️ Keyboard Shortcuts Reference

| Key(s) | Action |
| :--- | :--- |
| `0` – `9` | Input Digits |
| `.` | Decimal point |
| `+` | Addition |
| `-` | Subtraction |
| `*` or `x` | Multiplication |
| `/` | Division |
| `%` | Modulo |
| `Enter` or `=` | Calculate Result |
| `Backspace` or `Del` | Delete last digit |
| `Escape` or `c` / `C` | All Clear (`AC`) |
| `n` | Toggle Sign (`±`) |

---

## 📁 File Structure

```text
codealpha2/
├── index.html        # Semantic HTML5 markup with accessible controls
├── style.css         # Modern glassmorphism UI, light/dark themes, responsive grid
├── script.js         # Arithmetic engine, PEMDAS evaluation, history & audio synthesis
└── README.md         # Project documentation and guide
```

---

## 🛠️ Technologies Used
- **HTML5**: Semantic tags, ARIA attributes, SVG iconography.
- **CSS3**: CSS Grid, Flexbox, CSS Custom Properties (Theming), Glassmorphism (`backdrop-filter`), animations.
- **JavaScript (ES6+)**: Custom mathematical tokenizer, Web Audio API, Web Storage API (`localStorage`), Clipboard API.

---

## 👨‍💻 Submission Details
- **Task**: Task 2 - Build a Calculator
- **Organization**: CodeAlpha
- **Status**: Completed ✅

