;(() => {
  const GitHubInfo = {
    requestAPI: (url, callback, timeout) => {
      let retryTimes = 5
      function request() {
        return new Promise((resolve, reject) => {
          let status = 0 // 0 等待 1 完成 2 超时
          let timer = setTimeout(() => {
            if (status === 0) {
              status = 2
              timer = null
              reject('请求超时')
              if (retryTimes == 0) {
                timeout()
              }
            }
          }, 5000)
          fetch(url)
            .then(function (response) {
              if (status !== 2) {
                clearTimeout(timer)
                resolve(response)
                timer = null
                status = 1
              }
              if (response.ok) {
                return response.json()
              }
              throw new Error('Network response was not ok.')
            })
            .then(function (data) {
              retryTimes = 0
              callback(data)
            })
            .catch(function (error) {
              if (retryTimes > 0) {
                retryTimes -= 1
                setTimeout(() => {
                  request()
                }, 5000)
              } else {
                timeout()
              }
            })
        })
      }
      request()
    },
    layout: function (cfg) {
      const el = $(cfg.el)[0]
      function fill(data) {
        for (let key of Object.keys(data)) {
          $(el)
            .find('[type=text]#' + key)
            .text(data[key])
          $(el)
            .find('[type=link]#' + key)
            .attr('href', data[key])
          $(el)
            .find('[type=img]#' + key)
            .attr('src', data[key])
        }
      }
      this.requestAPI(
        cfg.api,
        function (data) {
          const idx = el.getAttribute('index')
          if (idx != undefined) {
            const arr = data.content || data
            if (arr && arr.length > idx) {
              let obj = arr[idx]
              obj['latest-tag-name'] = obj['name']
              fill(arr[idx])
            }
          } else {
            fill(data)
          }
        },
        function () {}
      )
    },
    init: function () {
      const els = document.getElementsByClassName('stellar-ghinfo-api')
      for (let i = 0; i < els.length; i++) {
        const el = els[i]
        const api = el.getAttribute('api')
        if (api == null) {
          continue
        }
        this.layout({
          el,
          api,
          class: el.getAttribute('class'),
        })
      }
    },
  }
  stellaris.registerThemePlugin('.stellar-ghinfo-api', GitHubInfo)
})()
