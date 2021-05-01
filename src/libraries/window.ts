import {remote} from "electron";
import "@/styles/window.scss"

const win = remote.getCurrentWindow();

var maximized = win.isMaximized();

win.on("maximize", function(){
	maximized = true;
	document.body.classList.add("maximized");
});
win.on("unmaximize", function(){
	maximized = false;
	document.body.classList.remove("maximized");
})
window.addEventListener("beforeunload", function(){
	win.removeAllListeners("maximize");
	win.removeAllListeners("unmaximize");
});
document.querySelectorAll("div.minimize-button").forEach(function(element){
	element.addEventListener("click", ()=>win.minimize());
});
document.querySelectorAll("div.unmaximize-button").forEach(function(element){
	element.addEventListener("click", ()=>win.unmaximize());
});
document.querySelectorAll("div.maximize-button").forEach(function(element){
	element.addEventListener("click", ()=>win.maximize());
});
document.querySelectorAll("div.close-button").forEach(function(element){
	element.addEventListener("click", ()=>close());
});