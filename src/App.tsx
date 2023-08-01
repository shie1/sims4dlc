import { locateSims4 } from '../modules/sims'
import { ConfigProvider, Layout, theme } from 'antd'
import './globals.css'
import { useEffect, useState } from 'react'

const InstanceTab = ({ instance, active, onClick, onRemove }: {
    instance: string,
    active: boolean,
    onClick: () => void,
    onRemove: () => void
}) => {
    const [hover, setHover] = useState<boolean>(false)
    return (<div style={{
        display: 'inline-block',
        padding: '0 10px',
        height: '100%',
        lineHeight: '40px',
        color: '#ffffff',
        cursor: 'pointer',
        userSelect: 'none',
        borderBottom: '2px solid #1c1c1c',
        backgroundColor: active ? '#1f1f1f' : 'transparent',
        borderRadius: '5px 5px 0 0',
    }} onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)} onClick={onClick} key={instance}>
        <span>
            {instance}
        </span>
        {hover &&
            <span
                onClick={onRemove}
                style={{
                    marginLeft: 10,
                    fontSize: 20,
                    lineHeight: '20px',
                    cursor: 'pointer',
                }}>
                x
            </span>
        }
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
                            flexDirection: 'row',
                            justifyContent: 'space-between',
                        }}>
                        <div>
                            {/* map sims instances as tabs */}
                            {simsInstances.map((instance, key) => {
                                const active = key === activeInstance
                                return <InstanceTab onRemove={() => {
                                    setSimsInstances(simsInstances.filter((_, i) => i !== key))
                                }} instance={instance} active={active} onClick={() => setActiveInstance(key)} />
                            })}
                        </div>
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