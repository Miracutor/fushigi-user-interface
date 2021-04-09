import {useEffect, useReducer, useRef} from "react";
import useAsyncQueue from "use-async-queue";

const useSpeechSynthesis = (language = "en-US", voiceName = "Google") => {
  const { add } = useAsyncQueue({
    concurrency: 1,
  });
  const synthesis = useRef(window.speechSynthesis);
  const [state, dispatch] = useReducer(
    (state, action) => {
      switch (action.type) {
        case "loadVoice":
          return (state.voice = action.payload);
        case "setText":
          return (state.text = action.payload);
        default:
          throw new Error("Unexpected action");
      }
    },
    { voice: null, text: "" },
    undefined
  );
  const voiceRef = useRef(null);
  const textRef = useRef("");

  useEffect(() => {
    voiceRef.current = state.voice;
    textRef.current = state.text;
  }, [state]);

  useEffect(() => {
    if ("speechSynthesis" in window) {
      try {
        const voices = synthesis.current.getVoices();

        for (let i = 0; i < voices.length; i++) {
          if (
            voices[i].lang === language &&
            voices[i].name.includes(voiceName)
          ) {
            setVoice(voices[i]);
            break;
          }
        }
      } catch (e) {
        console.log(e);
      }
    } else {
      console.log("Speech synthesis not supported 😢");
    }
  }, []);

  const getText = () => {
    return textRef.current;
  };

  const getVoice = () => {
    return voiceRef.current;
  };

  const setText = (text) => {
    dispatch({ type: "setText", payload: text });
  };

  const setVoice = (voice) => {
    dispatch({ type: "loadVoice", payload: voice });
  };

  const speakSynthesis = (text = "") => {
    add({
      id: "",
      task: () => {
        return new Promise((resolve, reject) => {
          setText("[Bot]: " + text);
          const newUtter = new SpeechSynthesisUtterance(text);
          newUtter.voice = getVoice();
          newUtter.pitch = 1;
          newUtter.rate = 1;
          newUtter.onend = () => {
            setText("");
            resolve();
          };
          newUtter.onerror = (event) => {
            reject(event.error);
          };
          console.log(
            "Speak: " + text + " [Voice: " + newUtter.voice.name + "]"
          );
          synthesis.current.speak(newUtter);
        });
      },
    });
  };
  return { speakSynthesis, getText };
};

export default useSpeechSynthesis;
