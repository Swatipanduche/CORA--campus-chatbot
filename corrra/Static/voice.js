function startListening() {
  const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
  recognition.lang = "en-US";
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;

  recognition.start();

  recognition.onstart = function () {
    console.log("Voice recognition started. Speak now.");
  };

  recognition.onresult = function (event) {
    const transcript = event.results[0][0].transcript;
    document.getElementById("userInput").value = transcript;
    getResponse(); // Automatically call chatbot after voice input
  };

  recognition.onerror = function (event) {
    alert("Voice recognition error: " + event.error);
  };
}
