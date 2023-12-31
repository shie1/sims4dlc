import { Sims4Instance, isDLCDrive, isSims4Folder, locateSims4, getDLCISO, mountISO, getDLCDrive, unmountISO, DLCDrive, Sims4DLC, usePartitions } from '../modules/sims'
import { ConfigProvider, Layout, theme, message, Button, Alert, Modal, Badge } from 'antd'
import './globals.css'
import { useEffect, useRef, useState, createContext, useContext } from 'react'
import { IconDeviceFloppy, IconPlayerPlay } from "@tabler/icons-react"
import { AnimatePresence, motion } from 'framer-motion'
import { ipcRenderer } from "electron"

const GlobalSettingsContext = createContext<{ globalSettings: GlobalSettings, setGlobalSettings: (value: GlobalSettings) => void }>({ globalSettings: { dlcDrive: undefined }, setGlobalSettings: () => { "" } })

const InstanceTab = ({ instance, active, onClick, onRemove }: {
    instance: Sims4Instance,
    active: boolean,
    onClick: () => void,
    onRemove: () => void,
}) => {
    const [hover, setHover] = useState<boolean>(false)
    const ref = useRef<HTMLDivElement>(null)
    return (<motion.div
        style={{
            display: 'inline-block',
            padding: '0 10px',
            height: 40,
            overflow: 'hidden',
            lineHeight: '40px',
            color: '#ffffff',
            flexBasis: 'auto',
            cursor: 'pointer',
            minWidth: 'max-content',
            borderRight: '2px solid #212121',
            backgroundColor: active ? '#1f1f1f' : 'transparent',
            borderRadius: '0px 10px 0 0',
        }} ref={ref} onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)} onClick={onClick}>
        <span>
            {instance.path}
        </span>
        <motion.span
            animate={{ opacity: hover ? 1 : 0 }}
            onClick={onRemove}
            style={{
                fontSize: 20,
                overflow: 'hidden',
                lineHeight: '20px',
                cursor: 'pointer',
                marginLeft: 10,
            }}>
            x
        </motion.span>
    </motion.div>)
}

