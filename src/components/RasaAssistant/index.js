import io from "socket.io-client";
import {useCallback, useEffect, useRef} from "react";

// Custom version of react-rasa-assistant
export const useAssistant = ({
  sockUrl,
  sockOpts,
  initSessionId,
  initMsg,
  onError = noop,
  onUtter = noop,
}) => {
  const sockRef = useRef(null);
  const sessionIdRef = useRef(null);

  useEffect(() => {
    const [, sockHostname, sockPath] = sockUrl.match(
        /^((?:http|ws)s?:\/\/[^/]+)(\/.*)$/
      ),
      sock = io(sockHostname, { path: sockPath, ...sockOpts });

    sockRef.current = sock;

    socketErrorEventNames.forEach((errorEventName) =>
      sock.on(errorEventName, (e) => {
        if (errorEventName === "disconnect" && e === "io client disconnect")
          // this is fired on manual disconnects so not an error
          return;

        onError({ type: errorEventName, payload: e });
      })
    );

    sock
      .on("connect", () => restartSession(sock, initSessionId))

      .on("session_confirm", (sessInfo) => {
        // sessionIdRef.current = sessInfo.session_id;
        sessionIdRef.current = sessInfo;
        console.log(
          "New session created! : " + sessionIdRef.current + "/" + sessInfo
        );
        if (initMsg) handleBotUtter(initMsg);
      })

      .on("bot_uttered", handleBotUtter);

    return () => sock.close();
  }, []);

  const restartSession = useCallback(
    (sock, session_id) =>
      sockRef.current.emit("session_request", { session_id }),
    []
  );

  const triggerRestartSession = async () => {
    const sock = sockRef.current;
    await sock.close();
    await sock.open();
  };

  const userUtter = useCallback(
    (text, payload) => {
      sockRef.current.emit("user_uttered", {
        session_id: sessionIdRef.current,
        message: payload || text,
      });
    },

    []
  );

  const send = useCallback(
    (message) => {
      userUtter(message);
    },
    [userUtter]
  );

  const handleBotUtter = useCallback(
    (msg) => {
      const msgTpl = {
        ts: Date.now(),
        direction: "in",
        metadata: msg.metadata,
      };

      onUtter({ ...msgTpl, ...msg });
    },
    [onUtter]
  );

  return {
    send,
    botUtter: handleBotUtter,
    restartSession,
    triggerRestartSession,
  };
};

const noop = () => null;

const socketErrorEventNames = [
  "error",
  "connect_error",
  "connect_timeout",
  "reconnect_error",
  "reconnect_failed",
  "disconnect",
];

export default useAssistant;
