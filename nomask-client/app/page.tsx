"use client";
const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
import { useEffect, useState } from "react";

type Post = {
  id: number;
  nickname: string;
  content: string;
  parentId: number | null;
};

export default function Home() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [text, setText] = useState("");
  const [replyTo, setReplyTo] = useState<number | null>(null);
  const [nickname, setNickname] = useState("");

  useEffect(() => {
    let nick = localStorage.getItem("nomask_nick");
    if (!nick) {
      nick = "ghost_" + Math.floor(Math.random() * 9999);
      localStorage.setItem("nomask_nick", nick);
    }
    setNickname(nick);
    loadFeed();
  }, []);

  function loadFeed() {
    fetch(`${API}/feed`)
      .then(r => r.json())
      .then(setPosts);
  }

  function sendPost() {
    if (!text.trim()) return;

    fetch(`${API}/post`, { ... })
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        content: text,
        nickname,
        parentId: replyTo
      })
    }).then(() => {
      setText("");
      setReplyTo(null);
      loadFeed();
    });
  }

  const roots = posts.filter(p => p.parentId === null);
  const replies = (id: number) => posts.filter(p => p.parentId === id);

  return (
    <main style={{ background: "#0f0f0f", minHeight: "100vh", color: "#fff", padding: 20 }}>
      <h1 style={{ fontSize: 32 }}>NoMask</h1>
      <p style={{ opacity: 0.6, marginBottom: 20 }}>
        Ты пишешь как @{nickname}
      </p>

      <textarea
        value={text}
        onChange={e => setText(e.target.value)}
        placeholder={replyTo ? "Ответ..." : "Напиши что угодно..."}
        style={{
          width: "100%",
          height: 80,
          background: "#1a1a1a",
          color: "#fff",
          border: "1px solid #333",
          padding: 10,
          marginBottom: 10
        }}
      />

      <button
        onClick={sendPost}
        style={{
          padding: "8px 16px",
          background: "#fff",
          color: "#000",
          border: "none",
          cursor: "pointer",
          marginBottom: 30
        }}
      >
        {replyTo ? "Ответить" : "Опубликовать"}
      </button>

      {roots.map(post => (
        <div key={post.id} style={{ marginBottom: 20, borderBottom: "1px solid #222" }}>
          <div style={{ opacity: 0.6 }}>@{post.nickname}</div>
          <div style={{ fontSize: 18 }}>{post.content}</div>

          <div style={{ display: "flex", gap: 12, marginTop: 6 }}>
            <span
              onClick={() => setReplyTo(post.id)}
              style={{ fontSize: 12, cursor: "pointer", opacity: 0.6 }}
            >
              Ответить
            </span>

            <span
              onClick={() => {
                fetch(`${API}/report`, { ... })
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ postId: post.id, reason: "abuse" })
                });
                alert("Жалоба отправлена");
              }}
              style={{ fontSize: 12, cursor: "pointer", opacity: 0.5 }}
            >
              Пожаловаться
            </span>
          </div>

          {replies(post.id).map(r => (
            <div
              key={r.id}
              style={{
                marginLeft: 20,
                marginTop: 10,
                paddingLeft: 10,
                borderLeft: "2px solid #333"
              }}
            >
              <div style={{ opacity: 0.6 }}>@{r.nickname}</div>
              <div>{r.content}</div>
            </div>
          ))}
        </div>
      ))}
    </main>
  );
}
