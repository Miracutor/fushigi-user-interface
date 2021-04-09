import React from "react";
import "../../css/subtitle.css";

const Subtitle = (props) => {
  return (
    <div className="subtitle-text mx-auto text-center">
      <p>{(props.text !== "" || null) && <span>{props.text}</span>}</p>
    </div>
  );
};

export default Subtitle;
