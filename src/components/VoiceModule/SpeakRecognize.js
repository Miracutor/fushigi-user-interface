import {useEffect, useReducer, useRef, useState} from "react";

const useSpeechRecognize = (onResult = () => null, onNoMatch = () => null) => {
  const [recognition, setRecognition] = useState(null);
  const [transcript, setTranscript] = useState(null);
  const [listening, dispatchListen] = useReducer(
    (state, action) => {
      switch (action.type) {
        case "start":
          return true;
        case "stop":
          return false;
        default:
          throw new Error("Unexpected action");
      }
    },
    false,
    undefined
  );
  const listenRef = useRef(false);

  useEffect(() => {
    listenRef.current = listening;
  }, [listening]);

  useEffect(() => {
    if ("speechSynthesis" in window) {
      try {
        // new speech recognition object
        const SpeechRecognition =
          typeof window !== "undefined" &&
          (window.SpeechRecognition || window.webkitSpeechRecognition);

        const recognizeObj = new SpeechRecognition();

        setRecognition(recognizeObj);

        recognizeObj.onstart = () => {
          console.log("Voice recognition started.");
          dispatchListen({ type: "start" });
        };

        recognizeObj.onresult = (event) => {
          let final_transcript = "";
          for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
              final_transcript += event.results[i][0].transcript;
            }
          }

          dispatchListen({ type: "stop" });

          console.log("Final result: " + final_transcript);

          setTranscript(final_transcript);
          onResult(final_transcript);
        };

        recognizeObj.onnomatch = () => {
          console.log("No match found.");
          onNoMatch();
        };

        recognizeObj.onerror = () => {
          console.log("No match found.");
          onNoMatch();
        };

        setRecognition(recognizeObj);
      } catch (e) {
        console.log(e);
      }
    } else {
      console.log("Speech recognition not supported 😢");
    }
  }, []);

  const startRecognize = () => {
    recognition.start();
  };

  const getListening = () => {
    return listenRef.current;
  };

  return { recognition, transcript, startRecognize, getListening };
};

export default useSpeechRecognize;
