import { Component } from "./utils";

export const RectangleConf: Component = {
  name: "Rectangle",
  config: {
    type: "Rect",
    id: "rectroot",
    props: {
      x: 0,
      y: 0,
      width: 50,
      height: 50,
      stroke: "none",
      fill: "white"
    },
    children: []
  }
}

export const TextConf: Component = {
  name: "Text",
  config: {
    type: "Text",
    id: "textroot",
    props: {
      x: 0,
      y: 0,
      text: "text"
    },
    children: []
  }
}

export const GroupConf: Component = {
  name: "Group",
  config: {
    type: "Group",
    id: "grouproot",
    props: {
      x: 0,
      y: 0,
      width: 100,
      height: 100
    },
    children: []
  }
}
