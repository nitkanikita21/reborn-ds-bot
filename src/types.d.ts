import { Client, CommandInteraction, SlashCommandBuilder } from "discord.js";
import { type } from "os";

export interface Command {
    name(): string
    slashCommand(): SlashCommandBuilder
    execute(interaction: CommandInteraction)
}
export interface DescriptedCommand {
    description(): string
    title(): string | null
    example(): string | null
}

export type Module = ((client: Client) => void)