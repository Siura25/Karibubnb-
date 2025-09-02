<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Host Registration</title>
  <link rel="stylesheet" href="style.css">
  <script src="https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js"></script>
  <script src="https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js"></script>
  <script src="https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js"></script>
  <script src="app.js" defer></script>
</head>
<body>
  <h1>Host Registration</h1>
  <form id="registerForm">
    <input type="email" id="email" placeholder="Email" required>
    <input type="password" id="password" placeholder="Password" required>
    <button type="submit">Register</button>
  </form>
</body>
</html>
