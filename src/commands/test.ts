import { Interaction, CacheType, SlashCommandBuilder, SlashCommandUserOption, SlashCommandStringOption, PermissionFlagsBits, CommandInteraction, ChannelType } from "discord.js";
import { Command, DescriptedCommand } from "../types";

export default {
    name(): string {
        return "clear"
    },
    slashCommand(): SlashCommandBuilder {
        return new SlashCommandBuilder()
            .setName(this.name())
            .setDescription(this.description())

            .addIntegerOption(option => {
                return option
                    .setMaxValue(100)
                    .setMinValue(1)
                    .setName("messagecount")
                    .setRequired(true)
                    .setDescription("Message amount to be cleared")
            })
            .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
            ;
    },
    async execute(interaction: CommandInteraction) {
        let messageCount = Number(interaction.options.get("messagecount")?.value)
        let msgs = await interaction.channel.messages.fetch({limit: messageCount})

        const deletedMessages = await interaction.channel?.bulkDelete(msgs,true)   
        if (deletedMessages?.size === 0) interaction.reply("No messages were deleted.")       
        else interaction.reply(`Successfully deleted ${deletedMessages?.size} message(s)`)
        setTimeout(() => interaction.deleteReply(), 5000)
    },


    description(): string {
        return "my cool command";
    },
    title(): string | null {
        return null;
    },
    example(): string | null {
        return null;
    },
} as (Command & DescriptedCommand)