import useAssistant from "../RasaAssistant";
import useSpeechRecognize from "./SpeakRecognize";
import useSpeechSynthesis from "./SpeakSynthesis";

export const useVoiceModule = () => {
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

  const { startRecognize, getListening } = useSpeechRecognize(
    handleNewUserMessage,
    handleNoMatchRecoginition
  );

  const { speakSynthesis, getText, getAudioLevel } = useSpeechSynthesis();

  return {
    getText,
    getAudioLevel,
    startRecognize,
    triggerRestartSession,
    getListening,
  };
};

export default useVoiceModule;
