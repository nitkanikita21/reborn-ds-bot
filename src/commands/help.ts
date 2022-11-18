import { SlashCommandBuilder, PermissionFlagsBits, CommandInteraction } from "discord.js";
import { Command, DescriptedCommand } from "../types";

export default {
    name(): string {
        return "help"
    },
    slashCommand(): SlashCommandBuilder {
        return new SlashCommandBuilder()
            .setName(this.name())
            .setDescription(this.description())

            
            ;
    },
    async execute(interaction: CommandInteraction) {
        
    },


    description(): string {
        return "help command";
    },
    title(): string | null {
        return null;
    },
    example(): string | null {
        return null;
    },

} as (Command & DescriptedCommand)