const DLC = ({ dlc }: { dlc: Sims4DLC }) => {
    const { globalSettings } = useContext(GlobalSettingsContext)
    const [status, setStatus] = useState<number>(0)
    const [selected, setSelected] = useState<boolean>(false)

    useEffect(() => {
        setStatus(globalSettings.dlcDrive ? dlc.getStatus(globalSettings.dlcDrive) : 0)
    }, [status, globalSettings.dlcDrive])

    return (<div style={{
        aspectRatio: '16 / 9',
        minHeight: 120,
        padding: 10,
        display: 'flex',
        flexDirection: 'column',
        flex: 1,
        margin: 5,
        cursor: 'pointer',
        borderRadius: 10,
        border: selected ? '2px solid #ffffff' : '2px solid transparent',
    }} onClick={() => {
        setSelected((old) => !old)
    }}>
        <div style={{ flexGrow: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <h2 style={{
                fontSize: 40,
                marginBottom: 10,
            }}>
                {dlc.id}
            </h2>
        </div>
        <div>
            <span style={{
            }}>
                {dlc.name}
            </span>
            <span style={{
            }}>
                {status === -1 ? '⚫' : status === 1 ? '🟢' : '🔴'}
            </span>
        </div>
    </div>)
}

const InstanceDashboard = ({ instance }: { instance: Sims4Instance }) => {
    if (!instance) return <></>
    const { globalSettings, setGlobalSettings } = useContext(GlobalSettingsContext)
    const name = instance.path.split("\\")[instance.path.split("\\").length - 1]
    const DLCs = instance.getDLCs()
    const cracked = instance.isCracked()
    return (<>
        <AnimatePresence>
            {globalSettings.dlcDrive === undefined &&
                <motion.div
                    style={{ overflow: 'hidden', display: 'flex', justifyContent: 'center', alignItems: 'center' }}
                    initial={{ height: 0 }}
                    animate={{ height: 'auto' }}
                    exit={{ height: 0 }}
                >
                    <Alert
                        style={{
                            margin: '10px 0',
                        }}
                        type='warning'
                        message="No DLC source drive found, please select a drive or directory manually!"
                        action={<Button style={{
                            marginLeft: 10,
                            height: 32,
                        }} size="small" type="text" onClick={() => {
                            ipcRenderer.invoke('folder-select', {
                                title: 'Select DLC Drive/Directory',
                            }).then((res) => {
                                if (res.canceled) return
                                if (res.filePaths.length === 0) return
                                if (!isDLCDrive(res.filePaths[0])) {
                                    message.error('Selected folder is not a DLC drive!')
                                    return
                                }
                                setGlobalSettings({ ...globalSettings, dlcDrive: res.filePaths[0] })
                            })
                        }}>
                            <div
                                style={{
                                    display: 'flex',
                                    flexDirection: 'row',
                                    padding: '4px 0',
                                }}>
                                <span style={{
                                    lineHeight: 24,
                                    display: 'flex',
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    height: 24,
                                    marginRight: 5,
                                }}><IconDeviceFloppy size={20} /></span>
                                <span style={{
                                    lineHeight: 24,
                                    display: 'flex',
                                    alignItems: 'center',
                                    height: 24,
                                }}>Select DLC Source</span>
                            </div>
                        </Button>} />
                </motion.div>
            }
        </AnimatePresence >
        <div
            style={{
                display: 'flex',
                flexDirection: 'row',
                flexWrap: 'wrap',
                alignItems: 'center',
                overflowY: 'auto',
                flex: 1,
                flexShrink: 1,
            }}>
            <div style={{
                padding: '0 15px',
                marginBottom: 20,
                width: '100%',
            }}>
                <div
                    style={{
                        display: 'flex',
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        width: '100%',
                    }}>
                    <div>
                        <Badge.Ribbon color={cracked ? "red" : "orange"} text={cracked ? "Cracked" : "EA Official"}>
                            <h1 style={{
                                fontSize: 30,
                                marginBottom: 0,
                                paddingRight: 5,
                                paddingTop: 30,
                            }}>
                                {name}
                            </h1>
                        </Badge.Ribbon>
                        <p style={{ margin: 0 }}>{instance.path}</p>
                    </div>
                    <div style={{
                        position: 'relative',
                        top: 28,
                        marginLeft: 'auto',
                    }}>
                        <Button onClick={() => {
                            instance.launch()
                        }} style={{
                            height: 32
                        }}>
                            <div
                                style={{
                                    display: 'flex',
                                    flexDirection: 'row',
                                }}>
                                <span style={{
                                    lineHeight: 24,
                                    display: 'flex',
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    height: 24,
                                    marginRight: 5,
                                }}><IconPlayerPlay size={20} /></span>
                                <span style={{
                                    lineHeight: 24,
                                    display: 'flex',
                                    alignItems: 'center',
                                    height: 24,
                                }}>Play</span>
                            </div>
                        </Button>
                    </div>
                </div>
            </div>
            <div
                style={{
                    display: 'flex',
                    flexDirection: 'row',
                    flexWrap: 'wrap',
                    alignItems: 'center',
                }}
            >
                {DLCs.map((dlc, key) => {
                    return (<DLC key={key} dlc={dlc} />)
                })}
            </div>
        </div >
    </>)
}

export type GlobalSettings = {
    dlcDrive: DLCDrive | undefined,
}

const App = () => {
    const [simsInstances, setSimsInstances] = useState<Sims4Instance[]>([])
    const [activeInstance, setActiveInstance] = useState<number>(0)
    const [globalSettings, setGlobalSettings] = useState<GlobalSettings>({
        dlcDrive: undefined,
    })
    const [dlcISO, setDLCISO] = useState<string | undefined>(undefined)
    const [dlcISOModal, setDLCISOModal] = useState<boolean>(false)
    const partitions = usePartitions()

    useEffect(() => {
        getDLCDrive().then((res) => {
            if (res) {
                setGlobalSettings({ ...globalSettings, dlcDrive: res })
            } else {
                if (globalSettings.dlcDrive) {
                    setDLCISOModal(false)
                    return
                }
                if (dlcISO) {
                    return
                }
                getDLCISO().then((res) => {
                    if (res) {
                        setDLCISOModal(true)
                        setDLCISO(res)
                    }
                    else {
                        setDLCISOModal(false)
                    }
                })
            }
        })
    }, [globalSettings.dlcDrive, dlcISO])

    useEffect(() => {
        if (!partitions) return
        if (!globalSettings.dlcDrive) return
        if (!partitions.includes(globalSettings.dlcDrive.path)) {
            message.error('DLC drive has been unmounted!')
            setGlobalSettings({ ...globalSettings, dlcDrive: undefined })
        }
    }, [partitions, globalSettings.dlcDrive])

    useEffect(() => {
        locateSims4().then((res) => {
            setSimsInstances(res)
        })
    }, [setSimsInstances])

    useEffect(() => {
        if (simsInstances.length === 0) return
        console.log(simsInstances, activeInstance)
        if (activeInstance >= simsInstances.length - 1) {
            setActiveInstance(simsInstances.length - 1)
        }
    }, [simsInstances, activeInstance])

    useEffect(() => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (window as any).simsInstance = simsInstances[activeInstance];
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (window as any).globalSettings = globalSettings;
    }, [activeInstance, simsInstances, globalSettings])

    return (<>
        <GlobalSettingsContext.Provider value={{ globalSettings, setGlobalSettings }}>
            <ConfigProvider theme={{
                algorithm: theme.darkAlgorithm,
                token: {
                    colorPrimary: '#8B0000', // Dark red color
                },
            }}>
                <Layout>
                    <Layout.Content style={{
                        height: '100dvh',
                        background: "#1f1f1f",
                        display: 'flex',
                        flexDirection: 'column',
                    }}>
                        <Modal
                            open={dlcISOModal}
                            onCancel={() => setDLCISOModal(false)}
                            title="DLC ISO found!"
                            okText="Mount"
                            cancelText="Ignore"
                            onOk={() => {
                                mountISO(dlcISO).then(async (disk) => {
                                    ipcRenderer.send('unmount-on-exit', disk)
                                    await new Promise((resolve) => setTimeout(resolve, 1000))
                                    if (!isDLCDrive(disk)) {
                                        message.error('The mounted ISO is not a DLC drive!')
                                        unmountISO(disk)
                                        setDLCISOModal(false)
                                        return
                                    }
                                    setGlobalSettings({ ...globalSettings, dlcDrive: new DLCDrive(disk) })
                                    setDLCISOModal(false)
                                })
                            }}>
                            <p style={{ marginBottom: 0 }}>Found a DLC ISO at <i>"{dlcISO}"</i></p>
                        </Modal>
                        <motion.header layout layoutDependency={simsInstances}
                            style={{
                                backgroundColor: '#171717',
                                borderBottom: '4px solid black',
                                width: '100vw',
                                flexWrap: 'wrap',
                                display: 'flex',
                                overflow: 'hidden',
                                flexDirection: 'row',
                            }}>
                            {/* map sims instances as tabs */}
                            {simsInstances.map((instance, key) => {
                                const active = key === activeInstance
                                if (key + 1 === simsInstances.length) return (<span key={key} style={{
                                    display: 'flex',
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    height: 40,
                                    flexGrow: 1,
                                }}>
                                    <InstanceTab key={key} onRemove={() => {
                                        setSimsInstances(simsInstances.filter((_, i) => i !== key))
                                    }
                                    } instance={instance} active={active} onClick={() => setActiveInstance(key)} />
                                    <div key="add-instance" style={{
                                        color: '#ffffff',
                                        lineHeight: 20,
                                        padding: '0 10px',
                                        cursor: 'pointer',
                                        fontSize: 25,
                                        marginLeft: "auto",
                                        flexBasis: 50,
                                    }} onClick={() => {
                                        ipcRenderer.invoke('folder-select', {
                                            title: 'Select Sims 4 Folder',
                                        }).then((res) => {
                                            if (res.canceled) return
                                            if (res.filePaths.length === 0) return
                                            if (isSims4Folder(res.filePaths[0]) === false) {
                                                message.error('Selected folder is not a Sims 4 folder!')
                                                return
                                            }
                                            setSimsInstances([...simsInstances, res.filePaths[0]])
                                        })
                                    }}>
                                        +
                                    </div>
                                </span>)
                                return <InstanceTab key={key} onRemove={() => {
                                    setSimsInstances(simsInstances.filter((_, i) => i !== key))
                                }} instance={instance} active={active} onClick={() => setActiveInstance(key)} />
                            })}
                        </motion.header>
                        <InstanceDashboard instance={simsInstances[activeInstance]} />
                    </Layout.Content>
                </Layout>
            </ConfigProvider>
        </GlobalSettingsContext.Provider >
    </>)
}



export default App