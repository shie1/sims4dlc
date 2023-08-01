import { spawn } from "child_process"
import { accessSync } from "fs"

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
    }).flat().map((item: string) => {
        try {
            accessSync(`${item}\\Game\\Bin`)
            return `${item}`
        } catch (e) {
            return undefined
        }
    }).filter((item: string) => item);
    return sims4Folder.filter(item => item) as string[]
}