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
