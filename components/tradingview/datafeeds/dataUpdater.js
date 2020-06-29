/**
 * 数据更新器
 * 通过更新器触发datafeeds的getBars实时更新图表数据
 */
class dataUpdater {
  constructor(datafeeds) {
    this.subscribers = {}
    this.requestsPending = 0
    this.historyProvider = datafeeds
  }
  subscribeBars(symbolInfo, resolution, newDataCallback, listenerGuid) {
    this.subscribers[listenerGuid] = {
      lastBarTime: null,
      listener: newDataCallback,
      resolution: resolution,
      symbolInfo: symbolInfo
    }
  }
  unsubscribeBars(listenerGuid) {
    delete this.subscribers[listenerGuid]
  }
  // 更新图表
  updateData() {
    // console.log('111111')
    if (this.requestsPending) return
    this.requestsPending = 0
    for (const listenerGuid in this.subscribers) {
      this.requestsPending++
      this.updateDataForSubscriber(listenerGuid).then(() => this.requestsPending--).catch(() => this.requestsPending--)
    }
  }
  updateDataForSubscriber(listenerGuid) {
    // console.log('22222')
    return new Promise((resolve, reject) => {
      const subscriptionRecord = this.subscribers[listenerGuid]
      // console.log(subscriptionRecord, '+++')
      const rangeEndTime = parseInt((Date.now() / 1000).toString())
      // console.log(rangeEndTime, '2222222222222')
      const rangeStartTime = rangeEndTime - this.periodLengthSeconds(subscriptionRecord.resolution, 10)
      // console.log(rangeStartTime, '3333333333')
      this.historyProvider.getBars(subscriptionRecord.symbolInfo, subscriptionRecord.resolution, rangeStartTime, rangeEndTime,
        bars => {
          this.onSubscriberDataReceived(listenerGuid, bars)
          resolve()
        },
        () => {
          reject()
        }
      )
    })
  }
  onSubscriberDataReceived(listenerGuid, bars) {
    // if (!this.subscribers.hasOwnProperty(listenerGuid)) return
    if (!bars.length) return
    const lastBar = bars[bars.length - 1]
    const subscriptionRecord = this.subscribers[listenerGuid]
    if (subscriptionRecord.lastBarTime !== null && lastBar.time < subscriptionRecord.lastBarTime) return
    const isNewBar = subscriptionRecord.lastBarTime !== null && lastBar.time > subscriptionRecord.lastBarTime
    if (isNewBar) {
      if (bars.length < 2) {
        throw new Error('Not enough bars in history for proper pulse update. Need at least 2.')
      }

      const previousBar = bars[bars.length - 2]
      subscriptionRecord.listener(previousBar)
    }

    subscriptionRecord.lastBarTime = lastBar.time
    subscriptionRecord.listener(lastBar)
  }
  periodLengthSeconds(resolution, requiredPeriodsCount) {
    let daysCount = 0
    if (resolution === 'D' || resolution === '1D') {
      daysCount = requiredPeriodsCount
    } else if (resolution === 'M' || resolution === '1M') {
      daysCount = 31 * requiredPeriodsCount
    } else if (resolution === 'W' || resolution === '1W') {
      daysCount = 7 * requiredPeriodsCount
    } else {
      daysCount = requiredPeriodsCount * parseInt(resolution) / (24 * 60)
    }
    // console.log(daysCount * 24 * 60 * 60, "'''''''''''''''")
    return daysCount * 24 * 60 * 60
  }
}

export default dataUpdater
