"use client"
import React from 'react';

import { useRef, useState, useMemo, memo, ReactNode } from 'react';

// This lives outside the component, so the function isn't recreated every time component is rerendered
function reverseString(s: string) {
  const r = Array.from(s).reverse().join("")
  console.log('Reversing string:', s, 'becomes', r);
  return r;
}

export default function Session2() {
  // Most of the time, rerendering is fine! but if the app is huge, we might need to optimize.
  // Then we could use memo / useMemo for components and it would not rerender

  const [elements, setElements] = useState<string[]>([]);
  const [text, setText] = useState('');

  // React needs keys for list elements to identify what the element is, so it knows what to re-render
  // https://react.dev/learn/rendering-lists

  // TODO - next time: Why does the 1st element in the list rerender when a 2nd element is added (and so on)?
  const memoizedChildren = useMemo(() => {
    return elements.map(el => <MemoizedChild key={el} name={el}>
      {/* todo - I think it has to do w/ adding the child here, but why? */}
      <MemoizedChild name='child'/>
    </MemoizedChild>);
  }, [elements]);

  // When we don't wrap the whole list in useMemo, even if each component is a MemoizedChild,
  // they still re-render when the parent renders.
  // useMemo does not change how often something is rendered, it only prevents recalculation.
  // react memo is not a hook - it does prevent components from being rerendered.
  // https://react.dev/reference/react/memo
  // https://stackoverflow.com/questions/60453845/is-it-safe-to-usememo-for-jsx
  // todo - I still think I don't really understand this?

  // const nonMemoizedChildren = elements.map(el => <MemoizedChild key={el} name={el}>
  //   {/* todo - I think it has to do w/ adding the non-memoized child here */}
  //   <Child name='b'/>
  // </MemoizedChild>);

  return (
    <>
      <input value={text} onChange={(event) => setText(event.target.value)}></input>
      <button onClick={(event) => {setElements([...elements, text])}}>Add</button>
      {memoizedChildren}
    </>
  );
}

function Child({ name, children }: {name: string, children?: ReactNode}) {
  const [text, setText] = useState('');
  const renderCount = useRef(0);

  const inverted = useMemo(() => {
    return reverseString(name);
  }, [name]);
  // const inverted = reverseString(name);  // non-memoized will call this to get called every time

  renderCount.current++;

  return <div style={{padding: '10px', margin: '10px', border: '1px solid black'}} suppressHydrationWarning>
    Name: {name}<br/>
    Render count: {renderCount.current}<br/>
    <input value={text} onChange={(event) => setText(event.target.value)}/><br/>
    inverted: {inverted}<br/>
    children: {children}<br/>
  </div>;
}

// https://react.dev/reference/react/memo
// 2nd argument is arePropsEqual; we use React's default,
// but if you need a deep/specific thing you can pass your own
const MemoizedChild = memo(Child);
