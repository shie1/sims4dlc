import { locateSims4 } from '../modules/sims'
import { ConfigProvider, Layout, theme } from 'antd'
import './globals.css'
import { useEffect, useState } from 'react'

const App = () => {
    const [simsInstances, setSimsInstances] = useState<string[]>([])

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
                <Layout.Content style={{ minHeight: '100dvh', background: "#1c1c1c" }}>
                    <header
                    style={{
                        backgroundColor: '#1f1f1f',
                        height: '5vh',
                        width: '100vw',
                    }}>

                    </header>
                </Layout.Content>
            </Layout>
        </ConfigProvider>
    </>)
}



export default App