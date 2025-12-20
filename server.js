const jsonServer = require('json-server');
const path = require('path');
const server = jsonServer.create();
const router = jsonServer.router('db.json');
const middlewares = jsonServer.defaults({ static: './' });

const PORT = process.env.PORT || 3000;

// Middleware
server.use(middlewares);
server.use(jsonServer.bodyParser);

// Access the lowdb database instance
const db = router.db;

// Initialize Default Admin
function initializeDefaultAdmin() {
  const defaultAdminEmail = 'sureshadabala0836@gmail.com';
  const existing = db.get('users').find({ email: defaultAdminEmail }).value();

  if (!existing) {
    const users = db.get('users').value();
    const newId = users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1;

    db.get('users')
      .push({
        id: newId,
        username: 'Default Admin',
        email: defaultAdminEmail,
        password: 'Suresh@23',
        role: 'admin',
        created_at: new Date().toISOString()
      })
      .write();
    console.log('✅ Default Admin created: sureshadabala0836@gmail.com');
  } else {
    console.log('ℹ️ Default Admin already exists');
  }
}

initializeDefaultAdmin();

// Custom Auth Routes

// POST /login
server.post('/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password required" });
  }

  const user = db.get('users').find({ email: email, password: password }).value();

  if (user) {
    res.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        role: user.role
      }
    });
  } else {
    res.status(401).json({ message: "Invalid credentials" });
  }
});

// POST /signup (Public)
server.post('/signup', (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }

  const existing = db.get('users').find(u => u.username === username || u.email === email).value();
  if (existing) {
    return res.status(409).json({ message: "Username or Email already exists" });
  }

  const users = db.get('users').value();
  const newId = users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1;

  const newUser = {
    id: newId,
    username,
    email,
    password,
    role: 'user',
    created_at: new Date().toISOString()
  };

  db.get('users').push(newUser).write();

  res.status(201).json({ success: true, message: "User registered successfully" });
});

// POST /admin/create (Admin Create Account)
server.post('/admin/create', (req, res) => {
  const { username, email, password, role } = req.body;

  if (!username || !email || !password || !role) {
    return res.status(400).json({ message: "All fields are required" });
  }

  const existing = db.get('users').find(u => u.username === username || u.email === email).value();
  if (existing) {
    return res.status(409).json({ message: "Username or Email already exists" });
  }

  const users = db.get('users').value();
  const newId = users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1;

  const newAccount = {
    id: newId,
    username,
    email,
    password,
    role: role, // 'admin' or 'user'
    created_at: new Date().toISOString()
  };

  db.get('users').push(newAccount).write();

  res.status(201).json({ success: true, message: `New ${role} created successfully` });
});

// GET /users (Custom List)
server.get('/users', (req, res) => {
  // Return only public info
  const users = db.get('users').value().map(u => ({
    id: u.id,
    username: u.username,
    email: u.email,
    role: u.role
  }));
  res.json(users);
});

// DELETE /users/:id
server.delete('/users/:id', (req, res) => {
  const id = parseInt(req.params.id);
  db.get('users').remove({ id: id }).write();
  res.json({ success: true, message: "User deleted successfully" });
});

// PATCH /users/:id
server.patch('/users/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const updates = req.body;

  // Find user
  const user = db.get('users').find({ id: id }).value();

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  // Update user
  db.get('users').find({ id: id }).assign(updates).write();

  res.json({ success: true, message: "User updated successfully" });
});

// Mount JSON Server Router for other capabilities (e.g. /data)
server.use(router);

server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Local Auth & Data API (db.json) is active. No MySQL required.`);
});
