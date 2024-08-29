import { listener } from '@/src/state/listener'
import { NotificationsService } from '@/src/services'

import {
  cancelNotificationAsync,
  cancelNotificationSuccess,
  scheduleNotificationAsync,
  scheduleNotificationSuccess,
} from './notificationState'

listener.startListening({
  actionCreator: scheduleNotificationAsync,
  effect: async (action, listenerApi) => {
    const notificationId = await NotificationsService.schedule(action.payload)
    listenerApi.dispatch(scheduleNotificationSuccess(notificationId))
  },
})

listener.startListening({
  actionCreator: cancelNotificationAsync,
  effect: async (_, listenerApi) => {
    const {
      notifications: { scheduledNotification },
    } = listenerApi.getState()

    if (scheduledNotification != null) {
      await NotificationsService.cancel(scheduledNotification)
      listenerApi.dispatch(cancelNotificationSuccess())
    }
  },
})
