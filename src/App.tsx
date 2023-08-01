import { locateSims4 } from '../modules/sims'
import { ConfigProvider, Layout, theme } from 'antd'
import './globals.css'
import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const InstanceTab = ({ instance, active, onClick, onRemove }: {
    instance: string,
    active: boolean,
    onClick: () => void,
    onRemove: () => void
}) => {
    const [hover, setHover] = useState<boolean>(false)
    const ref = useRef<HTMLDivElement>(null)
    return (<div style={{
        display: 'inline-block',
        padding: '0 10px',
        height: 40,
        overflow: 'hidden',
        lineHeight: '40px',
        color: '#ffffff',
        cursor: 'pointer',
        borderRight: '2px solid #212121',
        userSelect: 'none',
        backgroundColor: active ? '#1f1f1f' : 'transparent',
        borderRadius: '0px 10px 0 0',
    }} ref={ref} onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)} onClick={onClick} key={instance}>
        <span>
            {instance}
        </span>
        <AnimatePresence>
            {hover &&
                <motion.span
                    initial={{ opacity: 0, marginLeft: -8 }}
                    animate={{ opacity: 1, marginLeft: 10 }}
                    exit={{ opacity: 0, marginLeft: -8 }}
                    onClick={onRemove}
                    style={{
                        fontSize: 20,
                        overflow: 'hidden',
                        lineHeight: '20px',
                        cursor: 'pointer',
                    }}>
                    x
                </motion.span>
            }
        </AnimatePresence>
    </div>)
}

const App = () => {
    const [simsInstances, setSimsInstances] = useState<string[]>([])
    const [activeInstance, setActiveInstance] = useState<number>(0)

    useEffect(() => {
        locateSims4().then((res) => {
            console.log(res)
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

    return (<>
        <ConfigProvider theme={{
            algorithm: theme.darkAlgorithm,
            token: {
                colorPrimary: '#8B0000', // Dark red color
            },
        }}>
            <Layout>
                <Layout.Content style={{ minHeight: '100dvh', background: "#1f1f1f" }}>
                    <header
                        style={{
                            backgroundColor: '#171717',
                            borderBottom: '4px solid black',
                            height: 40,
                            width: '100vw',
                            display: 'flex',
                            overflow: 'hidden',
                            overflowX: 'auto',
                            flexDirection: 'row',
                            justifyContent: 'space-between',
                        }}>
                        <motion.div style={{
                            display: 'flex',
                            flexDirection: 'row',
                        }} layout layoutDependency={simsInstances}>
                            {/* map sims instances as tabs */}
                            {simsInstances.map((instance, key) => {
                                const active = key === activeInstance
                                return <InstanceTab key={key} onRemove={() => {
                                    setSimsInstances(simsInstances.filter((_, i) => i !== key))
                                }} instance={instance} active={active} onClick={() => setActiveInstance(key)} />
                            })}
                        </motion.div>
                        <div style={{
                            display: 'flex',
                            flexDirection: 'row',
                            justifyContent: 'center',
                            alignItems: 'center',
                            height: '100%',
                            color: '#ffffff',
                            padding: '0 10px',
                            cursor: 'pointer',
                            fontSize: 25,
                            userSelect: 'none',
                        }}>
                            +
                        </div>
                    </header>
                </Layout.Content>
            </Layout>
        </ConfigProvider>
    </>)
}



export default App