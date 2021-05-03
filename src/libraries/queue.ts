import $ from "jquery";
import fs from "fs-extra";
import _path from "path";
import crypto from "crypto";
import stream from "stream";
import axios, {AxiosRequestConfig} from "axios";
const axiosHTTP = require("./utils/http.js");

const hashSizes : {[x: number]: string} = {32: "md5", 40: "sha1", 64: "sha256", 128: "sha512"};

var names : string[] = [];
var configs : AxiosRequestConfig[][] = [];
var fileNames : string[][] = [];
var paths : string[][] = [];
var hashes : (string|undefined)[][] = [];
var sizes : (number|undefined)[][] = [];
var resolves : Function[] = [];
var running = false;

function queueError(task: string, file: string, reason: any){
	console.log(`%cQueue Error %c(Task: "${task}", File: "${file}"):`, "color: #80f", "", reason);
}
function shorthandClose(resolve: Function, name: string, fileName: string, interval: number, readStream: stream.Readable, writeStream: fs.WriteStream, hashStream?: crypto.Hash, err?: Error): void {
	err?.toString();
	clearInterval(interval);
	queueError(name, fileName, err || "Unknown error");
	readStream.destroy();
	writeStream.close();
	hashStream?.destroy();
	resolve(false);
}

async function run(){
	running = true;
	while(names.length > 0){
		var name = names.shift() || "";
		var configArray = configs.shift() || [];
		var pathArray = paths.shift() || [];
		var hashArray = hashes.shift() || [];
		var sizeArray = sizes.shift() || [];
		var fileNameArray = fileNames.shift() || [];
		var realResolve = resolves.shift() || function(){};
		var response : {
			ok: number[],
			fail: number[]
		} = {
			ok: [],
			fail: []
		};
		$("progress#download-progress-bar").css("display", "block");
		for(var i = 0; i < configArray.length; ++i){
			let config = configArray[i];
			let path = pathArray[i];
			let hash = hashArray[i];
			let size = sizeArray[i];
			let fileName = fileNameArray[i];
			$("span#download-task").text(`${name} (${i+1} of ${configArray.length})`);
			$("span#download-name").text(fileNameArray[i]);
			$("progress#download-progress-bar").attr("value", "0");
			$("progress#download-progress-bar").attr("min", "0");
			$("progress#download-progress-bar").attr("max", "1");
			let result = await new Promise<boolean>(function(resolve){
				axios.request(config).then(function(value){
					if(!value.data){
						queueError(name, fileName, "Data stream is undefined");
						resolve(false);
					}
					var realSize = parseInt(value.headers["content-length"].toString());
					if(size != realSize){
						queueError(name, fileName, `Size mismatch (expected: ${size}, got: ${realSize})`);
						resolve(false);
					}

					var bytesRead = 0;
					var hashStream : crypto.Hash | undefined;
					var readStream : stream.Readable = value.data;
					var writeStream = fs.createWriteStream(path, {flags: "w"});
					if(hash){
						hash = hash.toLowerCase();
						hashStream = crypto.createHash(hashSizes[hash.length]);
					}
					var interval = window.setInterval(function(){
						$("progress#download-progress-bar").attr("value", bytesRead.toString());
						$("progress#download-progress-bar").attr("min", "0");
						$("progress#download-progress-bar").attr("max", realSize.toString());
					}, 250);
					readStream.on("data", function(chunk){
						bytesRead += chunk.length;
						writeStream.write(chunk);
						hashStream?.write(chunk);
					});
					readStream.on("end", function(){
						clearInterval(interval);
						$("progress#download-progress-bar").attr("value", "1");
						$("progress#download-progress-bar").attr("min", "0");
						$("progress#download-progress-bar").attr("max", "1");
						writeStream.end(function(){
							if(hash){
								var realHash = hashStream?.digest().toString("hex").toLowerCase();
								if(realHash != hash){
									queueError(name, fileName, `${hashSizes[hash.length].toUpperCase()} hash mismatch (expected: "${hash}", got: "${realHash}")`);
									resolve(false);
									return;
								}
							}
							resolve(true);
						});
					});
					readStream.on("error", err=>shorthandClose(resolve, name, fileName, interval, readStream, writeStream, hashStream, err));
					writeStream.on("error", err=>shorthandClose(resolve, name, fileName, interval, readStream, writeStream, hashStream, err));
					hashStream?.on("error", err=>shorthandClose(resolve, name, fileName, interval, readStream, writeStream, hashStream, err));
				}).catch(function(reason){
					queueError(name, fileName, reason);
					reason.toString();
					resolve(false);
				})
			});
			if(result){
				response.ok.push(i);
			}else{
				response.fail.push(i);
			}
		}
		realResolve(response);
	}
	$("span#download-task").text("No Downloads");
	$("span#download-name").text("");
	$("progress#download-progress-bar").css("display", "none");
	running = false;
}
class Task {
	private name : string;
	private configArray : AxiosRequestConfig[];
	private fileNameArray : string[];
	private pathArray : string[];
	private hashArray : (string | undefined)[];
	private sizeArray : (number | undefined)[];

	constructor(name: string){
		this.name = name;
		this.configArray = [];
		this.fileNameArray = [];
		this.pathArray = [];
		this.hashArray = [];
		this.sizeArray = [];
	}

	add(config: AxiosRequestConfig, path: string, hash?: string, size?: number, fileName?: string){
		var filename = fileName || _path.basename(path);
		config.responseType = "stream";
		config.adapter = axiosHTTP;
		this.configArray.push(config);
		this.pathArray.push(path);
		this.hashArray.push(hash);
		this.sizeArray.push(size);
		this.fileNameArray.push(filename);
		return this.configArray.length - 1;
	}

	async queue() : Promise<{ok: number[], fail: number[]}> {
		var promise = new Promise<{ok: number[], fail: number[]}>(function(resolve){
			resolves.push(resolve);
		});
		names.push(this.name);
		configs.push(this.configArray);
		paths.push(this.pathArray);
		hashes.push(this.hashArray);
		sizes.push(this.sizeArray);
		fileNames.push(this.fileNameArray);
		if(!running){
			run();
		}
		return await promise;
	}
}
export function createTask(name: string) : Task {
	return new Task(name);
}