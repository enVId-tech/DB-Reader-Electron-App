import {createRoot, Root} from 'react-dom/client';
import Main from "./pages/Main";
import React from "react";

const root: Root = createRoot(document.body);
root.render(<Main/>);