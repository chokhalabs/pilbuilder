import { createElement as h } from "react";
import { Config, BindingExpression } from "./utils";

type DetailsProps = {
  node: Config | null,
  onNodeUpdate: (key: string, value: any) => void
};

function editNumber(props: { label: string; value: number; onChange: (key: string, value: number) => void, isProvided: boolean }) {
  return h(
    "div", 
    {
      className: "numberfield"
    },
    [
      h(
        "div",
        {},
        props.label
      ),
      h(
        "input",
        {
          value: props.value,
          type: "number",
          onChange: ev => props.onChange(props.label, parseFloat(ev.target.value))
        }
      )
    ] 
  );
}

function editColor(props: { label: string; value: string; onChange: (key: string, value: string) => void, isProvided: boolean }) {
  return h(
    "div", 
    {
      className: "colorfield"
    },
    [
      h(
        "div",
        {},
        props.label
      ),
      h(
        "input",
        {
          value: props.value,
          type: "color",
          onChange: ev => props.onChange( props.label, ev.target.value)
        }
      )
    ] 
  );
}

function editText(props: { label: string; value: string; defaultValue: string | string[], onChange: (key: string, value: string | BindingExpression) => void; isProvided: boolean} ) {
  const editor = h(
    "div", 
    {
      className: "boundfield"
    }, 
    h(
      "div",
      {},
      props.label
    ),
    h(
      "input",
      {
        value: props.isProvided ? props.value.substring("$props.".length) : props.value,
        type: "text",
        onChange: ev => props.onChange(props.label, props.isProvided ? { expr: "$props." + ev.target.value, default: props.defaultValue, map: false } : ev.target.value)
      }
    ),
    h(
      "input", 
      { 
        type: "checkbox", 
        checked: props.isProvided, 
        onChange: ev => {
          if (ev.target.checked) {
            if (!props.defaultValue) {
              props.defaultValue = "default " + props.value.substring("$props.".length);
            }
            props.onChange(props.label, { expr: "$props." + props.value, default: props.defaultValue, map: false })
          } else {
            props.onChange(props.label, props.value)
          }
        } 
      }
    )
  );

  const defaultValue = h(
    "div",
    {},
    h(
      "div",
      {},
      "default"
    ),
    h(
      "div",
      {
        style: { display: "flex" }
      },
      h(
        "input",
        {
          placeholder: "Default value",
          value: props.defaultValue,
          onChange: ev => {
            props.onChange(props.label, { expr: props.value, default: ev.target.value, map: Array.isArray(props.defaultValue) })
          }
        }
      ),
      h(
        "button",
        {
          onClick: () => {
            props.onChange(props.label, { expr: props.value, default: ["def1", "def2"], map: true })
          }
        },
        "+"
      )
    )
  );

  return h(
    "div", 
    {
      className: "textfield"
    },
    editor,
    h("hr"),
    props.isProvided ? defaultValue : null 
  );
}

export default function (props: DetailsProps) {
  let body = h("div", {}, "Select a node to edit its properties!");
  if (props.node) {
    const node = props.node;
    let propEditors: Array<ReturnType<typeof h>> = [];

    if (node.props) {
      Object.keys(node.props).forEach(propkey => {
        const propval = node.props && node.props[propkey];
        if (propkey === "fill") {
          propEditors.push(editColor({ 
            label: propkey, 
            value: propval as string, // fill is always string
            onChange: props.onNodeUpdate,
            isProvided: false
          }));
        } else if (typeof propval === "number") {
          propEditors.push(editNumber({
            label: propkey,
            value: propval,
            onChange: props.onNodeUpdate,
            isProvided: false
          }));
        } else if (typeof propval === "string") {
          propEditors.push(editText({
            label: propkey,
            value: propval,
            defaultValue: "", 
            onChange: props.onNodeUpdate,
            isProvided: false
          }));
        } else if (typeof propval === "object" && propval) {
          propEditors.push(editText({
            label: propkey,
            value: propval.expr,
            defaultValue: (propval.default || "").toString(),
            onChange: props.onNodeUpdate,
            isProvided: true
          }));
        }
      })
    }

    body = h(
      "div",
      {},
      propEditors
    )
  }

  return h(
    "div",
    {
      className: "detailsbar"
    },
    body 
  );
}