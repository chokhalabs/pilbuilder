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
      fill: "#c4c4c4"
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

export const LayoutExample: Component = {
  name: "LayoutExample",
  config: {
    type: "LayoutGroup",
    id: "grouproot",
    props: {
      x: 50,
      y: 50,
      width: 200,
      height: 200
    },
    children: [
      {
        id: "rect1",
        type: "Text",
        props: {
          x: 0,
          y: 0,
          fill: "rgba(0, 0, 255, 0.5)",
          text: "Line 1"
        },
        children: []
      },
      {
        id: "rect2",
        type: "Text",
        props: {
          x: 0,
          y: 0,
          fill: "rgba(0, 255, 0, 0.5)",
          text: "Line 2"
        },
        children: []
      },
      {
        id: "rect3",
        type: "Text",
        props: {
          x: 0,
          y: 0,
          fill: "rgba(255, 255, 0, 0.5)",
          text: "Line 3"
        },
        children: []
      }
    ]
  }
}
