import { Config } from "./utils";

export const RectangleConf: Config = {
  name: "Rectangle",
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

export const TextConf: Config = {
  name: "Text",
  type: "Text",
  id: "textroot",
  props: {
    x: 0,
    y: 0,
    text: "text"
  },
  children: []
}

export const GroupConf: Config= {
  name: "Group",
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

export const LayoutExample: Config = {
  name: "LayoutExample",
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
      name: null,
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
      name: null,
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
      name: null,
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

export const EditText: Config = {
  name: "EditText",
  type: "Group",
  id: "root",
  props: {
    x: 50,
    y: 50,
    width: 150,
    height: 50,
    onClick: {
      expr: "$props.onActive",
      evaluator: "pickSuppliedProp",
      default: "",
      map: false
    },
    onKeydown: {
      expr: "$props.onKeydown",
      evaluator: "pickSuppliedProp",
      default: "",
      map: false
    }
  },
  children: [
    {
      name: null,
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
          evaluator: "pickSuppliedProp",
          default: true,
          map: false
        }
      },
      children: []
    },
    {
      name: null,
      id: "text",
      type: "Text",
      props: {
        x: 50,
        y: 50,
        width: 150,
        height: 50, 
        text: {
          expr: "$props.value",
          evaluator: "pickSuppliedProp",
          default: "default text",
          map: false
        }
      },
      children: []
    }
  ]
}

export const ChatBox: Config = {
  name: "ChatBox",
  type: "Group",
  id: "root",
  props: {
    x: {
      expr: "$props.left",
      evaluator: "pickSuppliedProp",
      map: false,
      default: 50
    },
    y: {
      expr: "$props.top",
      evaluator: "pickSuppliedProp",
      map: false,
      default: 50
    },
    onClick: {
      expr: "$props.onActive",
      evaluator: "pickSuppliedProp",
      default: "",
      map: false
    },
    onKeydown: {
      expr: "$props.onKeydown",
      evaluator: "pickSuppliedProp",
      default: "",
      map: false
    }
  },
  children: [
    {
      name: null,
      type: "Rect",
      id: "background",
      props: {
        x: 0,
        y: 0,
        width: 300,
        height: 500,
        fill: "white"
      },
      children: []
    },
    {
      name: null,
      type: "Rect",
      id: "inputbox",
      props: {
        x: 8,
        y: 462,
        width: 216,
        height: 30,
        stroke: "black",
        visible: true
      },
      children: []
    },
    {
      name: null,
      type: "Text",
      id: "inputelement",
      props: {
        x: 15,
        y: 470,
        width: 216,
        height: 30,
        fill: "black",
        text: {
          expr: "$props.value",
          evaluator: "pickSuppliedProp",
          default: "type here...",
          map: false
        }
      },
      children: []
    },
    {
      name: null,
      type: "Rect",
      id: "sendbutton",
      props: {
        x: 230,
        y: 462,
        width: 62,
        height: 30,
        fill: "blue",
        onClick: {
          expr: "$props.onSend",
          evaluator: "pickSuppliedProp",
          default: "",
          map: false
        }
      },
      children: []
    },
    {
      name: null,
      type: "Text",
      id: "btntext",
      props: {
        x: 245,
        y: 472,
        width: 62,
        height: 30,
        fill: "white",
        text: "Send",

      },
      children: []
    },
    {
      name: null,
      type: "LayoutGroup",
      id: "grouproot",
      props: {
        x: 8,
        y: 8,
        width: 290,
        height: 460
      },
      children: [
        {
          name: null,
          id: "rect1",
          type: "Text",
          props: {
            x: 0,
            y: 0,
            fill: "black",
            text: {
              expr: "$props.messages",
              evaluator: "pickSuppliedProp",
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

export const ScrollExample: Config = {
  name: "ScrollExample",
  id: "root",
  type: "Group",
  props: {
    x: 50,
    y: 50,
    width: 100,
    height: 200,
    onWheel: {
      expr: "$props.onScroll",
      evaluator: "pickSuppliedProp",
      default: "",
      map: false
    },
    clipFunc: {
      expr: [
        {
          shape: "Rect",
          props: {
            x: 50,
            y: 50,
            width: 100,
            height: 200
          }
        }
      ],
      evaluator: "makeClipFunc",
      default: "",
      map: false
    }
  },
  children: [
    {
      name: null,
      id: "container",
      type: "Rect",
      props: {
        x: 50,
        y: 50,
        width: 100,
        height: 200,
        stroke: "red"
      },
      children: []
    },
    {
      name: null,
      id: "text",
      type: "Text",
      props: {
        x: 50,
        y: {
          expr: "$props.scrollTop",
          evaluator: "pickSuppliedProp",
          default: 10,
          map: false
        },
        width: 100,
        text: "Some text goes here and well we just keep typing from there on out! Just fill up the box jimbo! And don't forget the shotgun."
      },
      children: []
    }
  ]
}
