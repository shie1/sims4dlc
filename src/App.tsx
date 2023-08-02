import { Sims4Instance, isSims4Folder, locateSims4 } from '../modules/sims'
import { ConfigProvider, Layout, theme, message } from 'antd'
import './globals.css'
import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { contextBridge, ipcRenderer } from "electron"

const InstanceTab = ({ instance, active, onClick, onRemove }: {
    instance: Sims4Instance,
    active: boolean,
    onClick: () => void,
    onRemove: () => void,
}) => {
    const [hover, setHover] = useState<boolean>(false)
    const ref = useRef<HTMLDivElement>(null)
    return (<motion.div
        animate={{
        }}
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
            userSelect: 'none',
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

const App = () => {
    const [simsInstances, setSimsInstances] = useState<Sims4Instance[]>([])
    const [activeInstance, setActiveInstance] = useState<number>(0)

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
        (window as any).simsInstance = simsInstances[activeInstance]
    }, [activeInstance, simsInstances])

    return (<>
        <ConfigProvider theme={{
            algorithm: theme.darkAlgorithm,
            token: {
                colorPrimary: '#8B0000', // Dark red color
            },
        }}>
            <Layout>
                <Layout.Content style={{ minHeight: '100dvh', background: "#1f1f1f" }}>
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
                            if (key + 1 === simsInstances.length) return (<span style={{
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
                                    userSelect: 'none',
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
                </Layout.Content>
            </Layout>
        </ConfigProvider>
    </>)
}



export default App