require('babel/polyfill');

const environment = {
  development: {
    isProduction: false
  },
  production: {
    isProduction: true
  }
}[process.env.NODE_ENV || 'development'];

module.exports = Object.assign({
  port: process.env.PORT,
  apiPort: process.env.APIPORT,
  app: {
    title: 'SonoSpeak',
    description: 'Sonos as intercom',
    meta: {
      charSet: 'utf-8',
      property: {
        'og:site_name': 'SonoSpeak',
        'og:image': '',
        'og:locale': 'en_US',
        'og:title': 'SonoSpeak',
        'og:description': 'Sonos as intercom',
        'twitter:card': 'summary',
        'twitter:site': '@magnusheini',
        'twitter:creator': '@magnusheino',
        'twitter:title': 'SonoSpeak',
        'twitter:description': 'Sonos as intercom',
        'twitter:image': '',
        'twitter:image:width': '200',
        'twitter:image:height': '200'
      }
    }
  }
}, environment);
