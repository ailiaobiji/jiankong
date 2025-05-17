'use client'

import Head from 'next/head'
import { useEffect, useState } from 'react'

import { Inter } from 'next/font/google'
import { MonitorState, MonitorTarget } from '@/uptime.types'
import { KVNamespace } from '@cloudflare/workers-types'
import { pageConfig, workerConfig } from '@/uptime.config'
import OverallStatus from '@/components/OverallStatus'
import Header from '@/components/Header'
import MonitorList from '@/components/MonitorList'
import { Center, Divider, Text } from '@mantine/core'
import MonitorDetail from '@/components/MonitorDetail'

export const runtime = 'experimental-edge'
const inter = Inter({ subsets: ['latin'] })

export default function Home({
  state: stateStr,
  monitors,
}: {
  state: string
  monitors: MonitorTarget[]
  tooltip?: string
  statusPageLink?: string
}) {
  let state: MonitorState | undefined;
  if (stateStr !== undefined) {
    state = JSON.parse(stateStr) as MonitorState;
  }

  const [currentTime, setCurrentTime] = useState(Math.round(Date.now() / 1000));

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(Math.round(Date.now() / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const monitorId = typeof window !== 'undefined' ? window.location.hash.substring(1) : '';
  if (monitorId) {
    const monitor = monitors.find((monitor) => monitor.id === monitorId);
    if (!monitor || !state) {
      return (
        <Text fw={700}>
          Monitor with id {monitorId} not found!
        </Text>
      )
    }
    return (
      <div style={{ maxWidth: '810px' }}>
        <MonitorDetail monitor={monitor} state={state} />
      </div>
    )
  }

  // 移除 "(xx sec ago)"，只保留日期时间
  const lastUpdatedText =
    state !== undefined
      ? `Last updated on: ${new Date(state.lastUpdate * 1000).toLocaleString()}`
      : '';

  return (
    <>
      <Head>
        <title>{pageConfig.title}</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={inter.className}>
        <Header />

        {state === undefined ? (
          <Center>
            <Text fw={700}>
              Monitor State is not defined now, please check your worker&apos;s status and KV
              binding!
            </Text>
          </Center>
        ) : (
          <div>
            <OverallStatus state={state} />
            <MonitorList monitors={monitors} state={state} />
          </div>
        )}

        {state !== undefined && (
          <Text
            size="md"
            mt="md"
            style={{
              textAlign: 'center',
              color: '#70778c',
              fontSize: '15px', // ← 修改这里自定义字体大小
            }}
          >
            {lastUpdatedText}






















            <br />
            Copyright © All rights reserved
            <a href="" target="_blank" rel="external nofollow"></a>
            <br />


            <a href="" className="footer-link"></a>













            <br />
            Open-source monitoring and status page powered by
            <a href="https://github.com/lyc8503/UptimeFlare" target="_blank" rel="external nofollow">UptimeFlare</a>
            and
            <a href="https://www.cloudflare.com/" target="_blank" rel="external nofollow">Cloudflare</a>


            , 
            <a href="" target="_blank" rel="external nofollow"></a>








          </Text>
        )}


      </main>
    </>
  )
}

export async function getServerSideProps() {
  const { UPTIMEFLARE_STATE } = process.env as unknown as {
    UPTIMEFLARE_STATE: KVNamespace
  }

  const state = (await UPTIMEFLARE_STATE?.get('state')) as unknown as MonitorState

  const monitors = workerConfig.monitors.map((monitor) => {
    return {
      id: monitor.id,
      name: monitor.name,
      // @ts-ignore
      tooltip: monitor?.tooltip,
      // @ts-ignore
      statusPageLink: monitor?.statusPageLink
    }
  })

  return { props: { state, monitors } }
}
