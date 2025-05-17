import { Text, Tooltip } from '@mantine/core'
import { MonitorState, MonitorTarget } from '@/uptime.types'
import { IconAlertCircle, IconCircleCheck } from '@tabler/icons-react'
import DetailBar from './DetailBar'  // 只引入竖条组件
import { getColor } from '@/util/color'

export default function MonitorDetail({
  monitor,
  state,
}: {
  monitor: MonitorTarget
  state: MonitorState
}) {
  if (!state.latency[monitor.id])
    return (
      <>
        <Text mt="sm" fw={700}>
          {monitor.name}
        </Text>
        <Text mt="sm" fw={700}>
          No data available, please make sure you have deployed your workers with latest config and
          check your worker status!
        </Text>
      </>
    )

  const statusIcon =
    state.incident[monitor.id].slice(-1)[0].end === undefined ? (
      <IconAlertCircle style={{ width: '1.25em', height: '1.25em', color: '#b91c1c' }} />
    ) : (
      <IconCircleCheck style={{ width: '1.25em', height: '1.25em', color: '#059669' }} />
    )

  let totalTime = Date.now() / 1000 - state.incident[monitor.id][0].start[0]
  let downTime = 0
  for (let incident of state.incident[monitor.id]) {
    downTime += (incident.end ?? Date.now() / 1000) - incident.start[0]
  }

  const uptimePercent = (((totalTime - downTime) / totalTime) * 100).toPrecision(4)

  const monitorNameElement = (
    <Text mt="sm" fw={700} style={{ display: 'inline-flex', alignItems: 'center' }}>
      {monitor.statusPageLink ? (
        <a
          href={monitor.statusPageLink}
          target="_blank"
          style={{ display: 'inline-flex', alignItems: 'center', color: 'inherit' }}
        >
          {statusIcon} {monitor.name}
        </a>
      ) : (
        <>
          {statusIcon} {monitor.name}
        </>
      )}
    </Text>
  )

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        {monitor.tooltip ? (
          <Tooltip label={monitor.tooltip}>{monitorNameElement}</Tooltip>
        ) : (
          monitorNameElement
        )}

        <Text mt="sm" fw={700} style={{ display: 'inline', color: getColor(uptimePercent, true) }}>
          Overall: {uptimePercent}%
        </Text>
      </div>

      {/* 只显示竖条状的 uptime 统计 */}
      <DetailBar monitor={monitor} state={state} />

      {/* 注释掉延迟折线图 */}
      {/* <DetailChart monitor={monitor} state={state} /> */}
    </>
  )
}
