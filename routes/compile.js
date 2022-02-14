"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
/*
 * GET home page.
 */
const express = require("express");
const https = require("https");
const agent = new https.Agent({
    rejectUnauthorized: false
});
const router = express.Router();
//const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));
const asc = require("assemblyscript/cli/asc");
//import includeBytesTransform from "visitor-as/dist/examples/includeBytesTransform.js";
//import bindgen from "near-bindgen-as";
//import exportAs from "visitor-as/dist/examples/exportAs.js";
// @ts-ignore
//import { value_return } from "near-sdk-core/assembly/env/env";
/*import * as xx from "near-sdk-bindgen/dist";*/
router.get('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var data = yield compileContractTest();
    res.json(JSON.stringify(data));
}));
exports.default = router;
function fetch(url) {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise((resolve, reject) => {
            const req = https.get(url, res => {
                const chunks = [];
                res.on('data', data => chunks.push(data));
                res.on('end', () => {
                    let resBody = Buffer.concat(chunks);
                    resolve(resBody.toString());
                });
            });
            req.on('error', reject);
            //if (body) {
            //	req.write(body);
            //}
            req.end();
        });
    });
}
var fileSystem = {};
//var localTransforms = [new includeBytesTransform(), new bindgen(), new exportAs()];
//var localTransforms = [];
//async function compileContractTest() {
//	//for (var i = 0; i < localTransforms.length; i++) {
//	//	localTransforms[i].program = Program;
//	//}
//	//value_return(1, 2);
//	return await compileContract(`
//export function getRando(): string {
//	return "Hello world";
//}`);
//}
function compileContractTest() {
    return __awaiter(this, void 0, void 0, function* () {
        return yield compileContract(`
import { context, storage, logging, u128, PersistentUnorderedMap, ContractPromiseBatch } from "near-sdk-as";
@nearBindgen
export class BottleOfWine {
  id: u32;
  status : u32; //0 - produced, 1 - shipped, 2 - inDistribution, 3 - bought
  type: u32;
  price: u64;
  year: u32;
  name: string;
  producer: string;
  reseller: string;
  client: string;
  constructor(id : u32, name : string, year : u32, type : u32) {
	this.id = id;
	this.year = year;
	this.name = name;
	this.type = type;
  }
}
const owner : string = "silverbot.testnet";
const items = new PersistentUnorderedMap<u32, BottleOfWine>("a");
const producerList = new PersistentUnorderedMap<string, bool>("b");
const resellerList = new PersistentUnorderedMap<string, bool>("c");
function _getNextId(): u32 {
	const newCounter = storage.getPrimitive<u32>("counter", 0) + 1;
	storage.set<u32>("counter", newCounter);
	logging.log("Counter is now: " + newCounter.toString());
	return newCounter;
}
function _assertOnlyProducer(item: BottleOfWine): void {
	let producer = item.producer;
	if (producer)
	{
		assert(producer == context.sender, "Invalid producer");
		return;
	}
	assert(producerList.contains(context.sender), "Producer expected");
	item.producer = context.sender;
}
function _assertOnlyReseller(item: BottleOfWine): void {
	let reseller = item.reseller;
	if (reseller)
	{
		assert(reseller == context.sender, "Invalid reseller");
		return;
	}
	assert(resellerList.contains(context.sender), "Reseller expected");
	item.reseller = context.sender;
}
function _assertStatus(item: BottleOfWine, status : u32): void {
	assert(item.status == status, "Cannot run Workflow action; unextected status");
}
function _assertValidItem(id : u32) : BottleOfWine
{
	const item = items.get(id);
	assert(item, "Cannot find item with given id");
	return item!;
}
export function getItem(id : u32) : BottleOfWine {
	return _assertValidItem(id);
}
export function test() : u32 {
	return _getNextId();
}
export function addProducer(address : string) : void {
	assert(context.sender == owner, "Only contract owner can add a producer");
	producerList.set(address, true);
}
export function addReseller(address : string) : void {
	assert(context.sender == owner, "Only contract owner can add a reseller");
	resellerList.set(address, true);
}
export function create(name : string, year : u32, type : u32): u32 {
	const id = _getNextId();
	const item = new BottleOfWine(id, name, year, type);
	_assertOnlyProducer(item);
	items.set(id, item);
	return id;
}
export function ship(id : u32, reseller : string): u32 {
	const item = _assertValidItem(id);
	_assertOnlyProducer(item);
	_assertStatus(item, 0);
	item.reseller = reseller;
	item.status = 1;
	items.set(id, item);
	return item.status;
}
export function distribute(id : u32, price : u64): void {
	const item = _assertValidItem(id);
	_assertOnlyReseller(item);
	_assertStatus(item, 1);
	item.price = price;
	item.status = 2;
	items.set(id, item);
}
export function buy(id : u32): void {
	const client = context.sender;
	const deposit:u128 = context.attachedDeposit;
	const item = _assertValidItem(id);
	_assertStatus(item, 2);
	item.client = client;
	item.status = 3;
	const priceToPay:u128 = u128.fromU64(item.price);
	assert(deposit >= priceToPay, "Not enough deposit");
	ContractPromiseBatch.create(item.reseller).transfer(priceToPay);
	items.set(id, item);
}
`);
    });
}
function compileContract(contractContent) {
    return __awaiter(this, void 0, void 0, function* () {
        yield Promise
            .all([
            precludeWebDir("assemblyscript-temporal", "https://localhost:5001/cdn/assemblyscript-temporal-2.2.3/", "https://localhost:5001/cdn/assemblyscript-temporal-2.2.3/", "https://localhost:5001/cdn/assemblyscript-temporal-2.2.3/"),
            precludeWebDir("assemblyscript-regex", "https://localhost:5001/cdn/assemblyscript-regex-1.6.4/", "https://localhost:5001/cdn/assemblyscript-regex-1.6.4/", "https://localhost:5001/cdn/assemblyscript-regex-1.6.4/"),
            precludeWebDir("near-sdk-as", "https://localhost:5001/cdn/near-sdk-as-3.2.3/", "https://localhost:5001/cdn/near-sdk-as-3.2.3/", "https://localhost:5001/cdn/near-sdk-as-3.2.3/"),
            precludeWebDir("near-mock-vm", "https://localhost:5001/cdn/near-mock-vm-3.2.2/", "https://localhost:5001/cdn/near-mock-vm-3.2.2/", "https://localhost:5001/cdn/near-mock-vm-3.2.2/"),
            precludeWebDir("as-bignum", "https://localhost:5001/cdn/as-bignum-0.2.18/", "https://localhost:5001/cdn/as-bignum-0.2.18/", "https://localhost:5001/cdn/as-bignum-0.2.18/"),
            precludeWebDir("near-sdk-core", "https://localhost:5001/cdn/near-sdk-core-3.2.1/", "https://localhost:5001/cdn/near-sdk-core-3.2.1/", "https://localhost:5001/cdn/near-sdk-core-3.2.1/"),
            precludeWebDir("assemblyscript-json", "https://localhost:5001/cdn/assemblyscript-json-1.2.0/", "https://localhost:5001/cdn/assemblyscript-json-1.2.0/", "https://localhost:5001/cdn/assemblyscript-json-1.2.0/"),
            precludeWebDir("near-sdk-bindgen", "https://localhost:5001/cdn/near-sdk-bindgen-3.2.1/", "https://localhost:5001/cdn/near-sdk-bindgen-3.2.1/", "https://localhost:5001/cdn/near-sdk-bindgen-3.2.1/")
        ]);
        return yield new Promise((resolve, reject) => {
            asc.ready.then(() => {
                console.log("\nCompiling...");
                const stdout = asc.createMemoryStream();
                const stderr = asc.createMemoryStream();
                asc.main([
                    "module.ts",
                    "-O3",
                    "--runtime", "stub",
                    "--binaryFile", "module.wasm",
                    "--textFile", "module.wat",
                    //"--lib", "near-sdk-as/as_types.d.ts",
                    //"--lib", "near-sdk-core/assembly/as_types",
                    //"--transform", "visitor-as/dist/examples/includeBytesTransform.js,near-sdk-bindgen,visitor-as/dist/examples/exportAs.js",
                    //"--entries", "near-sdk-as/assembly/bindgen.ts",
                    "--sourceMap"
                    //], { transforms: ["visitor-as/dist/examples/includeBytesTransform.js", "near-sdk-bindgen", "visitor-as/dist/examples/exportAs.js"],
                ], {
                    //transforms: localTransforms,
                    stdout: stdout,
                    stderr: stderr,
                    readFile(name, baseDir) {
                        name = name.replace(/\\/g, "/");
                        if (baseDir !== undefined) {
                            baseDir = baseDir.replace(/\\/g, "/");
                        }
                        name = name.replace(/.*node_modules\//ig, "");
                        if (name === "module.ts")
                            return contractContent;
                        if (name === "asconfig.json")
                            //return null;
                            return `{
							"entry": "module.ts",
							"targets": {
							    "release": {
							      "optimizeLevel": 3,
							      "shrinkLevel": 3
							    },
							    "debug": {
							      "debug": true
							    }
							  },
							"options": {
								"binaryFile": "module.wasm",
    "strictNullChecks": true,
							    "runtime": "stub",
								"transform": ["visitor-as/dist/examples/includeBytesTransform.js", "near-sdk-bindgen", "visitor-as/dist/examples/exportAs.js"],
							    "lib": "near-sdk-as/assembly/json.lib.ts"
							},
							"entries": ["near-sdk-as/assembly/bindgen.ts"]
						}`;
                        //if (name === "json.lib.ts") {
                        //	name = "near-sdk-as/assembly/json.lib.ts";
                        //}
                        //if (name === "as_types.d.ts") {
                        //	name = "near-sdk-core/assembly/as_types.d.ts";
                        //}
                        if (name === "json.lib.ts") {
                            name = "near-sdk-as/assembly/json.lib.ts";
                        }
                        //if (baseDir !== undefined && baseDir.includes("\\")) {
                        //	name = baseDir.replace(/\\/g, "/") + "/" + name;
                        //}
                        if ((baseDir === "near-sdk-as/assembly/json.lib.ts" || baseDir === "near-sdk-as/as_types.d.ts") && !name.includes("/assembly/")) {
                            name = name
                                .replace("near-sdk-as/", "near-sdk-as/assembly/")
                                .replace("assemblyscript-json/", "assemblyscript-json/assembly/")
                                .replace("near-sdk-core/", "near-sdk-core/assembly/")
                                .replace("near-mock-vm/", "near-mock-vm/assembly/")
                                .replace("assemblyscript-temporal/", "assemblyscript-temporal/assembly/")
                                .replace("assemblyscript-regex/", "assemblyscript-regex/assembly/")
                                .replace("as-bignum/", "as-bignum/assembly/")
                                .replace("near-sdk-bindgen/", "near-sdk-bindgen/assembly/");
                        }
                        var file = fileSystem[name];
                        if (file === "") {
                            return null;
                        }
                        if (file == undefined) {
                            return null;
                            //throw 'cannot find ' + name;
                        }
                        return file;
                    },
                    writeFile(name, data, baseDir) {
                        console.log(`>>> WRITE:${name} >>>\n${data.length}`);
                        if (name === "module.wasm") {
                            resolve(data);
                        }
                    },
                    listFiles(dirname, baseDir) {
                        return [];
                        //return ["near-sdk-core/assembly/as_types.d.ts", "near-sdk-core/assembly/env/env.ts" ];
                    }
                }, (err) => {
                    console.log(`>>> STDOUT >>>\n${stdout.toString()}`);
                    console.log(`>>> STDERR >>>\n${stderr.toString()}`);
                    if (err) {
                        console.log(">>> THROWN >>>");
                        console.log(stderr.toString());
                        reject(stderr.toString() + "\r\n" + stdout.toString());
                    }
                    return 1;
                });
            });
        });
    });
}
function processJsDelivrDirectory(name, baseUrl, directory) {
    return __awaiter(this, void 0, void 0, function* () {
        fileSystem[name + ".ts"] = "";
        yield Promise.all(directory.files.map((node) => __awaiter(this, void 0, void 0, function* () {
            if (node.type === "file") {
                var fileText = yield fetch(baseUrl + "/" + node.name);
                fileSystem[name + "/" + node.name] = fileText;
            }
            if (node.type === "directory") {
                yield processJsDelivrDirectory(name + "/" + node.name, baseUrl + "/" + node.name, node);
            }
        })));
    });
}
function precludeJsDelivr(name, url, baseUrl) {
    return __awaiter(this, void 0, void 0, function* () {
        var rootText = yield fetch(url);
        var rootJson = JSON.parse(rootText);
        yield processJsDelivrDirectory(name, baseUrl, rootJson);
    });
}
function precludeWebDir(name, url, rootUrl, baseUrl) {
    return __awaiter(this, void 0, void 0, function* () {
        var relativeUrl = name + "/" + url.replace(rootUrl, "");
        var nameKey = relativeUrl.substring(0, relativeUrl.length - 1) + ".ts";
        fileSystem[nameKey] = "";
        var rootText = yield fetch(url);
        var linkRegex = /class="name"><a href="([^"]*)">/ig;
        var links = [...rootText.matchAll(linkRegex)];
        yield Promise.all(links.map((node) => __awaiter(this, void 0, void 0, function* () {
            var nodeUrl = node[1].replace("./", url);
            var shortFileName = nodeUrl.replace(baseUrl, "");
            if (nodeUrl.endsWith("/")) {
                yield precludeWebDir(name, rootUrl + shortFileName, rootUrl, baseUrl);
            }
            else {
                if (!shortFileName.endsWith(".wat") && !shortFileName.endsWith(".dat")) {
                    var fileText = yield fetch(rootUrl + shortFileName);
                    fileSystem[name + "/" + shortFileName] = fileText;
                }
            }
        })));
    });
}
//# sourceMappingURL=compile.js.map