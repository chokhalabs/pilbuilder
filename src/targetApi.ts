export const chatComponent = {
  id: "root",
  type: "Column",
  width: 400,
  height: 700,
  x: 0,
  y: 0,
  children: {
    "messages": {
      id: "messages",
      type: "Scroll",
      x: 0,
      y: 0,
      width: 400,
      height: 650,
      children: {
        "message1": {
          id: "message1",
          type: "Text"
        },
        "message2": {
          id: "message2",
          type: "Text"
        }
      }
    },
    "controls": {
      id: "controls",
      type: "Row",
      children: {
        "typingarea": {
          id: "typingarea",
          remote_type: "@pilcrow/TextEdit",
          eventHandlers: {
            onChange: {
              emitName: "onTypedText",
              payloadProcessor: ""
            }
          },
          props: {
            x: "root.x",
            y: "root.y"
          }
        },
        "send": {
          id: "send",
          remote_type: "@pilcrow/Button",
          eventHandlers: {
            onClick: {
              emitName: "onSend",
              payloadProcessor: ""
            }
          }
        }
      }
    }
  }
};