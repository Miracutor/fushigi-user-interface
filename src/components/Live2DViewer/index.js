import React, {useRef} from "react";
import "../../css/live2dviewer.css";
import {Application} from "@pixi/app";
import {Ticker, TickerPlugin} from "@pixi/ticker";
import {Live2DModel} from "pixi-live2d-display/lib/cubism4";
import useAudioMeasure from "../AudioMeasure";
import useAsyncEffect from "use-async-effect";
import Subtitle from "../Subtitle";
import useVoiceModule from "../VoiceModule";
import CheatSheet from "../CheatSheet";

Application.registerPlugin(TickerPlugin);
Live2DModel.registerTicker(Ticker);

const Live2DViewer = () => {
  const containerRef = useRef();
  const canvasRef = useRef();
  const appRef = useRef();
  const modelRef = useRef();

  const { playSoundOmega, getAudioLevel } = useAudioMeasure();
  const { getText, startRecognize } = useVoiceModule(playSoundOmega);

  useAsyncEffect(async () => {
    appRef.current = new Application({
      view: canvasRef.current,
      autoStart: true,
      backgroundColor: 0xffe79e,
      resizeTo: containerRef.current,
    });
    await Live2DModel.from("Haru/haru_greeter_t03.model3.json").then(
      (model) => {
        model.scale.set(0.3);

        const updateFn = model.internalModel.motionManager.update;
        model.internalModel.motionManager.update = (...args) => {
          updateFn.apply(model.internalModel.motionManager, args);

          model.internalModel.coreModel.setParameterValueById(
            "ParamMouthOpenY",
            getAudioLevel()
          );
        };
        appRef.current.stage.addChild(model);
        modelRef.current = model;

        appRef.current.stage.children[0].x = appRef.current.stage.width / 2;
      }
    );
  }, []);

  const handleClick = (e) => {
    e.preventDefault();
    startRecognize();
  };

  return (
    <div className="live2d-viewer" ref={containerRef}>
      <canvas ref={canvasRef} />
      <Subtitle text={getText()} />
      <button
        className="btn btn-lg btn-primary speak-btn"
        onClick={handleClick}
      >
        SPEAK
      </button>
      <CheatSheet />
    </div>
  );
};

export default Live2DViewer;
