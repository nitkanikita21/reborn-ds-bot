import { Collection, REST, RESTPostAPIChatInputApplicationCommandsJSONBody, Routes } from "discord.js";
import * as fs from 'fs';
import * as path from 'path';
import { terminal } from "terminal-kit";
import { Command } from "./types";

const {allowedModuleTypes} = require("../config.json");

export function loadCommands(pathCommandDir: string, token: string, clientId: string, guildId: string): Collection<string, Command> {
    let commands: Collection<string, Command> = new Collection();
    let commandArray: RESTPostAPIChatInputApplicationCommandsJSONBody[] = []

    terminal.green("[/] ").white("Started loading application (/) commands.\n")
    fs.readdirSync(pathCommandDir).forEach((filename: string) => {
        let filenameSplit: string[] = filename.split("."); 
        let extname: string = filenameSplit[filenameSplit.length - 1];

        if (!allowedModuleTypes.includes(extname)) {
            terminal.red("[❌] ").white("file ").red.bold(filename).white(" is not command!\n")
            return;
        }
        let importedCommand: Command = require(path.join(pathCommandDir, filename)).default as Command;

        terminal.green("[👌] ").white("success loaded ").yellow.bold(importedCommand.name()).white(" (/) command!\n")
        commands[importedCommand.name()] = importedCommand;
        commandArray.push(importedCommand.slashCommand().toJSON())
    })

    registrerCommand(commandArray, token, clientId, guildId)
    terminal("\n")


    return commands;
}

export async function registrerCommand(commands: RESTPostAPIChatInputApplicationCommandsJSONBody[], token: string, clientId: string, guildId: string) {
    const rest = new REST({ version: '10' }).setToken(token);

    try {
		// console.log(`Started refreshing ${commands.length} application (/) commands.`);
        terminal.green("[📨] ").white("Started refreshing ").yellow(commands.length).white(" application (/) commands.\n")

		// The put method is used to fully refresh all commands in the guild with the current set
		const data: ({[key: string]: any}) = await rest.put(
			Routes.applicationGuildCommands(clientId, guildId),
			{ body: commands },
		);

		// console.log(`Successfully reloaded ${data.length} application (/) commands.`);
        terminal.green("[✔] ").white("Successfully reloaded ").yellow(data.length).white(" application (/) commands.\n")
	} catch (error) {
		// And of course, make sure you catch and log any errors!
		console.error(error);
	}
    terminal("\n")
}