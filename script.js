/* DOM elements */
const chatForm = document.getElementById("chatForm");
const userInput = document.getElementById("userInput");
const chatWindow = document.getElementById("chatWindow");

// Set initial message
chatWindow.innerHTML =
  "<div class='message bot'><p>👋 Hello! How can I help you today?</p></div>";

// Cloudflare Worker endpoint
const API_URL = "https://lorealchatbot.gkiratg7.workers.dev/";

// System prompt for the chatbot
const systemPrompt =
  "You are a chatbot that only answers questions related to L’Oréal products, routines, and recommendations. Provide concise and accurate responses. Provide answers in plain text without any formatting.";

// Conversation history
let conversationHistory = [{ role: "system", content: systemPrompt }];

/* Handle form submit */
chatForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  // Get user input
  const userMessage = userInput.value.trim();
  if (!userMessage) return;

  // Display user message
  chatWindow.innerHTML += `<div class='message user'><p>${userMessage}</p></div>`;
  userInput.value = "";

  // Add user message to conversation history
  conversationHistory.push({ role: "user", content: userMessage });

  // Show loading message
  const loadingMessage = document.createElement("div");
  loadingMessage.className = "message bot";
  loadingMessage.innerHTML = "<p>🤔 Thinking...</p>";
  chatWindow.appendChild(loadingMessage);

  try {
    // Send request to Cloudflare Worker
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ messages: conversationHistory }),
    });

    const data = await response.json();

    // Display chatbot response
    const botMessage = data.choices[0].message.content;
    loadingMessage.remove();
    chatWindow.innerHTML += `<div class='message bot'><p>${botMessage}</p></div>`;

    // Add bot message to conversation history
    conversationHistory.push({ role: "assistant", content: botMessage });
  } catch (error) {
    // Handle errors
    loadingMessage.remove();
    chatWindow.innerHTML +=
      "<div class='message bot'><p>⚠️ Sorry, something went wrong. Please try again later.</p></div>";
    console.error("Error fetching Cloudflare Worker response:", error);
  }

  // Scroll to the bottom of the chat window
  chatWindow.scrollTop = chatWindow.scrollHeight;
});
