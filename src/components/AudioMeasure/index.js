import {useEffect, useReducer, useRef} from "react";

const useAudioMeasure = () => {
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

  //const audioElement = useRef(new Audio());
  //const audioContext = useRef();
  const audioLevelRef = useRef(0);

  useEffect(() => {
    audioLevelRef.current = audioLevel;
  }, [audioLevel]);

  const getAudioLevel = () => {
    return audioLevelRef.current;
  };

  const playSound = (url) => {
    const audioContext = new AudioContext();
    const audioElement = new Audio(url);
    audioElement.play().then(() => {
      const audioStream = audioElement.captureStream();
      const analyser = audioContext.current.createAnalyser();
      const source = audioContext.current.createMediaStreamSource(audioStream);
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
        source.disconnect();
        analyser.disconnect();
        cancelAnimationFrame(frameId);
        audioElement.pause();
        audioElement.removeAttribute("src");
        audioElement.remove();
        dispatch({ type: "reset" });
      });
    });
  };

  const playSoundBeta = (text, updateSubtitle) => {
    return new Promise((resolve, reject) => {
      const audioContext = new AudioContext();
      const audioElement = new Audio(
        `http://localhost:5252/api/tts?text="${text}"`
      );
      audioElement.crossOrigin = "anonymous";
      audioElement.preload = "auto";
      audioContext.resume().then(
        audioElement.play().then(() => {
          updateSubtitle(text);
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
            updateSubtitle("");
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
        })
      );
    });
  };

  const playSoundOmega = (promise, text, updateSubtitle) => {
    return new Promise((resolve, reject) => {
      const audioContext = new AudioContext();
      promise.then((audioData) => {
        const audioBlob = new Blob([audioData], {
          type: "audio/wav",
        });
        const audioElement = new Audio(window.URL.createObjectURL(audioBlob));
        audioElement.play().then(() => {
          updateSubtitle(text);
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
            updateSubtitle("");
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

  return { playSound, playSoundBeta, playSoundOmega, getAudioLevel };
};

export default useAudioMeasure;
