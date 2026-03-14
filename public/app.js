// App State
const state = {
  questions: [],
  currentQuestionIndex: 0,
  answers: [],
  hasAnsweredCurrent: false
};

// DOM Elements
const screens = {
  start: document.getElementById('startScreen'),
  quiz: document.getElementById('quizScreen'),
  result: document.getElementById('resultScreen')
};

const startBtn = document.getElementById('startBtn');
const progressBar = document.getElementById('progressBar');
const progressFill = document.getElementById('progressFill');
const progressText = document.getElementById('progressText');
const questionNumber = document.getElementById('questionNumber');
const questionText = document.getElementById('questionText');
const optionsContainer = document.getElementById('optionsContainer');
const feedback = document.getElementById('feedback');
const nextBtn = document.getElementById('nextBtn');
const resetBtn = document.getElementById('resetBtn');

// Initialization
document.addEventListener('DOMContentLoaded', () => {
  setupEventListeners();
});

function setupEventListeners() {
  startBtn.addEventListener('click', handleStart);
  nextBtn.addEventListener('click', handleNextQuestion);
  resetBtn.addEventListener('click', handleReset);
}

// Start Handler
async function handleStart() {
  startBtn.classList.add('loading');
  startBtn.disabled = true;

  try {
    // Fragen laden
    const response = await fetch('/api/questions');
    state.questions = await response.json();

    // Zum Quiz wechseln
    setTimeout(() => {
      startBtn.classList.remove('loading');
      startBtn.disabled = false;
      switchScreen(screens.start, screens.quiz);
      progressBar.classList.remove('hidden');
      loadQuestion();
    }, 300);

  } catch (error) {
    console.error('Fehler beim Laden der Fragen:', error);
    alert('Ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut.');
    startBtn.classList.remove('loading');
    startBtn.disabled = false;
  }
}

// Screen Transition
function switchScreen(from, to) {
  from.classList.remove('active');
  from.classList.add('slide-out-left');

  setTimeout(() => {
    from.classList.remove('slide-out-left');
    from.style.display = 'none';

    to.style.display = 'block';
    to.classList.add('active', 'slide-in-right');

    setTimeout(() => {
      to.classList.remove('slide-in-right');
    }, 400);
  }, 400);
}

// Load Question
function loadQuestion() {
  const question = state.questions[state.currentQuestionIndex];
  state.hasAnsweredCurrent = false;

  // Update Progress
  const progress = ((state.currentQuestionIndex + 1) / state.questions.length) * 100;
  progressFill.style.width = `${progress}%`;
  progressText.textContent = `Frage ${state.currentQuestionIndex + 1} von ${state.questions.length}`;

  // Update Question
  questionNumber.textContent = `Frage ${state.currentQuestionIndex + 1}`;
  questionText.textContent = question.question;

  // Clear and Build Options
  optionsContainer.innerHTML = '';
  feedback.classList.add('hidden');
  nextBtn.classList.add('hidden');

  // Update Button Text for Last Question
  if (state.currentQuestionIndex === state.questions.length - 1) {
    nextBtn.textContent = 'Zur Auswertung des Quiz';
  } else {
    nextBtn.textContent = 'Nächste Frage';
  }

  question.options.forEach((option, index) => {
    const button = document.createElement('button');
    button.className = 'option-btn';
    button.textContent = option;
    button.dataset.index = index;
    button.addEventListener('click', () => handleAnswer(index, button));
    optionsContainer.appendChild(button);
  });

  // Animate Question Card
  const questionCard = document.getElementById('questionCard');
  questionCard.style.animation = 'none';
  setTimeout(() => {
    questionCard.style.animation = 'fadeIn 0.4s ease-out';
  }, 10);
}

// Handle Answer
function handleAnswer(answerIndex, button) {
  if (state.hasAnsweredCurrent) return;

  state.hasAnsweredCurrent = true;
  state.answers[state.currentQuestionIndex] = answerIndex;

  // Disable all buttons
  const allButtons = optionsContainer.querySelectorAll('.option-btn');
  allButtons.forEach(btn => {
    btn.disabled = true;
  });

  // Mark selected
  button.classList.add('selected');

  // Show Next Button immediately (Backend validiert später)
  setTimeout(() => {
    nextBtn.classList.remove('hidden');
  }, 300);
}

