async function fetchMessages() {
  if (!this.accessToken || !this.roomId) return;
  try {
    const res = await fetch(
      `https://matrix.org/_matrix/client/r0/rooms/${encodeURIComponent(this.roomId)}/messages?dir=b&limit=20`,
      {
        headers: { 'Authorization': `Bearer ${this.accessToken}` }
      }
    );
    const data = await res.json();

    if (data.chunk) {
      // зберігаємо повідомлення у правильному порядку
      this.messages = data.chunk
        .filter(event => event.type === "m.room.message")
        .reverse();
    }
  } catch (e) {
    console.error("Fetch messages error:", e);
  }
}

async function sendMessage() {
  if (!this.newMessage.trim() || !this.roomId) return;
  try {
    const txnId = Date.now();
    const res = await fetch(
      `https://matrix.org/_matrix/client/r0/rooms/${encodeURIComponent(this.roomId)}/send/m.room.message/${txnId}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${this.accessToken}`
        },
        body: JSON.stringify({
          msgtype: "m.text",
          body: this.newMessage.trim()
        })
      }
    );
    const data = await res.json();
    if (data.event_id) {
      this.newMessage = "";
      await this.fetchMessages(); // оновлюємо чат після відправки
    }
  } catch (e) {
    console.error("Send message error:", e);
  }
}
