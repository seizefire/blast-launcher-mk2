import os from 'os';
import React from 'react';
import ReactDOM from 'react-dom';

import "@/libraries/window";
import "@/styles/main.scss";
import "@/styles/footer.scss";

if(process.platform == "win32" && os.release().startsWith("10.")){
	document.querySelector("div#windows-10-titlebar")?.setAttribute("style", "display: block;");
}