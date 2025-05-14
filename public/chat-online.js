document.addEventListener("DOMContentLoaded", function () {
  // Stabilisce la connessione con Socket.io
  const socket = io();

  // Elementi per l'autenticazione
  const registrationForm = document.getElementById("registrationForm");
  const regUsername = document.getElementById("regUsername");
  const regPassword = document.getElementById("regPassword");
  const regMsg = document.getElementById("regMsg");

  const loginForm = document.getElementById("loginForm");
  const loginUsername = document.getElementById("loginUsername");
  const loginPassword = document.getElementById("loginPassword");
  const loginMsg = document.getElementById("loginMsg");

  // Elementi per nascondere le tab di autenticazione e mostrare la chat
  const authTabs = document.getElementById("authTabs");
  const authTabsContent = document.getElementById("authTabsContent");

  // Elementi per la sezione chat
  const chatSection = document.getElementById("chatSection");
  const currentUsernameDisplay = document.getElementById("currentUsername");
  const chatMessages = document.getElementById("chatMessages");
  const chatForm = document.getElementById("chatForm");
  const messageInput = document.getElementById("messageInput");
  const messageColor = document.getElementById("messageColor");
  const bellButton = document.getElementById("bellButton");
  const onlineUsersList = document.getElementById("onlineUsers");
  const logoutButton = document.getElementById("logoutButton");
  const clearChatButton = document.getElementById("clearChatButton");

  // Variabile per memorizzare l'utente loggato
  let currentUser = null;

  // Controlla la sessione al caricamento della pagina
  fetch('/session')
    .then(res => res.json())
    .then(data => {
      if (data.loggedIn) {
        currentUser = data.username;
        currentUsernameDisplay.innerText = data.username;
        authTabs.classList.add("d-none");
        authTabsContent.classList.add("d-none");
        chatSection.classList.remove("d-none");
        socket.emit("userLogin", { username: currentUser, time: new Date().toISOString() });
        loadChatHistory();
      }
    })
    .catch(err => console.error("Session check error:", err));

  // ============================================================
  // Funzione per caricare la cronologia dei messaggi (persistenti)
  function loadChatHistory() {
    fetch('/messages')
      .then(res => res.json())
      .then(data => {
         if (data.success && data.messages) {
             chatMessages.innerHTML = "";
             // Aggiunge ogni messaggio (l'ordine verrà gestito dal CSS con flex-direction: column-reverse)
             data.messages.forEach((msg) => {
                addChatMessage(msg);
             });
         }
      })
      .catch(err => console.error("Error loading messages:", err));
  }

  // ============================================================
  // Gestione della Registrazione
  // ============================================================
  if (registrationForm) {
    registrationForm.addEventListener("submit", function (e) {
      e.preventDefault();
      const username = regUsername.value.trim();
      const password = regPassword.value.trim();
      if (!username || !password) {
        regMsg.innerText = "Please fill in all fields.";
        return;
      }
      fetch("/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
      })
      .then((response) => response.json())
      .then((data) => {
        regMsg.innerText = data.message;
      })
      .catch((err) => {
        console.error("Registration Error:", err);
        regMsg.innerText = "Registration failed.";
      });
    });
  }

  // ============================================================
  // Gestione del Login
  // ============================================================
  if (loginForm) {
    loginForm.addEventListener("submit", function (e) {
      e.preventDefault();
      const username = loginUsername.value.trim();
      const password = loginPassword.value.trim();
      if (!username || !password) {
        loginMsg.innerText = "Please fill in all fields.";
        return;
      }
      fetch("/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
      })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          currentUser = username;
          currentUsernameDisplay.innerText = username;
          loginMsg.innerText = "Login successful!";
          authTabs.classList.add("d-none");
          authTabsContent.classList.add("d-none");
          chatSection.classList.remove("d-none");
          socket.emit("userLogin", { username: currentUser, time: new Date().toISOString() });
          loadChatHistory();
        } else {
          loginMsg.innerText = data.message;
        }
      })
      .catch((err) => {
        console.error("Login Error:", err);
        loginMsg.innerText = "Login failed.";
      });
    });
  }

  // ============================================================
  // Gestione del Logout
  // ============================================================
  if (logoutButton) {
    logoutButton.addEventListener("click", function () {
      fetch('/logout', { method: 'POST' })
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            currentUser = null;
            authTabs.classList.remove("d-none");
            authTabsContent.classList.remove("d-none");
            chatSection.classList.add("d-none");
            window.location.reload();
          }
        })
        .catch(err => {
          console.error("Logout error:", err);
        });
    });
  }

  // ============================================================
  // Gestione del Pulsante "Clear Chat"
  // ============================================================
  if (clearChatButton) {
    clearChatButton.addEventListener("click", function () {
      fetch('/clearMessages', { method: 'POST' })
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            chatMessages.innerHTML = "";
          }
        })
        .catch(err => console.error("Clear chat error:", err));
    });
  }

  // ============================================================
  // Invio dei Messaggi in Chat
  // ============================================================
  if (chatForm) {
    chatForm.addEventListener("submit", function (e) {
      e.preventDefault();
      const message = messageInput.value.trim();
      if (!message || !currentUser) return;
      const color = messageColor.value;
      const timeStamp = new Date().toISOString();
      const messageData = { username: currentUser, message, color, time: timeStamp };
      socket.emit("newMessage", messageData);
      messageInput.value = "";
    });
  }

  // ============================================================
  // Gestione del Pulsante "Bell"
  // ============================================================
  if (bellButton) {
    bellButton.addEventListener("click", function () {
      socket.emit("bell");
    });
  }

  // ============================================================
  // Gestione degli Eventi Socket
  // ============================================================
  socket.on("broadcastMessage", function (data) {
    addChatMessage(data);
    playMessageSound();
  });

  socket.on("updateOnlineUsers", function (users) {
    updateOnlineUsers(users);
  });

  socket.on("ringBell", function () {
    playBellSound();
    animateBell();
  });

  // Evento per la cancellazione della chat (clear chat)
  socket.on("clearChat", function () {
    chatMessages.innerHTML = "";
  });

  // ============================================================
  // Funzioni Helper
  // ============================================================
  function addChatMessage(data) {
    const msgDiv = document.createElement("div");
    msgDiv.className = "chat-message";
    msgDiv.innerHTML = `<strong style="color:${data.color}">${data.username}</strong>: ${data.message} 
                         <small class="text-muted">${new Date(data.time).toLocaleString()}</small>`;
    chatMessages.insertBefore(msgDiv, chatMessages.firstChild);
  }

  function updateOnlineUsers(users) {
    onlineUsersList.innerHTML = "";
    users.forEach((user) => {
      const li = document.createElement("li");
      li.className = "list-group-item";
      li.innerText = `${user.username} (since ${new Date(user.time).toLocaleTimeString()})`;
      onlineUsersList.appendChild(li);
    });
  }

  function playMessageSound() {
    // Suono per il nuovo messaggio (puoi cambiarne la URL se vuoi un suono diverso)
    const audio = new Audio("https://www.soundjay.com/button/beep-07.wav");
    audio.play();
  }

  function playBellSound() {
    // Suono aggiornato per il campanello
    const audio = new Audio("https://www.soundjay.com/misc/sounds/bell-ringing-05.mp3");
    audio.play();
  }

  function animateBell() {
    bellButton.classList.add("bell-active");
    setTimeout(() => {
      bellButton.classList.remove("bell-active");
    }, 3000);
  }
});
