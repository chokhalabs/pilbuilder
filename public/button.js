const config = {
  type: "Group",
  id: "id1",
  props: {
    x: 0,
    y: 0,
    draggable: true
  },
  children: [
    {
      type: "Rect",
      id: "id2",
      props: {
        x: 0,
        y: 0,
        width:  150,
        height: 50,
        fill: "cornflowerblue"
      },
      children: []
    },
    {
      type: "Text",
      id: "id3",
      props: {
        x: 20,
        y: 15,
        text: {
          expr: "$props.title"
        }
      },
      children: []
    }
  ]
};

export default config;

export const rectangle = {
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

export const Text = {
  type: "Text",
  id: "textroot",
  props: {
    x: 0,
    y: 0,
    text: "text"
  },
  children: []
}

export const Group = {
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
