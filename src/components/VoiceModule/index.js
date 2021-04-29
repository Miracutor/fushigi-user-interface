import useAssistant from "../RasaAssistant";
import useSpeechRecognize from "./SpeakRecognizeBeta";
import useSpeechSynthesis from "./SpeakSynthesisBeta";

export const useVoiceModule = (playSound) => {
  const { send, triggerRestartSession } = useAssistant({
    sockUrl: "http://localhost:5005/socket.io/",
    sockOpts: { transports: ["websocket"] },
    onUtter: (message) => {
      speakSynthesis(message.text);
    },
  });

  const handleNewUserMessage = (message) => {
    send(message);
  };

  const handleNoMatchRecoginition = () => {
    const message =
      "I am sorry. I cannot hear you. Please speak louder and clearer.";
    speakSynthesis(message);
  };

  const { startRecognize } = useSpeechRecognize(
    handleNewUserMessage,
    handleNoMatchRecoginition
  );
  //const { speakSynthesis, getText } = useSpeechSynthesis("en-US", "Microsoft");
  const { speakSynthesis, getText } = useSpeechSynthesis(playSound);

  return { getText, startRecognize, triggerRestartSession };
};

export default useVoiceModule;
