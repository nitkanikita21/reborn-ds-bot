import { Collection } from "discord.js";
import * as ini from "ini";
import * as fs from "fs";
import { terminal } from "terminal-kit";
import path from "path";


export type MapInfo = {
    gamemodes: string[],
    description: string,
    priview: string
};

export function loadMapData(iniPath: string, customMapCachePath: string): Collection<string, MapInfo> {
    let map: Collection<string, MapInfo> = new Collection();

    terminal.green("[🌐] ").white("Starting to load default map information...")

    let parsedINI = ini.parse(fs.readFileSync(iniPath).toString());


    Object.values(parsedINI["MultiMaps"])
        .forEach((syspathToMap: string) => {
            map.set(syspathToMap, {
                gamemodes: parsedINI[syspathToMap]["GameModes"].split(","),
                description: parsedINI[syspathToMap]["Description"],
                priview: syspathToMap + ".png"
            })
            terminal.green("[✅] ").yellow(parsedINI[syspathToMap]["Description"] + " ").cyan(parsedINI[syspathToMap]["GameModes"].split(",").join(", "))("\n")
        })

    terminal.green("[🌐] ").white("Starting to load custom map information...")

    let parsedCustomMapCache = JSON.parse(fs.readFileSync(customMapCachePath).toString());

    Object.values(parsedCustomMapCache["maps"])
        .forEach((obj: string) => {
            map.set(obj["Name"], {
                gamemodes: obj["GameModes"],
                description: obj["Name"],
                priview: obj["PreviewPath"]
            })
            terminal.green("[✅] ").yellow(obj["Name"] + " ").cyan(obj["GameModes"].join(", "))("\n")
        })

    return map;
}