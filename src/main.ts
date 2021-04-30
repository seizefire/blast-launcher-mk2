import os from "os";
import { app, BrowserWindow } from 'electron';

const createWindow = (): void => {
	let win = new BrowserWindow({
		width: 800,
		height: 600,
		frame: !(process.platform == "win32" && os.release().startsWith("10.")),
		webPreferences: {
			nodeIntegration: true,
			contextIsolation: false,
			enableRemoteModule: true
		}
	});
	win.setMenuBarVisibility(false);
	win.loadFile('index.html');
}

app.on('ready', createWindow);