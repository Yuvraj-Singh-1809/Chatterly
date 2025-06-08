# 💬 Chatterly

**Chatterly** is a real-time web chat application built using **React**, **Node.js**, **Express**, **WebSocket**, and **MongoDB**. It allows users to register, log in, and engage in live text and file-based messaging with other users.

---

## 🚀 Features

- ✅ Real-time messaging via WebSocket
- ✅ User authentication (register/login)
- ✅ Message persistence using MongoDB
- ✅ Live online status
- ✅ File attachments (images, documents, etc.)
- ✅ Responsive UI

---

## 🔧 Tech Stack

**Frontend**  
- React + Vite  
- Axios  
- WebSocket (native) 
- Tailwind CSS 

**Backend**  
- Node.js + Express  
- MongoDB + Mongoose  
- WebSocket (ws)  
- JWT + Cookies for Auth
---


## 📸 Screenshots

### 💬 Chat Interface (User 1)
![Chatterly - User 1](./public/Screenshot%202025-06-08%20232616.png)

### 💬 Chat Interface (User 2)
![Chatterly - User 2](./public/Screenshot%202025-06-08%20232628.png)

---

## 🗂️ Project Structure
```
Chatterly
├── Api
│   ├── models
│   │   ├── message.js
│   │   └── user.js
│   ├── node_modules
│   ├── uploads
│   │   └── uploads1749303918292.png
│   ├── .env
│   ├── index.js
│   ├── package.json
│   └── package-lock.json
│
├── Client
│   ├── node_modules
│   ├── public
│   │   ├── Chat icon.svg
│   │   └── vite.svg
│   ├── src
│   │   ├── assets
│   │   ├── App.jsx
│   │   ├── Avatar.jsx
│   │   ├── Chat.jsx
│   │   ├── Contacts.jsx
│   │   ├── Logo.jsx
│   │   ├── RegisterAndLoginForm.jsx
│   │   ├── Routes.jsx
│   │   ├── UserContext.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   ├── .gitignore
│   ├── eslint.config.js
│   ├── index.html
│   ├── package.json
│   ├── package-lock.json
│   ├── vite.config.js
│   └── README.md

```
## ⚙️ Installation

### 1. Backend Setup (API)

```bash
cd Api
npm install
npm start
```
### 2. Frontend Setup (CLIENT)

```bash
cd client
npm install
npm run dev