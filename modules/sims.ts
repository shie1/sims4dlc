import { spawn } from "child_process"
import { accessSync, readFileSync } from "fs"
import { parse } from "ini"

const DLCs = parse(readFileSync("./dlc.ini", "utf-8"))

export const getPartitions = () => {
    return new Promise<string[]>((resolve) => {
        const process = spawn('cmd')
        process.stdin.write('wmic logicaldisk get name\n');
        process.stdout.on('data', (data) => {
            if (data.toString().includes('Name')) {
                const lines: Array<string> = data.toString().split("\r\n").map((item: string) => item.substring(0, 1))
                const partitions = lines.slice(1, lines.length - 2)
                resolve(partitions)
                process.stdin.end();
            }
        })
    })
}

export const isSims4Folder = (folder: string) => {
    try {
        accessSync(`${folder}\\Game\\Bin`)
        return true
    } catch (e) {
        return false
    }
}

export const locateSims4 = async () => {
    const gameFolders = [
        "Games",
        "Game",
        "Program Files (x86)",
        "Program Files",
        "Programs",
    ]
    const simsFolders = [
        "The Sims 4",
        "The Sims 4 Deluxe Edition",
        "The Sims 4 Digital Deluxe Edition",
        "Origin Games\\The Sims 4",
        "Origin Games\\The Sims 4 Deluxe Edition",
        "Origin Games\\The Sims 4 Digital Deluxe Edition",
    ]

    const sims4Folder = (await getPartitions()).map((item: string) => {
        const results: Array<string> = []
        gameFolders.map((folder: string) => {
            try {
                accessSync(`${item}:\\${folder}`)
                results.push(`${item}:\\${folder}`)
            } catch (e) {
                return undefined
            }
        })
        return results
    }).flat().map((item: string) => {
        const results: Array<string> = []
        simsFolders.map((folder: string) => {
            try {
                accessSync(`${item}\\${folder}`)
                results.push(`${item}\\${folder}`)
            } catch (e) {
                return undefined
            }
        })
        return results
    }).flat().filter(isSims4Folder).filter((item: string) => item);
    return (sims4Folder.filter(item => item) as string[]).map(item => new Sims4Instance(item))
}

export class Sims4DLC {
    public readonly installed: boolean = false
    constructor(
        public readonly instance: Sims4Instance,
        public readonly name: string,
        public readonly id: string
    ) {
        try {
            accessSync(`${instance.path}\\${id}`)
            this.installed = true
        } catch (e) {
            this.installed = false
        }
    }

    openURL() {
        spawn("explorer", [`https://www.ea.com/games/the-sims/the-sims-4/store/addons/${this.name.toLowerCase().replace(/ /g, "-")}`])
    }
}

export class Sims4Instance {
    constructor(public readonly path: string) {
    }

    getFolder() {
        return this.path
    }

    getDLCs() {
        return Object.keys(DLCs).map((item: string) => new Sims4DLC(this, DLCs[item].name, item))
    }

    launch() {
        spawn(`${this.path}\\Game\\Bin\\TS4_x64.exe`, [], {
            detached: true,
        })
    }
}