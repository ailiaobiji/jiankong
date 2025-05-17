import { Center, Title, Box } from '@mantine/core'
import { IconCircleCheck, IconAlertCircle } from '@tabler/icons-react'
import { useEffect, useState } from 'react'

function useWindowVisibility() {
  const [isVisible, setIsVisible] = useState(true)
  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsVisible(document.visibilityState === 'visible')
    }
    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [])
  return isVisible
}

export default function OverallStatus({
  state,
}: {
  state: { overallUp: number; overallDown: number; lastUpdate: number }
}) {
  let statusString = ''
  let icon = <IconAlertCircle style={{ width: 64, height: 64, color: '#b91c1c' }} />
  if (state.overallUp === 0 && state.overallDown === 0) {
    statusString = 'No data yet'
  } else if (state.overallUp === 0) {
    statusString = 'All systems not operational'
  } else if (state.overallDown === 0) {
    statusString = 'All systems operational'
    icon = <IconCircleCheck style={{ width: 64, height: 64, color: '#059669' }} />
  } else {
    statusString = `Some systems not operational (${state.overallDown} out of ${
      state.overallUp + state.overallDown
    })`
  }

  const [openTime] = useState(Math.round(Date.now() / 1000))
  const [currentTime, setCurrentTime] = useState(Math.round(Date.now() / 1000))
  const isWindowVisible = useWindowVisibility()

  useEffect(() => {
    const interval = setInterval(() => {
      if (!isWindowVisible) return
      if (currentTime - state.lastUpdate > 300 && currentTime - openTime > 30) {
        window.location.reload()
      }
      setCurrentTime(Math.round(Date.now() / 1000))
    }, 1000)
    return () => clearInterval(interval)
  })

  return (
    <Box
      style={{
        maxWidth: 360,
        margin: '-80px auto 0',
        padding: '0 16px',
        textAlign: 'center',
      }}
    >
      <Center>{icon}</Center>
      <Title mt={6} order={1}>
        {statusString}
      </Title>
      <Title
        mt={4}
        style={{
          color: '#70778c',
          whiteSpace: 'nowrap', // 保持在一行不换行
        }}
        order={5}
      >
        Last updated on:{' '}
        {`${new Date(state.lastUpdate * 1000).toLocaleString()} (${currentTime - state.lastUpdate} 秒前)`}
      </Title>
    </Box>
  )
}
