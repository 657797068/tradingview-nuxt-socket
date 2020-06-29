<template>
  <div class="home">
    <header class="home__header">
      <a-tabs
        :active-key="resolution"
        class="resolutions charts-item"
        @change="checkResolution"
      >
        <a-tab-pane v-for="(item,index) in btnList" :key="index+''" :tab="item.label" />
      </a-tabs>
    </header>
    <Tradingview ref="trade" :symbol="symbol" :interval="interval" />
  </div>
</template>

<script>
import Tradingview from '@/components/tradingview'
export default {
  name: 'Home',
  components: {
    Tradingview
  },
  data() {
    return {
      resolution: 1,
      symbol: 'BTCUSDT',
      interval: '1D',
      btnList: [
        {
          label: '分时',
          resolution: '1',
          chartType: 3
        },
        {
          label: '1分',
          resolution: '1',
          chartType: 1
        },
        {
          label: '5分',
          resolution: '5',
          chartType: 1
        },
        {
          label: '15分',
          resolution: '15',
          chartType: 1
        },
        {
          label: '30分',
          resolution: '30',
          chartType: 1
        },
        {
          label: '1小时',
          resolution: '60',
          chartType: 1
        },
        {
          label: '1天',
          resolution: '1D',
          chartType: 1
        },
        {
          label: '1周',
          resolution: '1W',
          chartType: 1
        },
        {
          label: '1月',
          resolution: '1M',
          chartType: 1
        },
        {
          label: '指标',
          resolution: '',
          chartType: '8'
        },
        {
          label: '设置',
          resolution: '',
          chartType: '9'
        },
        {
          label: '全屏',
          resolution: '',
          chartType: '10'
        }
      ]
    }
  },
  mounted() {
    console.log('0.0.0.')
    this.$refs.trade.init()
    // setTimeout(() => {

    // }, 2000)
  },
  methods: {
    // 切换分时
    checkResolution(key) {
      var ticker = this.symbol + '-' + this.interval
      var tickerstate = ticker + 'state'
      if (this.$refs.trade.cacheData[tickerstate]) {
        return false
      }
      const what = this.$refs.trade.widget.chart()
      var item = this.btnList[key]
      switch (key) {
        case '9':
          what.executeActionById('insertIndicator')
          break
        case '10':
          what.executeActionById('chartProperties')
          break
        case '11':
          this.$refs.trade.fullScreen()
          break
        default:
          this.resolution = key
          localStorage.resolutionIndex = key
          localStorage.interval = item.resolution
          what.setChartType(item.chartType)
          what.setResolution(item.resolution, function onReadyCallback() {})
          break
      }
    }
  }
}
</script>

<style lang="less">
.home {
    text-align: center;

    &__header {
        display: flex;
        justify-content: center;
        align-items: center;
        background-color: #fff;
        height: 30px;
    }

    &__title {
        display: block;
        font-size: 1.5em;
    }
    .ant-tabs-bar{
      border: none;
      margin-bottom: 0;
    }
    .operate{
      height: 100%;
    }
}
</style>
