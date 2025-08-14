 const chatLog = document.getElementById("chatLog");
const promptInput = document.getElementById("promptInput");
const sendBtn = document.getElementById("sendBtn");

function appendMessage(role, text) {
  const div = document.createElement("div");
  div.className = `msg ${role}`;
  div.innerHTML = `<strong>${role === "user" ? "You" : "Assistant"}:</strong> <span>${text}</span>`;
  chatLog.appendChild(div);
  chatLog.scrollTop = chatLog.scrollHeight;
}

async function sendChat(e) {
  e.preventDefault();
  const prompt = (promptInput.value || "").trim();
  if (!prompt) return;

  appendMessage("user", prompt);
  promptInput.value = "";
  sendBtn.disabled = true;

  try {
    const res = await fetch("/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt })
    });
    const data = await res.json();
    if (data?.reply) {
      appendMessage("assistant", data.reply);
    } else {
      appendMessage("assistant", "(오류: 응답이 비어 있음)");
    }
  } catch (err) {
    console.error(err);
    appendMessage("assistant", "(오류: 서버 통신 실패)");
  } finally {
    sendBtn.disabled = false;
    promptInput.focus();
  }
}

window.addEventListener("load", async () => {
  try {
    const res = await fetch("/history");
  const data = await res.json();
    if (Array.isArray(data.logs)) {
      chatLog.innerHTML = "";
      data.logs.forEach(m => appendMessage(m.role, m.content));
    }
  } catch {}
});
