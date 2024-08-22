"use client"
import React from 'react';
import FormBuilder from './homework/reproBug/FormTree';
import Demo from './homework/felipe/CodeSandbox';

export default function Home() {
  return (
    < FormBuilder />
  );
}

// export default function Home() {
//   const [products, dispatch] = React.useReducer(
//     reducer,
//     DEFAULT_MUI_X_PRODUCTS
//   );

//   return (
//     <Box sx={{ minHeight: 352, minWidth: 250 }}>
//       <TreeItemDispatchContext.Provider value={dispatch}>
//         <RichTreeView
//           items={products}
//           aria-label="customized"
//           defaultExpandedItems={DEFAULT_EXPANDED_ITEMS}
//           slots={{ item: CustomTreeItem }}
//         />
//       </TreeItemDispatchContext.Provider>
//     </Box>
//   );
// }