const pkg = require('./package')
// const path = require('path')

module.exports = {
  mode: 'universal',
  build: {
    extend(config, ctx) {
      // Run ESLint on save
      if (ctx.isDev && ctx.isClient) {
        config.module.rules.push({
          enforce: 'pre',
          exclude: /(node_modules)/,
          loader: 'eslint-loader',
          test: /\.(js|vue)$/
        })
      }

      // Use relative paths
      if (!ctx.isDev) {
        console.log('isdev')
        config.output.publicPath = './_nuxt/'
      }
    }
    // postcss: {
    // 	// 添加插件名称作为键，参数作为值
    // 	// 使用npm或yarn安装它们
    // 	plugins: {
    // 		// 通过传递 false 来禁用插件
    // 		'postcss-url': false,
    // 		'postcss-nested': {},
    // 		'postcss-responsive-type': {},
    // 		'postcss-hexrgba': {}
    // 	},
    // 	preset: {
    // 		// 更改postcss-preset-env 设置
    // 		autoprefixer: {
    // 			grid: true
    // 		}
    // 	}
    // }
  },

  css: [
    'ant-design-vue/dist/antd.css'
  ],
  head: {
    title: pkg.name,
    meta: [
      {
        charset: 'utf-8'
      },
      {
        content: 'width=device-width, initial-scale=1,maximum-scale=1.0, user-scalable=0;',
        name: 'viewport'
      },
      {
        content: pkg.description,
        hid: 'description',
        name: 'description'
      }
    ],
    link: [
      {
        href: '/favicon.ico',
        rel: 'icon',
        type: 'image/x-icon'
      }
    ]
  },
  loading: {
    color: '#fff'
  },

  /**
	 * Nuxt.js modules
	 */
  modules: [
    '@nuxtjs/style-resources'
  ],

  proxy: [
    [
      '/api',
      {
        target: 'http://localhost:3001', // api主机
        pathRewrite: { '^/api': '/' }
      }
    ]
  ],

  /**
	 * Plugins to load before mounting the App
	 */
  plugins: [
    '@/plugins/antd-ui',
    { src: '@/components/tradingview/datafeeds/charting_library.min.js', ssr: false }

  ],
  generate: {
    routes: ['/zh', '/about', '/zh-CN', '/zh-CN/about']
  },
  /**
	 * Router
	 */
  router: {
    // Enable functionality when loading `dist/index.html`
    // directly in the browser
    base: '/',
    mode: 'history'
    // middleware: ['i18n', 'redirect'],
    // extendRoutes(routes, resolve) {
    //   routes.push({
    //     name: 'custom',
    //     path: '*',
    //     component: resolve(__dirname, 'pages/system/404.vue')
    //   })
    // }
  },

  /**
	 * Global Sass variables
	 */
  styleResources: {
    // scss: [ './assets/scss/variables.scss' ]
    less: [
      'styles/baseColor.less'
    ]
  }
}
