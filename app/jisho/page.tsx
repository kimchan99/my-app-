/* eslint-disable @typescript-eslint/no-explicit-any, react-hooks/set-state-in-effect -- 旧「存在しない言葉辞典」ページ。/jisho に移設したのみで挙動は変えていない */
'use client';
import { useState, useEffect } from "react";

export default function Home() {
  const [input, setInput] = useState("");
  const [status, setStatus] = useState("idle");
  const [result, setResult] = useState<any>(null);
  const [myWords, setMyWords] = useState<any[]>([]);
  const [sharedWords, setSharedWords] = useState<any[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem("moji-shared");
    if (saved) setSharedWords(JSON.parse(saved));
  }, []);

  const search = async () => {
    const word = input.trim();
    if (!word) return;
    setStatus("loading");
    setResult(null);
    try {
      const res = await fetch("/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ word }),
      });
      const data = await res.json();
      if (data.status === "reject") {
        setStatus("rejected");
        setResult(data);
      } else {
        setStatus("result");
        setResult(data);
        setMyWords(prev => {
          if (prev.find(w => w.word === data.word)) return prev;
          return [data, ...prev].slice(0, 30);
        });
        setSharedWords(prev => {
          const next = prev.find(w => w.word === data.word) ? prev : [data, ...prev].slice(0, 100);
          localStorage.setItem("moji-shared", JSON.stringify(next));
          return next;
        });
      }
    } catch {
      setStatus("error");
    }
  };

  return (
    <main style={{ fontFamily: "'Noto Serif JP', serif", background: "#0a0a0a", minHeight: "100vh", color: "#e8e0d0", padding: "60px 24px" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Noto+Serif+JP:wght@300;400&display=swap'); * { box-sizing: border-box; }`}</style>
      <div style={{ maxWidth: 640, margin: "0 auto" }}>
        <p style={{ textAlign: "center", fontSize: 11, letterSpacing: "0.3em", color: "#b8960c", marginBottom: 20 }}>DICTIONARY OF NONEXISTENT WORDS</p>
        <h1 style={{ textAlign: "center", fontSize: "clamp(24px,5vw,40px)", fontWeight: 300, letterSpacing: "0.1em", marginBottom: 10 }}>存在しない言葉辞典</h1>
        <p style={{ textAlign: "center", fontSize: 13, color: "#666", letterSpacing: "0.15em", marginBottom: 40 }}>存在しない言葉だけを受け付ける辞書。</p>
        <div style={{ width: 1, height: 32, background: "linear-gradient(to bottom, transparent, #b8960c, transparent)", margin: "0 auto 36px" }} />

        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && search()}
          placeholder="存在しない言葉を入力"
          style={{ width: "100%", background: "transparent", border: "none", borderBottom: "1px solid #333", color: "#e8e0d0", fontFamily: "inherit", fontSize: 22, fontWeight: 300, padding: "12px 0", outline: "none", letterSpacing: "0.08em" }}
        />
        <button
          onClick={search}
          disabled={status === "loading" || !input.trim()}
          style={{ width: "100%", marginTop: 14, background: "transparent", border: "1px solid #333", color: "#888", fontFamily: "inherit", fontSize: 12, letterSpacing: "0.3em", padding: 12, cursor: "pointer" }}
        >調 べ る</button>

        <div style={{ marginTop: 36, minHeight: 80 }}>
          {status === "loading" && <p style={{ textAlign: "center", color: "#444", fontSize: 12, letterSpacing: "0.3em" }}>照合中 . . .</p>}
          {status === "rejected" && result && (
            <div style={{ textAlign: "center", paddingTop: 32, borderTop: "1px solid #1a1a1a" }}>
              <p style={{ fontSize: 24, fontWeight: 300, color: "#555", textDecoration: "line-through", marginBottom: 12 }}>「{result.word}」</p>
              <p style={{ fontSize: 13, color: "#444", lineHeight: 2 }}>この辞典には掲載しておりません。<br />「{result.word}」はすでに存在する言葉です。</p>
            </div>
          )}
          {status === "result" && result && (
            <div style={{ borderTop: "1px solid #1e1a14", paddingTop: 32 }}>
              <p style={{ fontSize: "clamp(28px,5vw,44px)", fontWeight: 300, letterSpacing: "0.1em", marginBottom: 6 }}>{result.word}</p>
              <p style={{ fontSize: 12, color: "#b8960c", letterSpacing: "0.2em", marginBottom: 28 }}>{result.reading}</p>
              <p style={{ fontSize: 10, letterSpacing: "0.4em", color: "#555", marginBottom: 8 }}>用法</p>
              <p style={{ fontSize: 14, lineHeight: 2, color: "#c8c0b0", marginBottom: 24 }}>{result.usage}</p>
              <p style={{ fontSize: 10, letterSpacing: "0.4em", color: "#555", marginBottom: 8 }}>意味</p>
              <p style={{ fontSize: 14, lineHeight: 2, color: "#c8c0b0", marginBottom: 24 }}>{result.meaning}</p>
              <p style={{ fontSize: 10, letterSpacing: "0.4em", color: "#555", marginBottom: 8 }}>用例</p>
              <p style={{ fontSize: 13, lineHeight: 2, color: "#888", borderLeft: "1px solid #2a2a2a", paddingLeft: 16 }}>{result.example}</p>
            </div>
          )}
          {status === "error" && <p style={{ textAlign: "center", color: "#554", fontSize: 13 }}>うまく照合できませんでした。もう一度お試しください。</p>}
        </div>

        {myWords.length > 0 && (
          <div style={{ marginTop: 48, borderTop: "1px solid #111", paddingTop: 28 }}>
            <p style={{ fontSize: 10, letterSpacing: "0.4em", color: "#333", marginBottom: 16 }}>あなたが発明した言葉</p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
              {myWords.map((w, i) => (
                <span key={i} onClick={() => { setInput(w.word); setResult(w); setStatus("result"); }} style={{ fontSize: 13, color: "#444", cursor: "pointer", letterSpacing: "0.08em" }}>{w.word}</span>
              ))}
            </div>
          </div>
        )}

        {sharedWords.length > 0 && (
          <div style={{ marginTop: 48, borderTop: "1px solid #111", paddingTop: 28 }}>
            <p style={{ fontSize: 10, letterSpacing: "0.4em", color: "#333", marginBottom: 16 }}>みんなが発明した言葉</p>
            <div>
              {sharedWords.map((w, i) => (
                <div key={i} onClick={() => { setInput(w.word); setResult(w); setStatus("result"); }} style={{ padding: "14px 0", borderBottom: "1px solid #111", cursor: "pointer" }}>
                  <p style={{ fontSize: 17, fontWeight: 300, letterSpacing: "0.1em", marginBottom: 4 }}>{w.word}</p>
                  <p style={{ fontSize: 11, color: "#b8960c", letterSpacing: "0.2em", marginBottom: 6 }}>{w.reading}</p>
                  <p style={{ fontSize: 13, color: "#555", lineHeight: 1.7, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>{w.meaning}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}