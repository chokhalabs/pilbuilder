import { Stage, Layer } from 'react-konva';
import { createElement as h, useEffect, useState } from 'react';

import "./KonvaBuilder.css";
import { tranformToVDOM } from "./utils";


export default function() {

  const [ conf, setConf ] = useState(null);

  useEffect(() => {
    if (!conf) {
      // @ts-ignore
      import("http://localhost:3000/button.js")
        .then(({ default: config }) => {
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