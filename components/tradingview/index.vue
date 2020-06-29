<template>
  <div id="trade-view" :class="isFullscreen?'full':''" />
</template>

<script>
import screenfull from 'screenfull'
var TvWidget = null
// console.log(TvWidget)
import Socket from './datafeeds/socket.js'
import Datafeeds from './datafeeds/datafees.js'

export default {
  name: 'TradeView',
  props: {
    symbolValue: {
      default: 'BTCUSDT',
      type: String
    },
    intervalValue: {
      default: '1',
      type: String
    }
  },
  data() {
    return {
      isFullscreen: false,
      widget: null,
      socket: new Socket('wss://mqs.coinka.cn/ws/v1/mqs/kline'),
      datafeeds: new Datafeeds(this),
      symbol: this.symbolValue,
      interval: this.intervalValue,
      lang: 'zh',
      cacheData: {},
      lastTime: null,
      getBarTimer: null,
      isLoading: true,
      debug: true,
      pricescale: 100,
      pointvalue: 8,
      overridesBlack: {
        'volumePaneSize': 'small', // "volumePaneSize" : "large"支持的值: large（默认）, medium, small, tiny//  白色蜡烛样式
        'mainSeriesProperties.style': 1,
        'mainSeriesProperties.candleStyle.downColor': '#ee6560', // K线颜色
        'mainSeriesProperties.candleStyle.upColor': '#4db872',
        'mainSeriesProperties.candleStyle.borderDownColor': '#ee6560', // 边框颜色
        'mainSeriesProperties.candleStyle.borderUpColor': '#4db872',
        'mainSeriesProperties.candleStyle.wickDownColor': '#ee6560', // 烛芯颜色
        'mainSeriesProperties.candleStyle.wickUpColor': '#4db872',
        'paneProperties.vertGridProperties.color': '#293241', // 格子线条
        'paneProperties.horzGridProperties.color': '#293241',
        'paneProperties.vertGridProperties.style': 0,
        'paneProperties.horzGridProperties.style': 0,
        'paneProperties.legendProperties.showLegend': false,
        'paneProperties.topMargin': 10, // K线离顶部的距离/百分比
        'paneProperties.bottomMargin': 35, // K线离底部的距离/百分比
        'hide_left_toolbar_by_default': 'hidden',
        'symbolWatermarkProperties.color': 'rgba(0,0,0,0)',
        'paneProperties.background': '#192233', // 背景颜色
        'scalesProperties.backgroundColor': '#192233',
        'scalesProperties.fontSize': 12,
        'scalesProperties.lineColor': '#293241', // 边框线条颜色
        'scalesProperties.textColor': 'rgba(255,255,255,0.45)'
      }
    }
  },
  mounted() {
    TvWidget = window.TradingView.widget
    this.socket.doOpen()
    this.socket.on('open', () => {
      this.socket.send({ cmd: 'req', args: ['candle.' + this.interval + '.' + this.symbol.toLowerCase(), 300, parseInt(Date.now() / 1000)] })
    })
    this.socket.on('message', this.onMessage)
    this.socket.on('close', this.onClose)
    this.socket.on('error', event => {
      console.log('home.vue websocket 出错了', this.onClose)
    })
  },
  destroyed() {
    // if (this.tvWidget !== null) {
    //   // this.tvWidget.remove()
    //   this.tvWidget = null
    //   this.socket.close()
    // }
  },
  methods: {
    // 全屏切换
    fullScreen() {
      var what = this
      screenfull.toggle() // 切换全屏
      if (screenfull.isEnabled) {
        screenfull.on('change', () => {
          if (screenfull.isFullscreen) {
            // 全屏时，要执行的操作
            what.isFullscreen = true
          } else {
            // 取消全屏时，要执行的操作
            what.isFullscreen = false
          }
        })
      }
    },
    init() {
      if (!this.widget) {
        this.widget = new TvWidget({
          symbol: this.symbol,
          interval: this.interval,
          autosize: true,
          fullscreen: false,
          container_id: 'trade-view',
          datafeed: this.datafeeds,
          library_path: '/charting_library/',
          timezone: 'Asia/Shanghai',
          locale: this.lang,
          debug: false,
          disabled_features: [
            'save_chart_properties_to_local_storage', // 本地存储
            'header_symbol_search', // 搜索
            'symbol_search_hot_key',
            'header_interval_dialog_button',
            'header_screenshot', // 照相机
            'header_compare',
            'timeframes_toolbar', // 底部时间栏目
            // 'volume_force_overlay', // k线与销量分开
            'header_undo_redo', // 左右箭头
            // "header_settings",//设置按钮
            'header_indicators', // 技术指标线
            'header_chart_type', // 图表类型
            'pane_context_menu', // 图表右键菜单
            'header_resolutions', // 系统默认时间按钮
            // "hide_left_toolbar", //左边工具栏 hide_left_toolbar_by_default
            'header_saveload',
            // "display_market_status",
            'main_series_scale_menu', // 显示图表右下角的设置按钮
            'control_bar',
            'caption_buttons_text_if_possible',
            'header_widget'

          ],
          enabled_features: [
            'header_widget_dom_node',
            'use_localstorage_for_settings',
            'keep_left_toolbar_visible_on_small_screens', // 防止左侧工具栏在小屏幕上消失
            'adaptive_logo',
            'property_pages',
            'display_market_status',
            'remove_library_container_border',
            'move_logo_to_main_pane',
            'dont_show_boolean_study_arguments', // 是否隐藏指标参数
            'countdown',
            'caption_buttons_text_if_possible', // 在可能的情况下，在标题中的“指标”和“比较”按钮上显示文字而不是图标
            'header_settings',
            'hide_last_na_study_output', // 隐藏最后一次指标输出
            'symbol_info', // 商品信息对话框
            'hide_left_toolbar_by_default'
          ],
          // preset: "mobile",
          customFormatters: {
            dateFormatter: {
              format: function(date) {
                return date.getUTCFullYear() + '/' + (date.getUTCMonth() + 1) + '/' + date.getUTCDate()
              }
            } // 时间格式

          },
          overrides: this.overridesBlack,
          studies_overrides: {
            'bollinger bands.median.color': '#33FF88',
            'bollinger bands.upper.linewidth': 7,
            // "volume.precision" : 1
            'volume.volume.color.0': '#ee6560',
            'volume.volume.color.1': '#4db872',
            'volume.volume.transparency': 75
          }
          // custom_css_url: './chart.css'
        })
        // var this = this.widget
        this.widget.onChartReady(() => {
          this.widget
            .chart()
            .createStudy('Moving Average', true, false, [5], null, {
              'plot.color': '#99aac7'
            })
          this.widget
            .chart()
            .createStudy('Moving Average', false, false, [15], null, {
              'plot.color': '#e9e12f'
            })
          this.widget
            .chart()
            .createStudy('Moving Average', false, false, [30], null, {
              'plot.color': '#2026dc'
            })
          this.widget
            .chart()
            .createStudy('Moving Average', false, false, [60], null, {
              'plot.color': '#a109ef'
            })
        })
      }
    },
    sendMessage(data) {
      // console.log(window.socket.socket.readyState, '.......................')
      // console.log(window.socket.socket.OPEN, '***************')
      if (this.socket.socket.readyState !== this.socket.socket.OPEN) {
        // this.onClose
        this.socket.doOpen()
      }
      if (this.socket.checkOpen()) {
        this.socket.send(data)
      } else {
        this.socket.on('open', () => {
          this.socket.send(data)
        })
      }
    },
    unSubscribe(interval) {
      // var thats = this
      // 停止订阅，删除过期缓存、缓存时间、缓存状态
      this.interval = interval
      var ticker = this.symbol + '-' + interval
      var tickertime = ticker + 'load'
      var tickerstate = ticker + 'state'
      var tickerCallback = ticker + 'Callback'
      delete this.cacheData[ticker]
      delete this.cacheData[tickertime]
      delete this.cacheData[tickerstate]
      delete this.cacheData[tickerCallback]
      this.sendMessage({
        cmd: 'unsub',
        args: ['candle.' + interval + '.' + this.symbol.toLowerCase()]
      })
    },
    onMessage(data) {
      var thats = this
      var ticker = thats.symbol + '-' + thats.interval
      if (data.name === 'kline') {
        // websocket返回的值，数组代表时间段历史数据，不是增量
        var list = []

        var tickerstate = ticker + 'state'
        var tickerCallback = ticker + 'Callback'
        var onLoadedCallback = thats.cacheData[tickerCallback]
        var kline = data.data.kline || ''
        kline.forEach((element) => {
          // console.log(typeof (element.time))
          // console.log(element.time, '2222222')
          list.push({
            time: element.time,
            open: parseFloat(element.open),
            high: parseFloat(element.high),
            low: parseFloat(element.low),
            close: parseFloat(element.close),
            volume: parseFloat(element.volume)
          })
        })
        // 如果没有缓存数据，则直接填充，发起订阅
        if (!thats.cacheData[ticker]) {
          thats.cacheData[ticker] = list
          // thats.subscribe()
        }
        // 新数据即当前时间段需要的数据，直接喂给图表插件
        if (onLoadedCallback) {
          onLoadedCallback(list)
          delete thats.cacheData[tickerCallback]
        }
        // 请求完成，设置状态为false
        thats.cacheData[tickerstate] = !1
        // 记录当前缓存时间，即数组最后一位的时间
        if (thats.cacheData[ticker].length > 0) {
          thats.lastTime = thats.cacheData[ticker][thats.cacheData[ticker].length - 1].time
        }
      }

      if (data.name === 'kline_real') {
        var result = data.data.kline
        // console.log(' >> sub:', data.type)
        // console.log(' >> interval:', thats.interval)
        // data带有type，即返回的是订阅数据，
        // 缓存的key
        // 构造增量更新数据
        var barsData = {
          time: result.t,
          open: parseFloat(result.o),
          high: parseFloat(result.h),
          low: parseFloat(result.l),
          close: parseFloat(result.c),
          volume: parseFloat(result.v)
        }

        // 如果增量更新数据的时间大于缓存时间，而且缓存有数据，数据长度大于0
        if (barsData.time > this.lastTime && this.cacheData[ticker] && this.cacheData[ticker].length) {
          // 增量更新的数据直接加入缓存数组
          this.cacheData[ticker].push(barsData)
          // 修改缓存时间
          this.lastTime = barsData.time
        } else if (barsData.time === this.lastTime && this.cacheData[ticker] && this.cacheData[ticker].length) {
          // 如果增量更新的时间等于缓存时间，即在当前时间颗粒内产生了新数据，更新当前数据
          this.cacheData[ticker][this.cacheData[ticker].length - 1] = barsData
        }
        // 通知图表插件，可以开始增量更新的渲染了
        this.datafeeds.barsUpdater.updateData()
      }
    },
    initMessage(symbolInfo, resolution, rangeStartDate, rangeEndDate, onLoadedCallback) {
      // console.log('发起请求，从websocket获取当前时间段的数据');
      var that = this
      // 保留当前回调
      var tickerCallback = this.symbol + '-' + resolution + 'Callback'
      that.cacheData[tickerCallback] = onLoadedCallback
      // 获取需要请求的数据数目
      var limit = that.initLimit(resolution, rangeStartDate, rangeEndDate)
      // 商品名
      var symbol = that.symbol
      // 如果当前时间节点已经改变，停止上一个时间节点的订阅，修改时间节点值

      if (that.interval !== resolution) {
        that.unSubscribe(that.interval)
        that.interval = resolution
      }
      // 获取当前时间段的数据，在onMessage中执行回调onLoadedCallback
      this.socket.send({
        cmd: 'req',
        args: ['candle.' + this.interval + '.' + symbol.toLowerCase(), limit, rangeEndDate]
        // id: 'trade.' + that.interval + '.' + symbol.toLowerCase()
      })
    },
    initLimit(resolution, rangeStartDate, rangeEndDate) {
      var limit = 0
      switch (resolution) {
        case '1D': limit = Math.ceil((rangeEndDate - rangeStartDate) / 60 / 60 / 24); break
        case '1W': limit = Math.ceil((rangeEndDate - rangeStartDate) / 60 / 60 / 24 / 7); break
        case '1M': limit = Math.ceil((rangeEndDate - rangeStartDate) / 60 / 60 / 24 / 31); break
        default: limit = Math.ceil((rangeEndDate - rangeStartDate) / 60 / resolution); break
      }
      return limit
    },
    getBars(symbolInfo, resolution, rangeStartDate, rangeEndDate, onLoadedCallback) {
      // console.log(' >> :', rangeStartDate, rangeEndDate)
      var ticker = this.symbol + '-' + resolution
      var tickerload = ticker + 'load'
      var tickerstate = ticker + 'state'
      if (!this.cacheData[ticker] && !this.cacheData[tickerstate]) {
        // 如果缓存没有数据，而且未发出请求，记录当前节点开始时间
        this.cacheData[tickerload] = rangeStartDate
        // 发起请求，从websocket获取当前时间段的数据
        this.initMessage(symbolInfo, resolution, rangeStartDate, rangeEndDate, onLoadedCallback)
        // 设置状态为true
        this.cacheData[tickerstate] = !0
        return false
      }

      if (!this.cacheData[tickerload] || this.cacheData[tickerload] > rangeStartDate) {
        // 如果缓存有数据，但是没有当前时间段的数据，更新当前节点时间
        this.cacheData[tickerload] = rangeStartDate
        // 发起请求，从websocket获取当前时间段的数据
        this.initMessage(symbolInfo, resolution, rangeStartDate, rangeEndDate, onLoadedCallback)
        // 设置状态为true
        this.cacheData[tickerstate] = !0
        return false
      }
      if (this.cacheData[tickerstate]) {
        // 正在从websocket获取数据，禁止一切操作
        return false
      }
      ticker = this.symbol + '-' + this.interval
      if (this.cacheData[ticker] && this.cacheData[ticker].length) {
        this.isLoading = false
        var newBars = []
        this.cacheData[ticker].forEach(item => {
          if (item.time >= rangeStartDate * 1000 && item.time <= rangeEndDate * 1000) {
            newBars.push(item)
          }
        })
        onLoadedCallback(newBars)
      } else {
        var self = this
        this.getBarTimer = setTimeout(function() {
          self.getBars(symbolInfo, resolution, rangeStartDate, rangeEndDate, onLoadedCallback)
        }, 100)
      }
    }
  }
}
</script>

<style lang="less" scoped>
#trade-view {
  height: calc(100vh - 30px);
}
</style>