// Next Question
function handleNextQuestion() {
  if (state.currentQuestionIndex < state.questions.length - 1) {
    state.currentQuestionIndex++;
    loadQuestion();
  } else {
    submitQuiz();
  }
}

// Submit Quiz
async function submitQuiz() {
  nextBtn.classList.add('loading');
  nextBtn.disabled = true;

  try {
    const response = await fetch('/api/submit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        answers: state.answers
      })
    });

    const result = await response.json();

    if (result.success) {
      setTimeout(() => {
        showResults(result);
      }, 300);
    } else {
      alert('Ein Fehler ist aufgetreten: ' + result.error);
      nextBtn.classList.remove('loading');
      nextBtn.disabled = false;
    }

  } catch (error) {
    console.error('Fehler beim Absenden:', error);
    alert('Ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut.');
    nextBtn.classList.remove('loading');
    nextBtn.disabled = false;
  }
}

// Show Results
function showResults(result) {
  switchScreen(screens.quiz, screens.result);
  progressBar.classList.add('hidden');

  const { score, maxScore, percentage, results } = result;

  // Update Score
  document.getElementById('scoreBig').textContent = `${score}/${maxScore}`;
  document.getElementById('scorePercentage').textContent = `${percentage}%`;

  // Result Icon & Message
  let icon, message;

  if (percentage >= 90) {
    icon = '⭐⭐⭐';
    message = '<strong>Exzellent!</strong><br>Sie kennen sich hervorragend mit dem HPVG aus!';
    triggerConfetti();
  } else if (percentage >= 70) {
    icon = '⭐⭐';
    message = '<strong>Gut!</strong><br>Solides Grundwissen vorhanden. Weiter so!';
  } else if (percentage >= 50) {
    icon = '⭐';
    message = '<strong>Okay</strong><br>Es gibt noch Luft nach oben. Schauen Sie sich die Erklärungen an.';
  } else {
    icon = '📚';
    message = '<strong>Informationsbedarf</strong><br>Gerne mehr erfahren? Wir helfen Ihnen weiter!';
  }

  document.getElementById('resultIcon').textContent = icon;
  document.getElementById('resultMessage').innerHTML = message;

  // Details
  const detailsContainer = document.getElementById('resultDetails');
  detailsContainer.innerHTML = '<h3 style="margin-bottom: 16px; font-size: 16px; color: #6b7280;">Ihre Antworten:</h3>';

  results.forEach((item, index) => {
    const div = document.createElement('div');
    div.className = `result-item ${item.isCorrect ? 'correct' : 'wrong'}`;
    div.innerHTML = `
      <div class="result-question">
        ${index + 1}. ${item.question}
      </div>
      <div class="result-answer">
        ${item.isCorrect
          ? '✓ Richtig beantwortet'
          : `✗ Ihre Antwort war falsch<br>Richtig wäre: ${item.correctAnswerText}`
        }
      </div>
      ${item.impact ? `<div class="result-impact">💡 ${item.impact}</div>` : ''}
    `;
    detailsContainer.appendChild(div);
  });
}

// Confetti Effect
function triggerConfetti() {
  const container = document.getElementById('confetti');
  const colors = ['#2563eb', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  for (let i = 0; i < 50; i++) {
    setTimeout(() => {
      const confetti = document.createElement('div');
      confetti.className = 'confetti-piece';
      confetti.style.left = Math.random() * 100 + '%';
      confetti.style.background = colors[Math.floor(Math.random() * colors.length)];
      confetti.style.animationDelay = Math.random() * 0.3 + 's';
      confetti.style.animationDuration = (Math.random() * 2 + 2) + 's';
      container.appendChild(confetti);

      setTimeout(() => confetti.remove(), 3000);
    }, i * 30);
  }
}

// Reset
function handleReset() {
  // Reset State
  state.currentQuestionIndex = 0;
  state.answers = [];
  state.hasAnsweredCurrent = false;

  // Reset UI
  switchScreen(screens.result, screens.start);
  progressBar.classList.add('hidden');
  progressFill.style.width = '0%';

  // Reset Start Button
  startBtn.classList.remove('loading');
  startBtn.disabled = false;

  // Clear confetti
  document.getElementById('confetti').innerHTML = '';
}
