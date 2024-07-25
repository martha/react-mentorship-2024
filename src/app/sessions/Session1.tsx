import { useRef, useState, ReactNode } from 'react';

export default function Session1() {
  // React rerenders if something changes in the props, or the state

  // When something changes in the parent, such as parentText,
  // ALL children are also rerendered, even if they don't depend upon that piece of state!
  const [parentText, setParentText] = useState('');

  // When we re-render Session1, Child A and Child B BOTH rerender
  // but when we re-render Child A, Child B DOES NOT re-render,
  // because it is a child of Session1, not of Child A.
  // On the other hand, Child C renders its own Child D (not passed through props!)
  // and therefore Child D re-renders every time Child C does.

  // This can be helpful in refactoring apps for performance

  return (
    <>
      Parent input: <input value={parentText} onChange={(event) => setParentText(event.target.value)}></input>
      <br/><br/>
      <Child name="a">
        <Child name="b"/>
      </Child>
      <br/>
      <Child name="c"/>
    </>
  );

  // Just for interest, here is what some React w/out TSX would look like:
  // return React.createElement("div", {},
  //   [React.createElement("input")]
  // )
}

function Child({ name, children }: {name: string, children?: ReactNode}) {
  // useRef can be used to keep a reference regardless of re-renders.
  // (this wouldn't be used in production but useful for debugging)
  // I've used useRef before when passing a component a ref to another dom element.
  // But ref doesn't have to be attached to any specific dom element;
  // it can be attached to any kind of value, in order to keep the value btwn react renders.
  const renderCount = useRef(0);
  renderCount.current++;

  // By contrast, nonRefCount never increases because it's not in a ref, so it's not persisted between renders
  let nonRefCount = 0
  nonRefCount++;

  const [text, setText] = useState('');

  return <div style={{padding: '10px', border: '1px solid black'}} suppressHydrationWarning>
    {name} input: <input value={text} onChange={(event) => setText(event.target.value)}/>
    <br/><br/>
    Render count: {renderCount.current}
    <br/>
    Non-ref count: {nonRefCount}
    <br/><br/>
    {name}'s children: {children}

    {name === 'c' && <Child name="d"/>}
  </div>;
}
