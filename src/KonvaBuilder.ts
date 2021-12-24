import { Stage, Layer } from 'react-konva';
// import Konva from 'konva';
import { createElement as h, useEffect, useState } from 'react';
import "./App.css";
import { tranformToVDOM } from "./utils";


export default function() {

  const [ conf, setConf ] = useState(null);

  useEffect(() => {
    if (!conf) {
      import("http://localhost:3000/button.js")
        .then(({ default: config }) => {
            // const Button = tranformToVDOM(config, { title: "Click here", size: "Regular" });
            setConf(config);
          })
          .catch(err => {
          console.error("error when downloading button: ", err);
        })
    }
    
  }, [conf]);

  let content = h("Text", { text: "Not loaded yet!" });

  if (conf) {
    content = h(tranformToVDOM(conf, { title: "Click here", size: "Regular" }));
  }

  return (
    h(Stage, 
      {
        width: window.innerWidth,
        height: window.innerHeight,
        className: "konvaroot"
      },
      [
        h(Layer,
          {
            key: "layer1"
          },
          content
        )
      ]
    )
  );
}