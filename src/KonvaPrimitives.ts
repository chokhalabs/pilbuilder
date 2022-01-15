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

export const EditText: Component = {
  name: "EditText",
  config: {
    type: "Group",
    id: "root",
    props: {
      x: 50,
      y: 50,
      width: 150,
      height: 50,
      onClick: {
        expr: "$props.onActive",
        default: "",
        map: false
      },
      onKeydown: {
        expr: "$props.onKeydown",
        default: "",
        map: false
      }
    },
    children: [
      {
        id: "containerbox",
        type: "Rect",
        props: {
          x: 50,
          y: 50,
          width: 150,
          height: 50,
          stroke: "black",
          visible: {
            expr: "$props.active",
            default: true,
            map: false
          }
        },
        children: []
      },
      {
        id: "text",
        type: "Text",
        props: {
          x: 50,
          y: 50,
          width: 150,
          height: 50, 
          text: {
            expr: "$props.value",
            default: "default text",
            map: false
          }
        },
        children: []
      }
    ]
  }
}

export const ChatBox: Component = {
  name: "ChatBox",
  config: {
    type: "Group",
    id: "root",
    props: {
      onClick: {
        expr: "$props.onActive",
        default: "",
        map: false
      },
      onKeydown: {
        expr: "$props.onKeydown",
        default: "",
        map: false
      }
    },
    children: [
      {
        type: "Rect",
        id: "background",
        props: {
          x: 50,
          y: 50,
          width: 300,
          height: 450,
          fill: "white"
        },
        children: []
      },
      {
        type: "Rect",
        id: "inputbox",
        props: {
          x: 58,
          y: 462,
          width: 216,
          height: 30,
          stroke: "black",
          visible: true
        },
        children: []
      },
      {
        type: "Text",
        id: "inputelement",
        props: {
          x: 58,
          y: 462,
          width: 216,
          height: 30,
          fill: "black",
          text: {
            expr: "$props.value",
            default: "type here...",
            map: false
          }
        },
        children: []
      },
      {
        type: "Rect",
        id: "sendbutton",
        props: {
          x: 281,
          y: 462,
          width: 62,
          height: 30,
          fill: "blue",
          onClick: {
            expr: "$props.onSend",
            default: "",
            map: false
          }
        },
        children: []
      },
      {
        type: "Text",
        id: "btntext",
        props: {
          x: 296,
          y: 472,
          width: 62,
          height: 30,
          fill: "white",
          text: "Send",

        },
        children: []
      },
      {
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
              x: 50,
              y: 50,
              fill: "black",
              text: {
                expr: "$props.messages",
                map: true,
                default: ["Line1", "Line2", "Line3"]
              }
            },
            children: []
          }
        ]
      }
    ]
  }
}
