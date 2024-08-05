import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  query,
  orderBy,
  limit,
  onSnapshot,
  serverTimestamp,
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCvYtMtcLkDU1IGOjAv0sRrCltWOnNqHzI",
  authDomain: "itc-sid-minigame.firebaseapp.com",
  projectId: "itc-sid-minigame",
  storageBucket: "itc-sid-minigame.appspot.com",
  messagingSenderId: "886855417056",
  appId: "1:886855417056:web:46ca0c5a8e71e1c4ce6485",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Quiz Data
const questions = [
  {
    images: [
      "images/testPic.jpeg",
      "images/testPic.jpeg",
      "images/testPic.jpeg",
    ],
    answer: "answer1",
  },
  {
    images: [
      "images/testPic.jpeg",
      "images/testPic.jpeg",
      "images/testPic.jpeg",
    ],
    answer: "answer2",
  },
  {
    images: [
      "images/testPic.jpeg",
      "images/testPic.jpeg",
      "images/testPic.jpeg",
    ],
    answer: "answer3",
  },
  {
    images: [
      "images/testPic.jpeg",
      "images/testPic.jpeg",
      "images/testPic.jpeg",
    ],
    answer: "answer4",
  },
  {
    images: [
      "images/testPic.jpeg",
      "images/testPic.jpeg",
      "images/testPic.jpeg",
    ],
    answer: "answer5",
  },
];

let currentQuestionIndex = 0;
let username = "";
let score = 0;
let startTime = 0;
let timerInterval;

// Event Listeners
document.getElementById("start-quiz-button").addEventListener("click", () => {
  console.log("Start button clicked");
  startQuiz();
});
document.getElementById("next-button").addEventListener("click", submitAnswer);
document
  .getElementById("play-again-button")
  .addEventListener("click", reloadPage);
document.getElementById("answer").addEventListener("keypress", handleEnterKey);
document
  .getElementById("username")
  .addEventListener("keypress", handleEnterKey);

function handleEnterKey(event) {
  if (event.key === "Enter") {
    if (document.getElementById("username").value.trim() === "") {
      console.log("Enter key pressed in username input");
      startQuiz();
    } else if (document.getElementById("answer").value.trim() !== "") {
      console.log("Enter key pressed in answer input");
      submitAnswer();
    }
  }
}

function startQuiz() {
  console.log("startQuiz function called");
  username = document.getElementById("username").value.trim();
  if (username === "") return;

  document.getElementById("name-input-section").classList.add("hidden");
  document.getElementById("quiz-section").classList.remove("hidden");
  startTime = Date.now();
  startTimer();
  loadQuestion();
}

function startTimer() {
  let timer = 0;
  timerInterval = setInterval(() => {
    timer++;
    const minutes = Math.floor(timer / 60)
      .toString()
      .padStart(2, "0");
    const seconds = (timer % 60).toString().padStart(2, "0");
    document.getElementById(
      "timer-display"
    ).innerText = `${minutes}:${seconds}`;
  }, 1000);
}

function loadQuestion() {
  console.log("Loading question");
  if (currentQuestionIndex >= questions.length) {
    endGame();
    return;
  }

  const question = questions[currentQuestionIndex];
  console.log("Current question:", question);

  const img1 = document.getElementById("image1");
  const img2 = document.getElementById("image2");
  const img3 = document.getElementById("image3");

  if (img1 && img2 && img3) {
    img1.src = question.images[0];
    img2.src = question.images[1];
    img3.src = question.images[2];
    console.log("Image sources set:", img1.src, img2.src, img3.src);
  } else {
    console.log("Image elements not found.");
  }

  const answerInput = document.getElementById("answer");
  const feedbackElement = document.getElementById("feedback");
  const correctAnswerElement = document.getElementById("correct-answer");
  const questionNumber = document.getElementById("question-number");

  if (
    answerInput &&
    feedbackElement &&
    correctAnswerElement &&
    questionNumber
  ) {
    answerInput.value = "";
    feedbackElement.classList.add("hidden");
    correctAnswerElement.classList.add("hidden");
    questionNumber.innerText = `Question ${currentQuestionIndex + 1} of ${
      questions.length
    }`;
  } else {
    console.log("Some elements are missing.");
  }
}

function submitAnswer() {
  const answer = document.getElementById("answer").value.trim();
  const correctAnswer = questions[currentQuestionIndex].answer;

  const feedbackElement = document.getElementById("feedback");
  const correctAnswerElement = document.getElementById("correct-answer");

  // Clear previous feedback and correct answer
  feedbackElement.classList.remove("correct", "wrong");
  feedbackElement.innerText = "";
  feedbackElement.style.display = "none"; // Hide feedback initially

  correctAnswerElement.classList.add("hidden");
  correctAnswerElement.innerText = "";

  if (answer === correctAnswer) {
    score++;
    feedbackElement.innerText = "Correct!";
    feedbackElement.classList.add("correct");
    feedbackElement.style.display = "block"; // Show feedback for correct answer
  } else {
    feedbackElement.innerText = `Wrong! The correct answer was: ${correctAnswer}`;
    feedbackElement.classList.add("wrong");
    feedbackElement.style.display = "block"; // Show feedback for wrong answer
    correctAnswerElement.innerText = `Correct Answer: ${correctAnswer}`;
    correctAnswerElement.classList.add("hidden"); // Hide correct answer element
  }

  currentQuestionIndex++;

  // Hide feedback and correct answer before loading the next question
  setTimeout(() => {
    feedbackElement.style.display = "none"; // Ensure feedback is hidden
    correctAnswerElement.classList.add("hidden"); // Ensure correct answer is hidden
    loadQuestion();
  }, 1000); // Load next question after 2 seconds
}

function endGame() {
  clearInterval(timerInterval);
  const timeTaken = Math.floor((Date.now() - startTime) / 1000);

  // Save to Firebase
  saveToLeaderboard(username, score, timeTaken);

  document.getElementById("quiz-section").classList.add("hidden");
  document.getElementById("end-section").classList.remove("hidden");
  document.getElementById("final-score").innerText = `Score: ${score}`;
  document.getElementById("final-time").innerText = `Time Taken: ${timeTaken}s`;
}

function saveToLeaderboard(username, score, timeTaken) {
  if (!username || score === undefined || timeTaken === undefined) return;
  addDoc(collection(db, "leaderboard"), {
    username: username,
    score: score,
    timeTaken: timeTaken,
    timestamp: serverTimestamp(),
  }).catch((error) => {
    console.error("Error adding document: ", error);
  });
}

function loadLeaderboard() {
  try {
    const q = query(
      collection(db, "leaderboard"),
      orderBy("score", "desc"),
      orderBy("timeTaken"),
      limit(10)
    );

    onSnapshot(
      q,
      (querySnapshot) => {
        const leaderboardList = document.getElementById("leaderboard-list");
        leaderboardList.innerHTML = "";
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          const li = document.createElement("li");
          li.textContent = `${data.username}: ${data.score} points, ${
            data.timeTaken || "N/A"
          }s`;
          leaderboardList.appendChild(li);
        });
      },
      (error) => {
        console.error("Error loading leaderboard: ", error);
      }
    );
  } catch (error) {
    console.error("Error during query execution: ", error);
  }
}

// Call loadLeaderboard to set up real-time listener on page load
loadLeaderboard();

function reloadPage() {
  location.reload();
}
