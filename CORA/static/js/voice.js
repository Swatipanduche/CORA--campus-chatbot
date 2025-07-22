window.addEventListener("DOMContentLoaded", () => {
  const micBtn = document.getElementById("mic-btn");

  if (!micBtn) return;

  if ("webkitSpeechRecognition" in window) {
    const recognition = new webkitSpeechRecognition();
    recognition.lang = "en-US";
    recognition.continuous = false;
    recognition.interimResults = false;

    micBtn.addEventListener("click", () => {
      micBtn.disabled = true;
      micBtn.innerText = "🎙️ Listening...";

      recognition.start();
    });

    recognition.onresult = function (event) {
      const transcript = event.results[0][0].transcript.trim();
      const inputField = document.getElementById("user-input");
      const sendBtn = document.getElementById("send-btn");

      if (inputField && sendBtn) {
        inputField.value = transcript;
        sendBtn.click();
      }
    };

    recognition.onerror = function (event) {
      console.error("Speech recognition error:", event.error);
      alert("🎤 Mic Error: " + event.error);
      micBtn.disabled = false;
      micBtn.innerText = "🎤";
    };

    recognition.onend = function () {
      micBtn.disabled = false;
      micBtn.innerText = "🎤";
    };
  } else {
    micBtn.disabled = true;
    micBtn.innerText = "Mic ❌";
    alert("❌ Your browser does not support voice recognition.");
  }
});
