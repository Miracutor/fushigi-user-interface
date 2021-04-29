import { useEffect, useRef, useState } from "react";
import useAsyncQueue from "use-async-queue";
import * as sdk from "microsoft-cognitiveservices-speech-sdk";

const useSpeechSynthesis = (speakFunc = () => null) => {
  const { add } = useAsyncQueue({
    concurrency: 1,
  });

  const [id, setId] = useState(0);
  const [text, setText] = useState("");

  const idRef = useRef(0);
  const textRef = useRef("");

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

  const speakSynthesis = (text = "") => {
    incrementId();
    add({
      id: getId(),
      task: () => {
        return speakFunc(synthesizeSpeech(text), text, setText);
      },
    });
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

  return { speakSynthesis, getText };
};

export default useSpeechSynthesis;
