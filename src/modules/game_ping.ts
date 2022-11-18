import { Attachment, AttachmentBuilder, blockQuote, Client, codeBlock, Collection, EmbedBuilder, Message, MessageEditOptions, TextChannel } from "discord.js";

import * as irc from "irc";
import * as fs from "fs";
import path from "path";
import { loadMapData, MapInfo } from "../utils/map_manager";

const { irc_server, irc_nick, game_broadcast_channel, chat_channel, guild, channel_ping } = require("../../config.json");

const games: ({ [key: string]: { msg: Message, interval: NodeJS.Timeout } }) = {};

let channelBroadcast: TextChannel = null;

let maps: Collection<string, MapInfo> = new Collection();

export default function (client: Client) {
    maps = loadMapData(
        path.join(__dirname, "../../data/MPMaps.ini"),
        path.join(__dirname, "../../data/custom_map_cache")
    );

    const ircClient = new irc.Client(irc_server, irc_nick, {
        channels: [
            `#${chat_channel}`, `#${game_broadcast_channel}`
        ]
    });

    channelBroadcast = client
        .guilds.cache.find(g => g.id === guild)
        .channels.cache.find(c => c.id === channel_ping) as TextChannel;

    ircClient.addListener("registered", function (msg) {
        ircClient.join(`#${chat_channel}`)
        ircClient.join(`#${game_broadcast_channel}`)
    })

    ircClient.addListener('ctcp-notice', async function (from: string, _, text: string, __) {
        // console.log(`${from}=>: ${text}\n`);

        let splitted_msg = text.split(";")

        const gameVersion = splitted_msg[1];
        const maxPlayers = splitted_msg[2];
        const gameName = splitted_msg[4];

        const is_locked = splitted_msg[5][0] == '1';
        const is_passworded = splitted_msg[5][1] == '1';

        const players = splitted_msg[6].split(",")
        const map = splitted_msg[7];
        const gameMode = splitted_msg[8];
        const embed = new EmbedBuilder()
            .setTitle(
                (is_locked ? "🔒 " : "") +
                (is_passworded ? "🔑 " : "") +
                gameName
            )
            .addFields(
                {
                    name: `Players ${players.length}/${maxPlayers}`, value: codeBlock(players.join("\n")), inline: true
                },

                {
                    name: `Game info`, value: [
                        `Gamemode: \`${gameMode}\``,
                        `Map: \`${map}\``
                    ].join("\n"), inline: true
                }
            )/* 
            .setDescription([
                "[Скачать](https://mega.nz/#!rIAWyAjT!O3-2wPzwIEQwnvQypBXwvwjlScu6PICt16xiRgsMT7k)",
                "[Советы по игре](https://m.vk.com/topic-103798106_32741115)"
            ].join(" 🔹 ")) */
            .setThumbnail("https://cdn.discordapp.com/avatars/966086608577253386/d8380b9a72aadc51b22ed6bb295c45f1.png?size=1024")
            .setFooter({ text: `Red Aler 2: Reborn | v${gameVersion}`, iconURL: 'https://cdn.discordapp.com/avatars/966086608577253386/d8380b9a72aadc51b22ed6bb295c45f1.png?size=1024' });


        let mapInfo = maps.find((search) => {
            return search.description === map && search.gamemodes.includes(gameMode)
        })

        let editMsg: MessageEditOptions = { embeds: [embed], files: [] };

        if (mapInfo != null) {
            const base64Image = fs.readFileSync(path.join(__dirname, "../../data/", mapInfo.priview))
            editMsg.files.push(
                new AttachmentBuilder(base64Image)
                .setName("preview.png")
            )

            embed.setImage('attachment://preview.png')
        }

        if (games[gameName] == undefined) {
            games[gameName] = { msg: null, interval: null }
            games[gameName].msg = await channelBroadcast.send(editMsg)
        } else {
            games[gameName].msg = await games[gameName].msg.edit(editMsg)
            clearTimeout(games[gameName].interval)
        }

        games[gameName].interval = setTimeout(() => {
            games[gameName].msg.delete()
            games[gameName] = undefined
        }, 35 * 1000);


    });
    ircClient.addListener(`message#${chat_channel}`, function (from, message) {
        console.log(from + ' => #yourchannel: ' + message);
    })
}