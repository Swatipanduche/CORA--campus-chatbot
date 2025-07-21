const micBtn = document.getElementById("mic-btn");

if ("webkitSpeechRecognition" in window) {
  const recognition = new webkitSpeechRecognition();
  recognition.lang = "en-US";
  recognition.continuous = false;
  recognition.interimResults = false;

  micBtn.addEventListener("click", () => {
    recognition.start();
    micBtn.innerText = "🎙️ Listening...";
  });

  recognition.onresult = function (event) {
    const transcript = event.results[0][0].transcript;
    document.getElementById("user-input").value = transcript;
    document.getElementById("send-btn").click();
    micBtn.innerText = "🎤";
  };

  recognition.onerror = function () {
    micBtn.innerText = "🎤";
  };

  recognition.onend = function () {
    micBtn.innerText = "🎤";
  };
} else {
  micBtn.disabled = true;
  micBtn.innerText = "Mic ❌";
}
