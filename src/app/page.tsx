"use client"
import React from 'react';

import { useRef, useState, useMemo, memo } from 'react';

// move outside the component, so the function isn't recreated every time child is rerendered
function reverseString(s: string) {
  console.log('reverse string here', s);
  return Array.from(s).reverse().join("")
}
// object is not equal to an object

export default function Home() {

  // when something changes in the parent, ALL children are also rerendered
  // even if they don't depend upon that piece of state!
  const [text, setText] = useState('');

  // most of the time, rerender is fine! but if the app is huge, we might need to optimize
  // then we could use useMemo for child component and it would not rerender

  // when we re-render Home, Child A and Child B BOTH rerender
  // but when we re-render Child A, Child B DOES NOT re-render, because it is a child of Home, not of Child A

  // react only rerenders if we change something in the props, or the state

  const [elements, setElements] = useState<string[]>([]);

  // recreate vs. re-render? https://react.dev/learn/rendering-lists
  // react needs key to identify what the component is, so they know what to re-render

  // TODO - next time
  // Why does the 1st element in the list rerender when a 2nd element is added (and so on)?
  const memoizedChildren = useMemo(() => {
    return elements.map(el => <MemoizedChild key={el} name={el}>{el}<Child name='b'></Child></MemoizedChild>);
  }, [elements]);

  return (
    <div>
      <button onClick={(event) => {setElements([...elements, text])}}>Add</button>
      <input value={text} onChange={(event) => setText(event.target.value)}></input>
      {memoizedChildren}

      {/* <Child name="a">
        <Child name="b">

        </Child>
      </Child> */}
    </div>
  );

  // return React.createElement("div", {},
  //   [React.createElement("input")]
  // )
}

function Child({ name, children }) {
  // useRef can be used to keep a reference regardless of re-renders
  // not recommended in production but just for us to learn
  const [text, setText] = useState('');
  const renderCount = useRef(0);
  // ref doesn't have to be attached to any specific dom element
  // it can be attached to any kind of value, and keep the value btwn react renders


  // useMemo does not change how often something is rendered, it only prevents recalculation
  // it's uncommon to use useMemo to return a react node, could just use react's memo instead?
  // react memo is not a hook - it does prevent components from being rerendered
  // https://react.dev/reference/react/memo
  const inverted = useMemo(() => {
    return reverseString(name);
  }, [name]);
  // const inverted = reverseString(name);

  renderCount.current++;

  // let renderCount2 = 0
  // renderCount2 ++;

  // hydration??
  return <div suppressHydrationWarning>
    Name: {name}<br/>
    Render count: {renderCount.current}<br/>
      <input value={text} onChange={(event) => setText(event.target.value)}></input>
    {/* Render count 2: {renderCount2} */}
    <br/>
    children: {children}<br/>
    inverted: {inverted}
  </div>;
}

const MemoizedChild = memo(Child);
// react has default arePropsEqual, but if you need a deep/specific thing you can pass your own