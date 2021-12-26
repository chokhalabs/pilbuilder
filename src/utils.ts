// import { Rect, Text, Group } from 'react-konva';
import { createElement as h } from 'react';

type PropExprs = Record<string, number|boolean|string|{ expr: string }>;

export interface Config {
  id: string;
  type: "Group" | "Rect" | "Text";
  props: PropExprs|null; 
  children: Config[];
}

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

export function tranformToVDOM(config: Config, $props: PropExprs): any {
  let props: PropExprs|null = null;
  if (config.props) {
    props = evaluateProps($props, config.props);
  }
  const children = config.children.map(child => h(tranformToVDOM(child, $props), { key: child.id }));
  return function() {
    return h(
      config.type,
      {
        ...props,
        draggable: true
      }, 
      children
    );
  }
}
