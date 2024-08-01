"use client"
import React, { useCallback } from 'react';

import { useRef, useState, useMemo, memo, ReactNode } from 'react';

// This lives outside the component, so the function isn't recreated every time component is rerendered
function reverseString(s: string) {
  const r = Array.from(s).reverse().join("")
  console.log('Reversing string:', s, 'becomes', r);
  return r;
}

export default function Session3() {
  // {} === {} is false
  // function test() {} === function test() {} is also false
  // this is why we need useCallback

  const [elements, setElements] = useState<string[]>([]);
  const [text, setText] = useState('');

  // Clear is always new every render, because a function never equals another function
  // that's why we need useCallback
  // const clear = () => {
  //   setText('');
  // }
  const clear = useCallback(() => {
    setText('');
  }, [setText]);

  // Should we use useCallback every time?
  // - don't use it unless we really need it; it's adding complexity and making the code harder to read
  // - other devs/teams might have different opinions
  // https://react.dev/reference/react/useCallback#should-you-add-usecallback-everywhere
  // the function is still created newly every time,
  // but react ignores it and passes the cached version.

  // React needs keys for list elements to identify what the element is, so it knows what to re-render
  // https://react.dev/learn/rendering-lists

  // children is not the same between renders
  // array is not equal to the other array
  // react's custom comparator does not check for children at next level down(?)
  const memoizedGrandchild = useMemo(() => {
    return <MemoizedChild clear={clear} name='child'/>;
  }, [])

  // TODO - next time: Why does the 1st element in the list rerender when a 2nd element is added (and so on)?
  const memoizedChildren = useMemo(() => {
    return elements.map(el => <MemoizedChild key={el} name={el} clear={clear}>
      {/* todo - I think it has to do w/ adding the child here, but why? */}
      {memoizedGrandchild}
    </MemoizedChild>);
  }, [elements, clear, memoizedGrandchild]);

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

function Child({ name, children, clear }: {name: string, children?: ReactNode, clear: VoidFunction}) {
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
    <button onClick={clear}>Clear</button><br/>
    <input value={text} onChange={(event) => setText(event.target.value)}/><br/>
    inverted: {inverted}<br/>
    children: {children}<br/>
  </div>;
}

// https://react.dev/reference/react/memo
// 2nd argument is arePropsEqual; we use React's default,
// but if you need a deep/specific thing you can pass your own
const MemoizedChild = memo(Child);
