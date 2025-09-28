/* Floating Chatbot — Bypass CORS dengan Proxy */
// Ganti URL n8n kamu di sini (tanpa https://)
const N8N_URL =
  "uncharming-winona-dandiacally.ngrok-free.app/webhook-test/chat";
// Menggunakan cors-anywhere proxy
const WEBHOOK_URL = `https://cors-anywhere.herokuapp.com/https://${N8N_URL}`;

(function () {
  const qs = (s, c = document) => c.querySelector(s);
  const ce = (t, p = {}) => Object.assign(document.createElement(t), p);

  // session id untuk memory
  const sidKey = "pk_chat_sid";
  let sid = localStorage.getItem(sidKey);
  if (!sid) {
    sid =
      (crypto.randomUUID && crypto.randomUUID()) ||
      Date.now() + Math.random().toString(16).slice(2);
    localStorage.setItem(sidKey, sid);
  }

  // DOM
  const root = ce("div", { className: "pkcb", id: "pkcb-root" });
  const toggle = ce("button", {
    className: "pkcb-btn",
    id: "pkcb-open",
    title: "Chat",
  });
  toggle.innerHTML = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M4 5h16v10H7l-3 3V5z" stroke="#fff" stroke-width="2" stroke-linejoin="round"/></svg>`;
  const panel = ce("div", {
    className: "pkcb-panel",
    id: "pkcb-panel",
    role: "dialog",
    "aria-label": "Chatbot",
  });

  const header = ce("div", { className: "pkcb-header" });
  header.innerHTML = `
    <div class="pkcb-title">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="9" stroke="#ff8d4f" stroke-width="2"/>
        <path d="M8 12h8M8 9h8M8 15h5" stroke="#ff8d4f" stroke-width="2" stroke-linecap="round"/>
      </svg>
      <span>Asisten Paws Kingdom</span><span class="pkcb-badge">Auto</span>
    </div>
    <div style="display:flex;gap:6px;">
      
      <button class="pkcb-ibtn" id="pkcb-close" title="Tutup" aria-label="Tutup">×</button>
    </div>
  `;

  const body = ce("div", { className: "pkcb-body", id: "pkcb-msgs" });
  body.appendChild(
    ce("div", {
      className: "pkcb-msg system",
      textContent: "Hai, ada yang bisa saya bantu?",
    })
  );

  const inputWrap = ce("div", { className: "pkcb-input" });
  inputWrap.innerHTML = `
    <div class="pkcb-row">
      <textarea class="pkcb-textarea" id="pkcb-input" placeholder="Tulis pesan..."></textarea>
      <button class="pkcb-send" id="pkcb-send">Kirim</button>
    </div>
    <div class="pkcb-hint">
      <span id="pkcb-status">Siap</span>
      <span>Enter = kirim • Shift+Enter = baris baru</span>
    </div>
  `;

  panel.appendChild(header);
  panel.appendChild(body);
  panel.appendChild(inputWrap);
  root.appendChild(toggle);
  root.appendChild(panel);
  document.body.appendChild(root);

  // helpers
  const statusEl = qs("#pkcb-status");
  const input = qs("#pkcb-input");
  const sendBtn = qs("#pkcb-send");

  function addMsg(text, who = "bot") {
    const div = ce("div", { className: `pkcb-msg ${who}` });
    div.textContent = text;
    body.appendChild(div);
    body.scrollTop = body.scrollHeight;
    return div;
  }

  function addTyping() {
    const wrap = ce("div", { className: "pkcb-msg bot" });
    wrap.innerHTML = `<div class="pkcb-typing"><span></span><span></span><span></span></div>`;
    body.appendChild(wrap);
    body.scrollTop = body.scrollHeight;
    return wrap;
  }

  function openPanel() {
    panel.style.display = "flex";
    setTimeout(() => input.focus(), 50);
  }

  function closePanel() {
    panel.style.display = "none";
  }

  qs("#pkcb-open").addEventListener("click", () => {
    panel.style.display === "flex" ? closePanel() : openPanel();
  });

  qs("#pkcb-close").addEventListener("click", closePanel);

  // auto grow
  input.addEventListener("input", () => {
    input.style.height = "auto";
    input.style.height = Math.min(input.scrollHeight, 120) + "px";
  });

  async function send() {
    const text = input.value.trim();
    if (!text) return;
    input.value = "";
    input.style.height = "44px";

    addMsg(text, "user");
    const typing = addTyping();
    statusEl.textContent = "Mengirim...";
    sendBtn.disabled = true;

    try {
      const res = await fetch(WEBHOOK_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-session-id": sid,
          "X-Requested-With": "XMLHttpRequest",
        },
        body: JSON.stringify({
          message: text,
          sessionId: sid,
        }),
      });

      if (!res.ok) {
        const errorText = await res.text().catch(() => "Unknown error");
        throw new Error(`Server error (${res.status}): ${errorText}`);
      }

      const data = await res.json();
      console.log("Response data:", data);

      let reply;
      if (data.reply) {
        reply = data.reply;
      } else if (data.data) {
        reply = data.data;
      } else if (data.text) {
        reply = data.text;
      } else if (typeof data === "string") {
        reply = data;
      } else {
        reply = "Maaf, format response tidak dikenali.";
      }

      typing.remove();
      addMsg(reply, "bot");
      statusEl.textContent = "Selesai";
    } catch (e) {
      typing.remove();
      console.error("Chat error:", e);

      let errorMsg = `Error: ${e.message}`;
      if (e.message.includes("cors-anywhere")) {
        errorMsg =
          "Proxy error. Coba buka https://cors-anywhere.herokuapp.com/corsdemo dan klik 'Request temporary access'";
      }

      addMsg(errorMsg, "bot");
      statusEl.textContent = "Gagal";
    } finally {
      sendBtn.disabled = false;
    }
  }

  sendBtn.addEventListener("click", send);
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  });
})();
