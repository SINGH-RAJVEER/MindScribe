# Welcome to MindScribe AI Companion

MindScribe is your friendly AI-assisted chat companion dedicated to mental well-being. Whether you're having a tough day or simply need a reminder that you're not alone, MindScribe is here to listen and support you.

## Features

- **Instant Support:** Get quick responses with warm and empathetic advice.
- **Personalized Conversations:** Enjoy discussions tailored to your feelings and needs.
- **24/7 Availability:** Reach out any time. MindScribe is always ready to help.
- **Secure & Confidential:** Your privacy is paramount. All conversations are local and therefore private and secure.

## How It Works

1. **Simple Setup:** Install MindScribe in minutes with our easy-to-follow guide.
2. **Engage in Conversation:** Just start chatting with the bot and share your thoughts.
3. **Receive Guidance:** Benefit from advice and mindfulness techniques curated for mental well-being.

## Installation

To get started with MindScribe, simply clone the repository and follow the instructions below:

1. **Clone the repository:**
```bash
git clone https://github.com/SINGH-RAJVEER/MindScribe.git
cd MindScribe
```

2. **Install dependencies and start servers:**

   - **In one terminal, start the backend:**
     ```bash
     cd backend
     npm install
     npm run dev
     ```
     > Leave this terminal running.

   - **In a new terminal, start the frontend:**
     ```bash
     cd MindScribe/frontend
     npm install
     npm start
     ```

3. **Install and run Ollama with a model (e.g., llama3):**

   - **Download and install Ollama:**  
     Follow the instructions for your OS from the [Ollama website](https://ollama.com/download).

   - **Start the Ollama server and pull a model (e.g., llama3):**
     ```bash
     # Start Ollama (if not already running)
     ollama serve

     # In a new terminal, pull the llama3 model
     ollama pull llama3
     ```

Open the port shown in your terminal to view the app.

## Usage

When you run the application, you'll be greeted by a warm, inviting chat interface. Simply type your thoughts to initiate the discussion.

## Contributing

MindScribe is an open-source project built with a modern tech stack:

- **Node.js** and **Express** for the backend server
- **React** with **Tailwind CSS** for a fast, responsive, and modern frontend user interface
- **SQLite3** as the lightweight database
- **Ollama** for AI model integration
- **Authentication** is implemented using **bcrypt** for password hashing, **JWT** for token-based authentication, and **express-validator** for input validation

We believe in the power of community and warmly welcome contributions from developers of all backgrounds. Every contribution helps us enhance our compassionate support system and make a positive impact together.

## License

MindScribe is open-source under the [MIT License](LICENSE).

## A Message from Our Team

Stay positive, and remember—you're never alone.
