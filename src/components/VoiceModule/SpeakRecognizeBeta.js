import { useEffect, useReducer, useRef, useState } from "react";
import * as sdk from "microsoft-cognitiveservices-speech-sdk";

const useSpeechRecognize = (onResult = () => null, onNoMatch = () => null) => {
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

  const startRecognize = () => {
    return new Promise((resolve, reject) => {
      const speechConfig = sdk.SpeechConfig.fromSubscription(
        "6a15144b41b74b66bd68b9d11d2ba8cd",
        "southeastasia"
      );
      const audioConfig = sdk.AudioConfig.fromDefaultMicrophoneInput();
      const recognizer = new sdk.SpeechRecognizer(speechConfig, audioConfig);

      console.log("Voice recognition started.");
      dispatchListen({ type: "start" });

      recognizer.recognizeOnceAsync((result) => {
        let final_transcript;
        if (result.reason === sdk.ResultReason.RecognizedSpeech) {
          final_transcript = result.text;
        } else {
          final_transcript =
            "Speech was cancelled or could not be recognized. Ensure your microphone is working properly.";
          onNoMatch();
          reject();
        }
        dispatchListen({ type: "stop" });
        console.log("Final result: " + final_transcript);
        setTranscript(final_transcript);
        onResult(final_transcript);
        resolve();
      });
    });
  };

  const getListening = () => {
    return listenRef.current;
  };

  return { transcript, startRecognize, getListening };
};

export default useSpeechRecognize;
