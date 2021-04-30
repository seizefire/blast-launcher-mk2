import os from 'os';
import React from 'react';
import ReactDOM from 'react-dom';
import WindowsTitlebar from '@/components/WindowsTitlebar';

import "@/styles/Main.scss";

console.log(process.platform, process.platform=="win32");
console.log(os.release(), os.release().startsWith("10."));

if(process.platform == "win32" && os.release().startsWith("10.")){
	ReactDOM.render(<WindowsTitlebar dark={true}/>, document.querySelector("div#root"));
}