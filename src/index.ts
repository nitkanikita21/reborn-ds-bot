/* 
REBORN DISCORD BOT
*/

import { Client, GatewayIntentBits, Collection, PermissionFlagsBits, Events, } from "discord.js";
import path from "path";
import { terminal } from "terminal-kit";
import { loadCommands, registrerCommand } from "./command_loader";
import { initModules, loadModules } from "./module_loader";
import { Command, Module } from "./types";
const { Guilds, MessageContent, GuildMessages, GuildMembers } = GatewayIntentBits

terminal.underline.colorRgbHex("#00ffff", "REBORN DISCORD BOT\n")

//it's hard to asynchronously import a global module. left require
const config: { [key: string]: string } = require("../config.json");

const client: Client = new Client({ intents: [MessageContent, GuildMembers, GuildMessages, "Guilds"] })
const commands: Collection<string, Command> = loadCommands(path.join(__dirname, "./commands"), config.token, config.client, config.guild);
const modules: Module[] = loadModules(path.join(__dirname, "./modules"))


client.on("ready", () => {
    terminal.green("[📦]").white(" Initialization of all modules... \n")
    initModules(client, modules)
    terminal.black.bgColorRgbHex("#00ff00","[🔌]").white(" Bot ").green.bold(client.user.username).white(" successfully launched and is ").magenta(client.user.presence.status)("\n")
})

client.on(Events.InteractionCreate, async interaction => {
    if (!interaction.isChatInputCommand()) return;

    let cmd = commands[interaction.commandName]
    if (cmd === null) {
        await interaction.reply("Command not found!")
        return;
    }
    await cmd.execute(interaction)
});

client.login(config["token"])