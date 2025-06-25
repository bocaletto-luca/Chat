# Chat-JS

Chat-JS is a self-contained real-time chat web application built with Node.js, Express, and Socket.IO. It features user registration and login with persistent sessions, a real-time chat interface with persistent message history stored in JSON files, a global notification bell, and a "Clear Chat" button to reset the conversation. The app is designed for easy deployment on a local network using a friendly domain name.

[![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=flat-square&logo=html5&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/Guide/HTML/HTML5)
[![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=flat-square&logo=css3&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/CSS)
[![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat-square&logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![License: GPLv3](https://img.shields.io/badge/License-GPLv3-blue?style=flat-square)](LICENSE)
[![Open Source](https://img.shields.io/badge/Open%20Source-Yes-brightgreen?style=flat-square)]()
[![Responsive](https://img.shields.io/badge/Responsive-Yes-blue?style=flat-square)]()
[![Multi-Platform](https://img.shields.io/badge/Multi--Platform-Yes-blueviolet?style=flat-square)]()
[![Web App](https://img.shields.io/badge/Web%20App-Yes-orange?style=flat-square)]()

[![Test Online](https://img.shields.io/badge/Test%20Online-Demo-brightgreen)](https://bocaletto-luca.github.io/Chat/public/index.html)


---

## Table of Contents

- [Features](#features)
- [Project Structure](#project-structure)
- [Installation](#installation)
- [Configuration](#configuration)
  - [Server Configuration](#server-configuration)
- [Running the Application](#running-the-application)
- [Usage](#usage)
- [Contributing](#contributing)
- [License](#license)
- [Acknowledgments](#acknowledgments)

---

## Features

- **User Registration & Login**  
  Users register and log in via RESTful API endpoints. Sessions are managed with `express-session`, keeping users logged in until they explicitly log out.

- **Real-time Communication**  
  Messages are exchanged in real time using Socket.IO. All messages are stored in `messages.json`, ensuring that the chat history is persistent.

- **Persistent Message History**  
  When a user logs in, the chat history is retrieved from `messages.json` so previous messages remain visible.

- **Global Notification Bell**  
  The "Bell" button triggers an audible notification on all connected clients.

- **Clear Chat Functionality**  
  A dedicated "Clear Chat" button allows authorized users to remove all current messages, effectively resetting the conversation.

---

## Project Structure

The project is organized as follows:

    Chat-JS/
    ├── node_modules/             # Installed npm modules
    ├── public/                   # Front-end static files
    │   ├── index.html            # Main HTML page
    │   ├── chat-online.css       # Custom CSS styling
    │   └── chat-online.js        # Client-side JavaScript logic
    ├── server.js                 # Back-end server (Express, Socket.IO, session management)
    ├── user-save.json            # JSON file storing registered users (auto-generated)
    ├── messages.json             # JSON file storing chat messages (auto-generated)
    └── README.md                 # This file

---

## Installation

### Prerequisites

- **Node.js** (v12 or later recommended)
- **npm**

### Cloning the Repository

To clone the repository, open your terminal and execute the following commands:

    git clone https://github.com/bocaletto-luca/Chat-JS.git
    cd Chat-JS

### Installing Dependencies

Install the required npm modules by running:

    npm install

---

## Running the Application

### Starting the Server

From the project root directory, start the server by running:

    node server.js

You should see the following output in your terminal:

    Server is running on port 3000

### Accessing the Application

- **On the Host Machine:**  
  Open your web browser and navigate to:

    http://localhost:3000

## Usage

1. **Register & Login:**  
   Use the tabs on the homepage to register a new account or log in. Session data persists across page refreshes until logout.

2. **Real-time Chat:**  
   Once logged in, messages are exchanged in real time. All messages are stored in `messages.json` for persistence.

3. **Global Notification (Bell):**  
   Click the "Bell" button to trigger an audible notification on all connected clients.

4. **Clear Chat:**  
   Click the "Clear Chat" button to clear the chat history. This action empties the `messages.json` file and notifies all clients to reset the conversation.

---

## Contributing

Contributions, bug reports, and feature requests are welcome! To contribute:

1. Fork the repository.
2. Create a new branch for your feature (for example, run:  
   
       git checkout -b feature/my-feature
       
3. Commit your changes.
4. Push your branch and open a pull request with a detailed description of your modifications.

---

## License

This project is licensed under the GPL v3. See the LICENSE file for details.

---

## Acknowledgments

- **Express** – Fast, unopinionated web framework for Node.js.
- **Socket.IO** – Real-time bidirectional event-based communication library.
- **Bootstrap** – Front-end framework for building responsive, mobile-first websites.
