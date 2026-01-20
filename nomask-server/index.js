const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

let posts = [];
let postCounter = {};
let reports = [];

// ===== FEED =====
app.get("/feed", (req, res) => {
  res.json(posts.filter(p => !p.hidden));
});

// ===== CREATE POST / REPLY =====
app.post("/post", (req, res) => {
  const ip = req.ip;
  const now = Date.now();

  if (!postCounter[ip]) postCounter[ip] = [];
  postCounter[ip] = postCounter[ip].filter(
    t => now - t < 24 * 60 * 60 * 1000
  );

  if (postCounter[ip].length >= 3) {
    return res.status(429).json({ error: "Лимит 3 поста в сутки" });
  }

  const { content, nickname, parentId } = req.body;
  if (!content) return res.sendStatus(400);

  posts.unshift({
    id: Date.now(),
    nickname,
    content,
    parentId: parentId || null,
    createdAt: now,
    hidden: false
  });

  postCounter[ip].push(now);
  res.json({ ok: true });
});

// ===== REPORT =====
app.post("/report", (req, res) => {
  const { postId, reason } = req.body;
  if (!postId) return res.sendStatus(400);

  reports.push({
    id: Date.now(),
    postId,
    reason: reason || "other",
    createdAt: Date.now()
  });

  res.json({ ok: true });
});

// ===== ADMIN =====
app.get("/admin/reports", (req, res) => {
  res.json(
    reports.map(r => ({
      ...r,
      post: posts.find(p => p.id === r.postId)
    }))
  );
});

app.post("/admin/action", (req, res) => {
  const { postId, action } = req.body;

  if (action === "delete") {
    posts = posts.filter(p => p.id !== postId);
  }

  if (action === "hide") {
    const post = posts.find(p => p.id === postId);
    if (post) post.hidden = true;
  }

  res.json({ ok: true });
});

// ===== START =====
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log("NoMask backend running on port " + PORT);
});

