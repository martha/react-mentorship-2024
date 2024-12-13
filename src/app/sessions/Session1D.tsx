import { useRef, useState, ReactNode } from 'react';

export default function Parent() {
  const renderCount = useRef(0);
  renderCount.current++;

  const [parentText, setParentText] = useState('');

  return (
    <>
      Parent input: <input value={parentText} onChange={(event) => setParentText(event.target.value)}></input>
      <br/><br/>
      Render count: {renderCount.current}
      <br/><br/>
      <Child name="A">
        <Child name="B"></Child>
      </Child>
    </>
  );
}

function Child({ name, children }: {name: string, children?: ReactNode}) {
  const renderCount = useRef(0);
  renderCount.current++;

  const [text, setText] = useState('');

  return <div style={{padding: '10px', border: '1px solid black'}} suppressHydrationWarning>
    Child {name} input: <input value={text} onChange={(event) => setText(event.target.value)}/>
    <br/><br/>
    Render count: {renderCount.current}
    <br/><br/>
    {name}'s children: {children}
  </div>;
}
