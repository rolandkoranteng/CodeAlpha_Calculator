/**
 * Smart Modern Calculator
 * CodeAlpha Internship - Task 2
 *
 * Core Features:
 * - Full arithmetic calculations (+, -, *, /, %) with operator precedence (PEMDAS)
 * - Real-time calculation preview
 * - Auto-scaling display typography for long numbers
 * - Comprehensive keyboard support with visual key-press feedback
 * - Interactive calculation history tape with localStorage persistence
 * - Audio click feedback using Web Audio API (synthesized, zero dependencies)
 * - Dark & Light mode theme toggle
 * - Click-to-copy result with visual badge indicator
 */

(() => {
  'use strict';

  // ==========================================
  // DOM Elements
  // ==========================================
  const mainDisplay = document.getElementById('mainDisplay');
  const expressionDisplay = document.getElementById('expressionDisplay');
  const previewDisplay = document.getElementById('previewDisplay');
  const displaySection = document.getElementById('displaySection');
  const copyBadge = document.getElementById('copyBadge');

  const themeToggle = document.getElementById('themeToggle');
  const sunIcon = themeToggle.querySelector('.sun-icon');
  const moonIcon = themeToggle.querySelector('.moon-icon');

  const soundToggle = document.getElementById('soundToggle');
  const soundOnIcon = soundToggle.querySelector('.sound-on');
  const soundOffIcon = soundToggle.querySelector('.sound-off');

  const historyToggle = document.getElementById('historyToggle');
  const historyPanel = document.getElementById('historyPanel');
  const closeHistoryBtn = document.getElementById('closeHistoryBtn');
  const clearHistoryBtn = document.getElementById('clearHistoryBtn');
  const historyList = document.getElementById('historyList');

  const keypad = document.querySelector('.keypad');

  // ==========================================
  // Calculator State
  // ==========================================
  let currentOperand = '0';
  let expressionTokens = []; // Array of { type: 'num'|'op', value: string }
  let justCalculated = false;
  let isSoundEnabled = localStorage.getItem('calc_sound') !== 'false'; // default true
  let historyData = JSON.parse(localStorage.getItem('calc_history') || '[]');

  // ==========================================
  // Audio Synthesizer (Web Audio API)
  // ==========================================
  let audioCtx = null;

  function initAudio() {
    if (!audioCtx && (window.AudioContext || window.webkitAudioContext)) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      audioCtx = new AudioContextClass();
    }
  }

  function playClickSound(freq = 600, duration = 0.035) {
    if (!isSoundEnabled) return;
    try {
      initAudio();
      if (!audioCtx) return;
      if (audioCtx.state === 'suspended') {
        audioCtx.resume();
      }

      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(freq * 0.5, audioCtx.currentTime + duration);

      gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);

      osc.connect(gain);
      gain.connect(audioCtx.destination);

      osc.start();
      osc.stop(audioCtx.currentTime + duration);
    } catch {
      // Audio playback fails silently if restricted
    }
  }

  // ==========================================
  // Arithmetic Engine with Safe PEMDAS Evaluation
  // ==========================================

  /**
   * Safely formats and limits floating-point precision artifacts (e.g. 0.1 + 0.2 = 0.3)
   */
  function cleanFloat(num) {
    if (!isFinite(num)) return num;
    const rounded = parseFloat(num.toPrecision(12));
    return rounded;
  }

  /**
   * Formats a number with comma separators for clean reading
   */
  function formatNumberDisplay(numStr) {
    if (numStr === 'Error' || numStr === 'Cannot divide by 0') return numStr;
    if (!numStr || numStr === '-') return numStr;
    if (numStr.includes('e') || numStr.includes('E')) return numStr;

    const isNegative = numStr.startsWith('-');
    const cleanStr = isNegative ? numStr.slice(1) : numStr;
    const parts = cleanStr.split('.');
    const integerPart = parts[0] ? Number(parts[0]).toLocaleString('en-US') : '0';
    let formatted = isNegative ? '-' + integerPart : integerPart;

    if (parts.length > 1) {
      formatted += '.' + parts[1];
    } else if (numStr.endsWith('.')) {
      formatted += '.';
    }
    return formatted;
  }

  /**
   * Evaluates an array of tokens using PEMDAS order of operations
   * Tokens format: [{ type: 'num', value: 10 }, { type: 'op', value: '+' }, ...]
   */
  function evaluateTokens(tokens) {
    if (!tokens || tokens.length === 0) return 0;

    // Filter out trailing operators for preview evaluation
    let validTokens = [...tokens];
    while (validTokens.length > 0 && validTokens[validTokens.length - 1].type === 'op') {
      validTokens.pop();
    }
    if (validTokens.length === 0) return 0;

    // Pass 1: Multiplication, Division, and Modulo
    let pass1 = [];
    let i = 0;
    while (i < validTokens.length) {
      const token = validTokens[i];
      if (token.type === 'op' && (token.value === '*' || token.value === '/' || token.value === '%')) {
        const prev = pass1.pop();
        const next = validTokens[i + 1];
        if (!prev || !next) return NaN;

        const a = Number(prev.value);
        const b = Number(next.value);
        let res = 0;

        if (token.value === '*') {
          res = a * b;
        } else if (token.value === '/') {
          if (b === 0) {
            pass1.push({ type: 'num', value: 'Cannot divide by 0' });
            i += 2;
            continue;
          }
          res = a / b;
        } else if (token.value === '%') {
          if (b === 0) {
            pass1.push({ type: 'num', value: 'Cannot divide by 0' });
            i += 2;
            continue;
          }
          res = a % b;
        }

        pass1.push({ type: 'num', value: cleanFloat(res) });
        i += 2;
      } else {
        pass1.push(token);
        i++;
      }
    }

    // Check for division by zero
    if (pass1.some(tok => tok.value === 'Cannot divide by 0')) {
      return 'Cannot divide by 0';
    }

    if (pass1.length === 0) return 0;

    // Pass 2: Addition and Subtraction
    let result = Number(pass1[0].value);
    for (let j = 1; j < pass1.length; j += 2) {
      const op = pass1[j];
      const next = pass1[j + 1];
      if (!op || !next) break;

      const val = Number(next.value);
      if (op.value === '+') {
        result += val;
      } else if (op.value === '-') {
        result -= val;
      }
    }

    return cleanFloat(result);
  }

  // ==========================================
  // Display Updaters
  // ==========================================
  function updateDisplay() {
    // 1. Format and display main operand
    if (currentOperand === 'Cannot divide by 0' || currentOperand === 'Error') {
      mainDisplay.textContent = currentOperand;
    } else {
      mainDisplay.textContent = formatNumberDisplay(currentOperand);
    }

    // Dynamic Font Scaling for large numbers
    const len = currentOperand.length;
    if (len > 14) {
      mainDisplay.style.fontSize = '1.5rem';
    } else if (len > 10) {
      mainDisplay.style.fontSize = '1.9rem';
    } else if (len > 7) {
      mainDisplay.style.fontSize = '2.3rem';
    } else {
      mainDisplay.style.fontSize = '2.75rem';
    }

    // 2. Build and display expression line
    const exprText = expressionTokens.map(tok => {
      if (tok.type === 'op') {
        switch (tok.value) {
          case '*': return ' × ';
          case '/': return ' ÷ ';
          case '+': return ' + ';
          case '-': return ' − ';
          case '%': return ' % ';
          default: return ` ${tok.value} `;
        }
      }
      return formatNumberDisplay(String(tok.value));
    }).join('');

    expressionDisplay.textContent = exprText;

    // 3. Real-time preview calculation
    updateRealTimePreview();
  }

  function updateRealTimePreview() {
    // If expression is empty or user is only typing first number, clear preview
    if (expressionTokens.length === 0) {
      previewDisplay.textContent = '';
      return;
    }

    // Prepare tokens including current operand if present
    let testTokens = [...expressionTokens];
    if (currentOperand !== '' && currentOperand !== 'Cannot divide by 0') {
      testTokens.push({ type: 'num', value: currentOperand });
    }

    // Check if testTokens has at least one operation
    const hasOp = testTokens.some(t => t.type === 'op');
    if (!hasOp) {
      previewDisplay.textContent = '';
      return;
    }

    const previewResult = evaluateTokens(testTokens);

    if (previewResult === 'Cannot divide by 0') {
      previewDisplay.textContent = '= Cannot divide by 0';
    } else if (!isNaN(previewResult) && previewResult !== null && isFinite(previewResult)) {
      previewDisplay.textContent = `= ${formatNumberDisplay(String(previewResult))}`;
    } else {
      previewDisplay.textContent = '';
    }
  }

  // ==========================================
  // Input Handling Logic
  // ==========================================
  function inputDigit(digit) {
    playClickSound(520, 0.025);

    if (justCalculated) {
      currentOperand = digit;
      expressionTokens = [];
      justCalculated = false;
    } else if (currentOperand === '0' || currentOperand === 'Cannot divide by 0') {
      currentOperand = digit;
    } else if (currentOperand === '-') {
      currentOperand = '-' + digit;
    } else {
      // Prevent excessively long numbers
      if (currentOperand.length >= 16) return;
      currentOperand += digit;
    }
    updateDisplay();
  }

  function inputDecimal() {
    playClickSound(580, 0.025);

    if (justCalculated) {
      currentOperand = '0.';
      expressionTokens = [];
      justCalculated = false;
    } else if (currentOperand === 'Cannot divide by 0') {
      currentOperand = '0.';
    } else if (!currentOperand.includes('.')) {
      currentOperand += '.';
    }
    updateDisplay();
  }

  function handleOperator(op) {
    playClickSound(680, 0.035);

    if (currentOperand === 'Cannot divide by 0') {
      clearAll();
      return;
    }

    // Allow starting with negative number if user presses '-' first
    if (op === '-' && currentOperand === '0' && expressionTokens.length === 0) {
      currentOperand = '-';
      updateDisplay();
      return;
    }

    if (justCalculated) {
      // Continue chaining calculation from previous answer
      expressionTokens = [{ type: 'num', value: currentOperand }, { type: 'op', value: op }];
      currentOperand = '';
      justCalculated = false;
      updateDisplay();
      return;
    }

    if (currentOperand !== '' && currentOperand !== '-') {
      expressionTokens.push({ type: 'num', value: currentOperand });
      expressionTokens.push({ type: 'op', value: op });
      currentOperand = '';
    } else if (expressionTokens.length > 0) {
      // Replace last operator if user clicks consecutive operators
      const lastToken = expressionTokens[expressionTokens.length - 1];
      if (lastToken.type === 'op') {
        lastToken.value = op;
      }
    }
    updateDisplay();
  }

  function calculateResult() {
    playClickSound(800, 0.05);

    if (expressionTokens.length === 0 && currentOperand !== '') return;

    if (currentOperand !== '') {
      expressionTokens.push({ type: 'num', value: currentOperand });
    } else if (expressionTokens.length > 0 && expressionTokens[expressionTokens.length - 1].type === 'op') {
      // Remove dangling operator
      expressionTokens.pop();
    }

    if (expressionTokens.length === 0) return;

    // Full expression string for history
    const exprHistoryString = expressionTokens.map(tok => {
      if (tok.type === 'op') {
        switch (tok.value) {
          case '*': return '×';
          case '/': return '÷';
          case '+': return '+';
          case '-': return '−';
          case '%': return '%';
          default: return tok.value;
        }
      }
      return tok.value;
    }).join(' ');

    const result = evaluateTokens(expressionTokens);

    if (result === 'Cannot divide by 0') {
      currentOperand = 'Cannot divide by 0';
      previewDisplay.textContent = '';
      expressionTokens = [];
      justCalculated = true;
      updateDisplay();
      return;
    }

    if (isNaN(result) || !isFinite(result)) {
      currentOperand = 'Error';
    } else {
      currentOperand = String(result);
      saveToHistory(exprHistoryString, currentOperand);
    }

    previewDisplay.textContent = '';
    expressionTokens = [];
    justCalculated = true;
    updateDisplay();
  }

  function negateNumber() {
    playClickSound(550, 0.03);
    if (currentOperand === '0' || currentOperand === 'Cannot divide by 0') return;

    if (currentOperand.startsWith('-')) {
      currentOperand = currentOperand.slice(1);
    } else {
      currentOperand = '-' + currentOperand;
    }
    updateDisplay();
  }

  function deleteLastChar() {
    playClickSound(450, 0.03);
    if (justCalculated) {
      clearAll();
      return;
    }

    if (currentOperand.length > 1 && currentOperand !== 'Cannot divide by 0') {
      currentOperand = currentOperand.slice(0, -1);
      if (currentOperand === '-') currentOperand = '0';
    } else {
      currentOperand = '0';
    }
    updateDisplay();
  }

  function clearAll() {
    playClickSound(400, 0.04);
    currentOperand = '0';
    expressionTokens = [];
    justCalculated = false;
    updateDisplay();
  }

  // ==========================================
  // History Feature
  // ==========================================
  function saveToHistory(expression, result) {
    const item = {
      id: Date.now(),
      expression,
      result: formatNumberDisplay(result),
      rawResult: result,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    historyData.unshift(item);
    if (historyData.length > 30) historyData.pop(); // Keep top 30
    localStorage.setItem('calc_history', JSON.stringify(historyData));
    renderHistory();
  }

  function renderHistory() {
    if (historyData.length === 0) {
      historyList.innerHTML = '<div class="history-empty">No calculations yet</div>';
      return;
    }

    historyList.innerHTML = historyData.map(item => `
      <div class="history-item" data-val="${item.rawResult}" title="Click to load result">
        <div class="history-exp">${item.expression} =</div>
        <div class="history-res">${item.result}</div>
      </div>
    `).join('');

    // Attach click listener to restore history items
    historyList.querySelectorAll('.history-item').forEach(itemEl => {
      itemEl.addEventListener('click', () => {
        const val = itemEl.getAttribute('data-val');
        if (val) {
          playClickSound(650, 0.03);
          currentOperand = val;
          expressionTokens = [];
          justCalculated = false;
          updateDisplay();
          historyPanel.classList.remove('open');
          historyPanel.setAttribute('aria-hidden', 'true');
        }
      });
    });
  }

  function clearHistory() {
    playClickSound(420, 0.04);
    historyData = [];
    localStorage.removeItem('calc_history');
    renderHistory();
  }

  // ==========================================
  // Copy to Clipboard
  // ==========================================
  async function copyCurrentResult() {
    const textToCopy = currentOperand;
    if (!textToCopy || textToCopy === 'Cannot divide by 0' || textToCopy === 'Error') return;

    try {
      await navigator.clipboard.writeText(textToCopy);
      playClickSound(750, 0.025);
      copyBadge.classList.add('visible');
      setTimeout(() => {
        copyBadge.classList.remove('visible');
      }, 1500);
    } catch {
      // Fallback if clipboard API restricted
    }
  }

  // ==========================================
  // Keyboard Support & Visual Feedback
  // ==========================================
  function triggerButtonEffect(btn) {
    if (!btn) return;
    btn.classList.add('key-pressed');
    setTimeout(() => {
      btn.classList.remove('key-pressed');
    }, 150);
  }

  function handleKeyboardInput(e) {
    // Ignore keyboard events if user is focusing an input (if any)
    if (['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) return;

    const key = e.key;
    let targetButton = null;

    if (['/', '*', '+', '-', 'Enter', '=', '%', 'Backspace', 'Escape', 'Delete'].includes(key) || key.toLowerCase() === 'x') {
      e.preventDefault();
    }

    if (key >= '0' && key <= '9') {
      targetButton = document.querySelector(`.btn[data-number="${key}"]`);
      inputDigit(key);
    } else if (key === '.') {
      targetButton = document.querySelector('.btn[data-action="decimal"]');
      inputDecimal();
    } else if (['+', '-', '*', '/'].includes(key) || key.toLowerCase() === 'x') {
      const op = key.toLowerCase() === 'x' ? '*' : key;
      targetButton = document.querySelector(`.btn[data-operator="${op}"]`);
      handleOperator(op);
    } else if (key === '%') {
      targetButton = document.querySelector('.btn[data-operator="%"]');
      handleOperator('%');
    } else if (key === 'Enter' || key === '=') {
      targetButton = document.querySelector('.btn[data-action="calculate"]');
      calculateResult();
    } else if (key === 'Backspace' || key === 'Delete') {
      targetButton = document.querySelector('.btn[data-action="delete"]');
      deleteLastChar();
    } else if (key === 'Escape' || key.toLowerCase() === 'c') {
      targetButton = document.querySelector('.btn[data-action="clear"]');
      clearAll();
    } else if (key.toLowerCase() === 'n') {
      targetButton = document.querySelector('.btn[data-action="negate"]');
      negateNumber();
    }

    if (targetButton) {
      triggerButtonEffect(targetButton);
    }
  }

  // ==========================================
  // Theme Switching
  // ==========================================
  function initTheme() {
    const savedTheme = localStorage.getItem('calc_theme') || 'dark';
    document.body.setAttribute('data-theme', savedTheme);
    applyThemeIcons(savedTheme);
  }

  function applyThemeIcons(theme) {
    if (theme === 'light') {
      sunIcon.classList.add('hidden');
      moonIcon.classList.remove('hidden');
    } else {
      sunIcon.classList.remove('hidden');
      moonIcon.classList.add('hidden');
    }
  }

  function toggleTheme() {
    playClickSound(600, 0.03);
    const currentTheme = document.body.getAttribute('data-theme') || 'dark';
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.body.setAttribute('data-theme', newTheme);
    localStorage.setItem('calc_theme', newTheme);
    applyThemeIcons(newTheme);
  }

  // ==========================================
  // Sound Feedback Toggle
  // ==========================================
  function updateSoundUI() {
    if (isSoundEnabled) {
      soundOnIcon.classList.remove('hidden');
      soundOffIcon.classList.add('hidden');
    } else {
      soundOnIcon.classList.add('hidden');
      soundOffIcon.classList.remove('hidden');
    }
  }

  function toggleSound() {
    isSoundEnabled = !isSoundEnabled;
    localStorage.setItem('calc_sound', isSoundEnabled);
    updateSoundUI();
    if (isSoundEnabled) {
      playClickSound(650, 0.04);
    }
  }

  // ==========================================
  // Event Listeners Setup
  // ==========================================
  function setupEventListeners() {
    // Keypad Click Delegation
    keypad.addEventListener('click', (e) => {
      const btn = e.target.closest('.btn');
      if (!btn) return;

      if (btn.dataset.number) {
        inputDigit(btn.dataset.number);
      } else if (btn.dataset.operator) {
        handleOperator(btn.dataset.operator);
      } else if (btn.dataset.action) {
        const action = btn.dataset.action;
        switch (action) {
          case 'clear': clearAll(); break;
          case 'delete': deleteLastChar(); break;
          case 'decimal': inputDecimal(); break;
          case 'calculate': calculateResult(); break;
          case 'negate': negateNumber(); break;
        }
      }
    });

    // Keyboard support
    window.addEventListener('keydown', handleKeyboardInput);

    // Display Click to Copy
    displaySection.addEventListener('click', copyCurrentResult);

    // Theme Toggle
    themeToggle.addEventListener('click', toggleTheme);

    // Sound Toggle
    soundToggle.addEventListener('click', toggleSound);

    // History Toggle & Controls
    historyToggle.addEventListener('click', () => {
      playClickSound(550, 0.03);
      const isOpen = historyPanel.classList.toggle('open');
      historyPanel.setAttribute('aria-hidden', String(!isOpen));
    });

    closeHistoryBtn.addEventListener('click', () => {
      playClickSound(500, 0.03);
      historyPanel.classList.remove('open');
      historyPanel.setAttribute('aria-hidden', 'true');
    });

    clearHistoryBtn.addEventListener('click', clearHistory);
  }

  // ==========================================
  // Initialization
  // ==========================================
  function init() {
    initTheme();
    updateSoundUI();
    renderHistory();
    setupEventListeners();
    updateDisplay();
  }

  // Initialize on DOM load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
