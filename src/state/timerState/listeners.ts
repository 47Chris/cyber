import { listener } from '@/src/state/listener'
import { isAnyOf } from '@reduxjs/toolkit'

import {
  cancelNotificationAsync,
  scheduleNotificationAsync,
} from '@/src/state/notificationsState'
import { TimerStatus } from '@/src/models'

import {
  pauseTimer,
  restore,
  startTimer,
  stopTimer,
  _INTERNALS,
} from './timerState'
import { startTimerInterval } from './utils'

listener.startListening({
  actionCreator: startTimer,
  effect: async (_, listenerApi) => {
    const { timer } = listenerApi.getState()
    startTimerInterval(listenerApi)

    if (timer.completionTimestamp) {
      listenerApi.dispatch(
        scheduleNotificationAsync({
          title: `Time's up !`,
          body: 'Your current timer is complete',
          date: timer.completionTimestamp,
        }),
      )
    }
  },
})

listener.startListening({
  matcher: isAnyOf(stopTimer, pauseTimer),
  effect: async (_, listenerApi) => {
    listenerApi.dispatch(cancelNotificationAsync())
  },
})

listener.startListening({
  actionCreator: restore,
  effect: async (_, listenerApi) => {
    const { timer } = listenerApi.getState()

    if (timer.status === TimerStatus.Running) {
      startTimerInterval(listenerApi)
    }
  },
})
