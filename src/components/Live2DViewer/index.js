import React, { useRef, useState } from "react";
import "../../css/live2dviewer.css";
import { Application } from "@pixi/app";
import { Ticker, TickerPlugin } from "@pixi/ticker";
import { Live2DModel } from "pixi-live2d-display/lib/cubism4";
import useAsyncEffect from "use-async-effect";
import Subtitle from "../Subtitle";
import useVoiceModule from "../VoiceModule";
import CheatSheet from "../CheatSheet";
import USMLogo from "../USMLogo";

Application.registerPlugin(TickerPlugin);
Live2DModel.registerTicker(Ticker);

const Live2DViewer = () => {
  const containerRef = useRef();
  const canvasRef = useRef();
  const appRef = useRef();
  const modelRef = useRef();
  const [forOnce, setForOnce] = useState(false);

  const { getText, getAudioLevel, startRecognize, getListening } =
    useVoiceModule();

  useAsyncEffect(async () => {
    appRef.current = new Application({
      view: canvasRef.current,
      autoStart: true,
      // backgroundColor: 0xb19cd9,
      resizeTo: containerRef.current,
      transparent: true,
    });
    await Live2DModel.from("chitose/chitose.model3.json").then((model) => {
      model.scale.set(0.3);

      const updateFn = model.internalModel.motionManager.update;
      model.internalModel.motionManager.update = (...args) => {
        updateFn.apply(model.internalModel.motionManager, args);

        model.internalModel.coreModel.setParameterValueById(
          "PARAM_MOUTH_OPEN_Y",
          getAudioLevel()
        );
      };
      appRef.current.stage.addChild(model);
      modelRef.current = model;

      appRef.current.stage.children[0].x = appRef.current.stage.width / 2;
      appRef.current.stage.children[0].y = appRef.current.stage.height * 0.05;
    });
  }, []);

  const handleClick = (e) => {
    e.preventDefault();
    startRecognize();
  };

  return (
    <div className="live2d-viewer" ref={containerRef}>
      <canvas ref={canvasRef} />
      <Subtitle text={getText()} />
      <USMLogo />
      <div className="card speak-tutor" hidden={forOnce}>
        &nbsp;&#8592;&nbsp;Click this button and say "Hi" to begin conversation!
      </div>
      <button
        className="btn btn-lg btn-light speak-btn"
        onClick={(e) => {
          setForOnce(true);
          handleClick(e);
        }}
      >
        <b>SPEAK</b>
      </button>

      <CheatSheet />
    </div>
  );
};

export default Live2DViewer;
