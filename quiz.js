
/*
  IT 3203 - Milestone 2
  HTTP Knowledge Quiz
  Handles scoring, timer, feedback and resetting.
*/

// Correct answers for the 10 questions
const answers = {
  q1: ["hypertext transfer protocol"],
  q2: "GET",
  q3: "Not Found",
  q4: ["http/2", "http/2.0"],
  q5: "QUIC",
  q6: ["Multiplexing", "Header Compression", "Binary Framing"],
  q7: ["tls", "transport layer security"],
  q8: "HTTP/1.0",
  q9: ["GET", "POST", "DELETE"],
  q10: "Reuse"
};

const form = document.getElementById("quizForm");
const timerDisplay = document.getElementById("timer");
const results = document.getElementById("results");
const submitButton = document.getElementById("submitQuiz");
const resetButton = document.getElementById("resetQuiz");

const timeLimit = 600; // 10 minutes
let timeLeft = timeLimit;
let startTime = Date.now();
let timerInterval;
let submitted = false;

// Format seconds as minutes and seconds
function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  return `${minutes}:${String(remainingSeconds).padStart(2, "0")}`;
}

// Start the countdown timer
function startTimer() {
  clearInterval(timerInterval);

  timerInterval = setInterval(() => {
    const elapsed = Math.floor((Date.now() - startTime) / 1000);
    timeLeft = Math.max(0, timeLimit - elapsed);
    timerDisplay.textContent = formatTime(timeLeft);

    if (timeLeft <= 0) {
      submitQuiz();
    }
  }, 1000);
}

// Compare checkbox answers without depending on order
function sameSelections(selected, correct) {
  return selected.length === correct.length &&
    correct.every(answer => selected.includes(answer));
}

// Check all quiz answers and calculate the final score
function submitQuiz() {
  if (submitted) return;

  submitted = true;
  clearInterval(timerInterval);

  const elapsedSeconds = Math.min(
    timeLimit,
    Math.floor((Date.now() - startTime) / 1000)
  );

  const formData = new FormData(form);
  let correctCount = 0;
  let feedbackHTML = "";

  for (let i = 1; i <= 10; i++) {
    const question = `q${i}`;
    const correctAnswer = answers[question];
    let isCorrect = false;
    let userAnswer = "";

    if (i === 6 || i === 9) {
      const selected = formData.getAll(question);
      userAnswer = selected.join(", ") || "No answer";
      isCorrect = sameSelections(selected, correctAnswer);
    } else {
      userAnswer = (formData.get(question) || "").trim();

      if (Array.isArray(correctAnswer)) {
        isCorrect = correctAnswer.includes(userAnswer.toLowerCase());
      } else {
        isCorrect = userAnswer === correctAnswer;
      }
    }

    if (isCorrect) correctCount++;

    const answerText = Array.isArray(correctAnswer)
      ? correctAnswer.join(", ")
      : correctAnswer;

    // Create safe HTML elements for feedback
    const item = document.createElement("div");
    item.className = isCorrect ? "correct-answer" : "incorrect-answer";

    const heading = document.createElement("h3");
    heading.textContent = `Question ${i}: ${isCorrect ? "Correct" : "Incorrect"} - ${isCorrect ? 10 : 0}/10`;

    const given = document.createElement("p");
    given.textContent = `Your answer: ${userAnswer || "No answer"}`;

    const expected = document.createElement("p");
    expected.textContent = `Correct answer: ${answerText}`;

    item.append(heading, given, expected);
    feedbackHTML += item.outerHTML;
  }

  const score = correctCount * 10;
  const passed = score >= 70;

  results.hidden = false;
  results.className = passed ? "quiz-pass" : "quiz-fail";
  results.innerHTML = "";

  const summary = document.createElement("div");
  summary.className = "result-summary";

  const title = document.createElement("h2");
  title.textContent = passed ? "Congratulations! You Passed!" : "Quiz Not Passed";

  const scoreText = document.createElement("p");
  scoreText.textContent = `Final Score: ${score}/100 (${score}%)`;

  const timeText = document.createElement("p");
  timeText.textContent = `Time Spent: ${formatTime(elapsedSeconds)}`;

  const countText = document.createElement("p");
  countText.textContent = `Correct Answers: ${correctCount} out of 10`;

  summary.append(title, scoreText, timeText, countText);
  results.append(summary);

  const details = document.createElement("div");
  details.innerHTML = feedbackHTML;
  results.append(details);

  // Lock answers after submission
  form.querySelectorAll("input").forEach(input => {
    input.disabled = true;
  });

  submitButton.disabled = true;
  results.scrollIntoView({ behavior: "smooth" });
}

// Submit quiz when user clicks the button
form.addEventListener("submit", event => {
  event.preventDefault();
  submitQuiz();
});

// Reset all answers, results and timer
resetButton.addEventListener("click", () => {
  clearInterval(timerInterval);

  form.reset();
  form.querySelectorAll("input").forEach(input => {
    input.disabled = false;
  });

  results.hidden = true;
  results.innerHTML = "";
  results.className = "";

  submitted = false;
  timeLeft = timeLimit;
  startTime = Date.now();

  timerDisplay.textContent = "10:00";
  submitButton.disabled = false;

  startTimer();
  window.scrollTo({ top: 0, behavior: "smooth" });
});

// Begin the quiz timer when the page loads
startTimer();
