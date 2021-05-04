import { useEffect, useReducer, useRef, useState } from "react";
import useAsyncQueue from "use-async-queue";
import * as sdk from "microsoft-cognitiveservices-speech-sdk";

const useSpeechSynthesis = () => {
  const { add } = useAsyncQueue({
    concurrency: 1,
  });

  const [id, setId] = useState(0);
  const [text, setText] = useState("");
  const [audioLevel, dispatch] = useReducer((state, action) => {
    switch (action.type) {
      case "set":
        return action.payload;
      case "reset":
        return 0.0;
      default:
        throw new Error("Unexpected action");
    }
  }, 0.0);

  const idRef = useRef(0);
  const textRef = useRef("");
  const audioLevelRef = useRef(0);

  useEffect(() => {
    audioLevelRef.current = audioLevel;
  }, [audioLevel]);

  const getAudioLevel = () => {
    return audioLevelRef.current;
  };

  useEffect(() => {
    idRef.current = id;
  }, [id]);

  useEffect(() => {
    textRef.current = text;
  }, [text]);

  const getId = () => {
    return idRef.current;
  };

  const getText = () => {
    return textRef.current;
  };

  const incrementId = () => {
    setId(id + 1);
  };

  const generateSSML = (text) => {
    const ssml = `<speak version="1.0" xmlns="https://www.w3.org/2001/10/synthesis" xml:lang="en-US">
  <voice name="en-US-GuyRUS">
    ${text}
  </voice>
</speak>`;
    return ssml;
  };

  const synthesizeSpeech = (text = "") => {
    return new Promise((resolve, reject) => {
      const speechConfig = sdk.SpeechConfig.fromSubscription(
        "6a15144b41b74b66bd68b9d11d2ba8cd",
        "southeastasia"
      );
      const audioConfig = null;
      const synthesizer = new sdk.SpeechSynthesizer(speechConfig, audioConfig);
      synthesizer.speakSsmlAsync(
        generateSSML(text),
        (result) => {
          synthesizer.close();
          resolve(result.audioData);
        },
        (error) => {
          console.log(error);
          synthesizer.close();
          reject(error);
        }
      );
    });
  };

  const playSpeech = (promise, text) => {
    return new Promise((resolve, reject) => {
      const audioContext = new AudioContext();
      promise.then((audioData) => {
        const audioBlob = new Blob([audioData], {
          type: "audio/wav",
        });
        const audioElement = new Audio(window.URL.createObjectURL(audioBlob));
        audioElement.play().then(() => {
          setText(text);
          const audioStream = audioElement.captureStream();
          const analyser = audioContext.createAnalyser();
          const source = audioContext.createMediaStreamSource(audioStream);
          const pcmData = new Float32Array(analyser.fftSize);
          let frameId;

          source.connect(analyser);
          const render = () => {
            analyser.getFloatTimeDomainData(pcmData);
            let sumSquares = 0.0;
            for (let amplitude of pcmData) {
              sumSquares += amplitude * amplitude;
            }
            dispatch({
              type: "set",
              payload: (Math.sqrt(sumSquares / pcmData.length) * 5).toFixed(1),
            });
            frameId = requestAnimationFrame(render);
          };
          render();

          audioElement.addEventListener("ended", () => {
            setText("");
            source.disconnect();
            analyser.disconnect();
            cancelAnimationFrame(frameId);
            audioElement.pause();
            audioElement.removeAttribute("src");
            audioElement.remove();
            dispatch({ type: "reset" });
            resolve();
          });
          audioElement.addEventListener("error", () => {
            reject();
          });
        });
      });
    });
  };

  const speakSynthesis = (subtitle = "") => {
    incrementId();
    add({
      id: getId(),
      task: () => {
        return playSpeech(synthesizeSpeech(subtitle), subtitle);
      },
    });
  };

  return { speakSynthesis, getText, getAudioLevel };
};

export default useSpeechSynthesis;
