import { Client, Collection } from "discord.js";
import { Command, Module } from "./types";

import * as fs from "fs";
import { terminal } from "terminal-kit";
import path from "path";

const {allowedModuleTypes} = require("../config.json");

export function loadModules(pathToModules: string): Module[] {
    let modules: Module[] = [];

    terminal.green("[📦] ").white("Started loading bot modules!\n")
    fs.readdirSync(pathToModules).forEach(filename => {
        let filenameSplit: string[] = filename.split("."); 
        let extname: string = filenameSplit[filenameSplit.length - 1];

        if (!allowedModuleTypes.includes(extname)) {
            terminal.red("[❌] ").white("file ").red.bold(filename).white(" is not module!\n")
            return;
        }

        let importedModule: Module = require(path.join(pathToModules, filename)).default as Module;
        modules.push(importedModule)
        terminal.green("[👌] ").white("success loaded ").yellow.bold(path.parse(filename).name).white(" module!\n")
    })
    terminal("\n")

    return modules;
}

export function initModules(client: Client, modules: Module[]) {
    modules.forEach((module) => {
        module(client)
    })
    terminal.green("[✔] ").white("success inited all modules!\n")
    terminal("\n")
}