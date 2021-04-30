import React from "react";
import {remote} from "electron";
import "@/styles/WindowsTitlebar.scss"

const win = remote.getCurrentWindow();

let maximized = win.isMaximized();

const minimize = () => win.minimize();
const maximize = () => win.maximize();
const unmaximize = () => win.unmaximize();
const close = () => win.close();

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

const sourceSets = (function generateSourceSets(){
	let closeKIcons : string[] = [];
	let closeWIcons : string[] = [];
	let maxKIcons : string[] = [];
	let maxWIcons : string[] = [];
	let minKIcons : string[] = [];
	let minWIcons : string[] = [];
	let restoreKIcons : string[] = [];
	let restoreWIcons : string[] = [];
	for(let i of [10, 12, 15, 20, 24, 30]){
		closeKIcons.push(require(`@/assets/windows-icons/close-k-${i}.png`));
		closeWIcons.push(require(`@/assets/windows-icons/close-w-${i}.png`));
		maxKIcons.push(require(`@/assets/windows-icons/max-k-${i}.png`));
		maxWIcons.push(require(`@/assets/windows-icons/max-w-${i}.png`));
		minKIcons.push(require(`@/assets/windows-icons/min-k-${i}.png`));
		minWIcons.push(require(`@/assets/windows-icons/min-w-${i}.png`));
		restoreKIcons.push(require(`@/assets/windows-icons/restore-k-${i}.png`));
		restoreWIcons.push(require(`@/assets/windows-icons/restore-w-${i}.png`));
	}
	return {
		dark: {
			close: `${closeWIcons[0]} 1x, ${closeWIcons[1]} 1.25x, ${closeWIcons[2]} 1.5x, ${closeWIcons[2]} 1.75x, ${closeWIcons[3]} 2x, ${closeWIcons[3]} 2.25x, ${closeWIcons[4]} 2.5x, ${closeWIcons[5]} 3x, ${closeWIcons[5]} 3.5x`,
			max: `${maxWIcons[0]} 1x, ${maxWIcons[1]} 1.25x, ${maxWIcons[2]} 1.5x, ${maxWIcons[2]} 1.75x, ${maxWIcons[3]} 2x, ${maxWIcons[3]} 2.25x, ${maxWIcons[4]} 2.5x, ${maxWIcons[5]} 3x, ${maxWIcons[5]} 3.5x`,
			min: `${minWIcons[0]} 1x, ${minWIcons[1]} 1.25x, ${minWIcons[2]} 1.5x, ${minWIcons[2]} 1.75x, ${minWIcons[3]} 2x, ${minWIcons[3]} 2.25x, ${minWIcons[4]} 2.5x, ${minWIcons[5]} 3x, ${minWIcons[5]} 3.5x`,
			restore: `${restoreWIcons[0]} 1x, ${restoreWIcons[1]} 1.25x, ${restoreWIcons[2]} 1.5x, ${restoreWIcons[2]} 1.75x, ${restoreWIcons[3]} 2x, ${restoreWIcons[3]} 2.25x, ${restoreWIcons[4]} 2.5x, ${restoreWIcons[5]} 3x, ${restoreWIcons[5]} 3.5x`
		},
		light: {
			close: `${closeKIcons[0]} 1x, ${closeKIcons[1]} 1.25x, ${closeKIcons[2]} 1.5x, ${closeKIcons[2]} 1.75x, ${closeKIcons[3]} 2x, ${closeKIcons[3]} 2.25x, ${closeKIcons[4]} 2.5x, ${closeKIcons[5]} 3x, ${closeKIcons[5]} 3.5x`,
			max: `${maxKIcons[0]} 1x, ${maxKIcons[1]} 1.25x, ${maxKIcons[2]} 1.5x, ${maxKIcons[2]} 1.75x, ${maxKIcons[3]} 2x, ${maxKIcons[3]} 2.25x, ${maxKIcons[4]} 2.5x, ${maxKIcons[5]} 3x, ${maxKIcons[5]} 3.5x`,
			min: `${minKIcons[0]} 1x, ${minKIcons[1]} 1.25x, ${minKIcons[2]} 1.5x, ${minKIcons[2]} 1.75x, ${minKIcons[3]} 2x, ${minKIcons[3]} 2.25x, ${minKIcons[4]} 2.5x, ${minKIcons[5]} 3x, ${minKIcons[5]} 3.5x`,
			restore: `${restoreKIcons[0]} 1x, ${restoreKIcons[1]} 1.25x, ${restoreKIcons[2]} 1.5x, ${restoreKIcons[2]} 1.75x, ${restoreKIcons[3]} 2x, ${restoreKIcons[3]} 2.25x, ${restoreKIcons[4]} 2.5x, ${restoreKIcons[5]} 3x, ${restoreKIcons[5]} 3.5x`
		}
	}
})();

const WindowsTitlebar = (props: {dark: boolean}) => {
	return (
		<div className={`windows-titlebar ${props.dark ? "dark" : "light"}`}>
			<div className="buttons">
				<div onClick={minimize}>
					<img srcSet={props.dark ? sourceSets.dark.min : sourceSets.light.min} draggable="false" />
				</div>
				<div onClick={unmaximize}>
					<img srcSet={props.dark ? sourceSets.dark.restore : sourceSets.light.restore} draggable="false" />
				</div>
				<div onClick={maximize}>
					<img srcSet={props.dark ? sourceSets.dark.max : sourceSets.light.max} draggable="false" />
				</div>
				<div onClick={close}>
					<img srcSet={props.dark ? sourceSets.dark.close : sourceSets.light.close} draggable="false" />
				</div>
			</div>
		</div>
	);
}

export default WindowsTitlebar;