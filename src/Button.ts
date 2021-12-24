// import { Rect, Text, Group } from 'react-konva';
import { createElement as h } from 'react';

type PropExprs = Record<string, number|boolean|string|{ expr: string }>;

interface Config {
  type: "Group" | "Rect" | "Text";
  props: PropExprs|null; 
  children: Config[];
}

export const config: Config = {
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

function evaluateProps($props: Record<string, any>, propsExprs: PropExprs) {
  const evaluated = {...propsExprs};
  Object.keys(propsExprs).forEach(key => {
    const propval = propsExprs[key];
    if (typeof propval === "object") {
      evaluated[key] = eval(propval.expr);
    }
  });
  return evaluated;
}

function transformToRenderFcn(config: Config) {
  return function($props: Record<string, any>) {
    let props: PropExprs|null = null;
    if (config.props) {
      props = evaluateProps($props, config.props);
    }
    return h(
      config.type, 
      props,
      []
    );
  }
}

export function tranformToVDOM(config: Config, $props: PropExprs): any {
  const children = config.children.map(child => h(tranformToVDOM(child, $props)));
  return function($props: any) {
    return h(
      config.type,
      config.props, 
      children
    );
  }
}

export default function (props: { title: string; size: string; }) {
  const background = h(
    "Rect", 
    {
      x: 0,
      y: 0,
      width: 150,
      height: 50,
      fill: "cornflowerblue"
    } 
  );
  const text = h(
    "Text",
    {
      x: 20,
      y: 15,
      text: props.title
    }
  )
  return h(
    "Group",
    null,
    [
      background,
      text
    ]
  )
}