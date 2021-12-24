import { Stage, Layer } from 'react-konva';
import { createElement as h, useEffect, useState } from 'react';

import "./KonvaBuilder.css";
import { Config, tranformToVDOM } from "./utils";
import Tree from "./Tree";


export default function() {
  const [ conf, setConf ] = useState(null as Config | null);
  const [ leftsidebarWidth, setSidebarWidth ] = useState(250);

  useEffect(() => {
    if (!conf) {
      // @ts-ignore
      import("http://localhost:3000/button.js")
        .then(({ default: config }) => {
            // TODO: Add better validation
            if (config && config.type && config.children) {
              setConf(config);
            } else {
              console.error("Invalid config");
            }
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

  const tree = h(
    "div", 
    { 
      className: "tree", 
      style: { width: leftsidebarWidth, height: window.innerHeight } 
    },
    h(
      Tree,
      conf
    )
  );
  const stage = h(Stage, 
    {
      width: window.innerWidth - leftsidebarWidth,
      height: window.innerHeight,
      className: "stage",
      key: "stage"
    },
    [
      h(Layer,
        {
          key: "layer1"
        },
        content
      )
    ]
  );


  return (
    h(
      "div", 
      { 
        className: "konvaroot"
      }, 
      [
        tree,
        stage
      ]
    )
  );
}