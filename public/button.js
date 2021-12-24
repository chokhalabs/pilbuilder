const config = {
  type: "Group",
  props: null,
  children: [
    {
      type: "Rect",
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
