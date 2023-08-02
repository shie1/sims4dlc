import { spawn } from "child_process"
import { accessSync, readFileSync } from "fs"
import { parse } from "ini"
import { globSync } from "fast-glob"
import { join } from "path"

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

    openFolder() {
        if (!this.installed) {
            return false
        }
        spawn('explorer', [`${this.instance.path}\\${this.id}`], {
            detached: true,
        })
        return true
    }
}

export class Sims4Instance {
    constructor(public readonly path: string) {
    }

    getFolder() {
        return this.path
    }

    getDLCs() {
        return Object.keys(DLCs).map((item: string) => new Sims4DLC(this, DLCs[item]["Name_en_US"], item))
    }

    launch() {
        spawn(`${this.path}\\Game\\Bin\\TS4_x64.exe`, [], {
            detached: true,
        })
    }
}

export const isDLCDrive = (drive: string) => {
    try {
        accessSync(`${drive}\\EP01\\Worlds\\Areas\\EP01_AlienWorld_01.world`)
    } catch (e) {
        return false
    }
    return true
}

export const getDLCDrive = async () => {
    const drives = await getPartitions()
    const dlcDrive = drives.filter(isDLCDrive)
    if (dlcDrive.length === 0) {
        return undefined
    }
    return new DLCDrive(dlcDrive[0])
}

export const getDownloadsFolder = () => {
    // (New-Object -ComObject Shell.Application).NameSpace('shell:Downloads').Self.Path
    return new Promise<string>((resolve) => {
        const process = spawn('powershell')
        process.stdin.write('(New-Object -ComObject Shell.Application).NameSpace(\'shell:Downloads\').Self.Path\n');
        process.stdout.on('data', (data) => {
            if (data.toString().trim().match(/^[A-Z]:\\/)) {
                resolve(data.toString().trim())
                process.stdin.end();
            }
        })
    })
}

export const getDLCISO = async () => {
    const dlFolder = await getDownloadsFolder()
    const filePath = (await globSync("*.iso", {
        onlyFiles: true,
        cwd: dlFolder,
    })).filter((item: string) => item.toLowerCase().search("DLC") !== -1)[0]
    return join(dlFolder, filePath)
}

export const mountISO = (path: string) => {
    // eslint-disable-next-line no-async-promise-executor
    return new Promise<string>(async (resolve) => {
        const partitionsBeforeMount = await getPartitions()
        const process = spawn('powershell')
        process.stdin.write(`Mount-DiskImage -ImagePath "${path}"\n`);
        let psCount = 0
        process.stdout.on('data', (data) => {
            if (data.toString().trim().startsWith("PS")) {
                psCount++
                if (psCount === 2) {
                    getPartitions().then((partitions: string[]) => {
                        const newPartitions = partitions.filter((item: string) => partitionsBeforeMount.indexOf(item) === -1)
                        if (newPartitions.length > 0) {
                            resolve(newPartitions[0])
                        } else {
                            resolve(undefined)
                        }
                    })
                }
            }
        })
        process.stdin.end();
    })
}

export const unmountISO = (path: string) => {
    if (path.length !== 1) {
        throw new Error("The path provided is not a drive letter!")
    }
    const process = spawn('powershell')
    process.stdin.write(`$driveEject = New-Object -comObject Shell.Application\n$driveEject.Namespace(17).ParseName("${path}:").InvokeVerb("Eject") `);
    process.stdin.end();
}

export class DLCDrive {
    public readonly contents: Array<string> = []
    constructor(
        public readonly path: string
    ) {
        this.contents = globSync("*").filter((item: string) => Object.keys(DLCs).indexOf(item) !== -1)
    }


}