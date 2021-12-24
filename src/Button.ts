import { Rect, Text, Group } from 'react-konva';
import { createElement as h } from 'react';

export default function (props: { title: string; size: string; }) {
  const background = h(
    Rect, 
    {
      x: 0,
      y: 0,
      width: 150,
      height: 50,
      fill: "cornflowerblue"
    } 
  );
  const text = h(
    Text,
    {
      x: 20,
      y: 15,
      text: props.title
    }
  )
  return h(
    Group,
    null,
    [
      background,
      text
    ]
  )
}