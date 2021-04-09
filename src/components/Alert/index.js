import Noty from "noty";
import "noty/lib/noty.css";
import "noty/lib/themes/nest.css";

const alertNotify = (type, text, options) => {
  const noty = new Noty({
    theme: "nest",
    layout: "topCenter",
    timeout: 1500,
    type,
    text,
    progressBar: false,
    callbacks: {
      onHover: () => {
        noty.stop();
      },
    },
    ...options,
  }).show();
};

export const error = (text, options) => {
  alertNotify("error", text, {
    ...options,
  });
};

export const success = (text, options) => {
  alertNotify("success", text, {
    ...options,
  });
};

export const warning = (text, options) => {
  alertNotify("warning", text, {
    ...options,
  });
};

export const alert = (text, options) => {
  alertNotify("alert", text, {
    ...options,
  });
};

export const info = (text, options) => {
  alertNotify("info", text, {
    ...options,
  });
};
