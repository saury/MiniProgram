//app.js
var chinese = require("/utils/Chinese.js")
var english = require("/utils/English.js")
App({
  onLaunch: function () {
    // 展示本地存储能力
    var logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)

    // 登录
    wx.login({
      success: res => {
        // 发送 res.code 到后台换取 openId, sessionKey, unionId
        this.globalData.code = res.code
        
      }
    })
    // 获取用户信息 
    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.userInfo']) {
          
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
          wx.getUserInfo({
            success: res => {
              // 可以将 res 发送给后台解码出 unionId
              this.globalData.userInfo = res.userInfo

              // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
              // 所以此处加入 callback 以防止这种情况
             
              if (this.userInfoReadyCallback) {
                this.userInfoReadyCallback(res)
              }
            }
          })
        }else{
          wx.navigateTo({
            url: '/pages/loading/loading'
          })
        }
      }
    })
  },
  //改变语言
  getLanuage: function (lastLanuage) {
    if (lastLanuage == "中文") {
      return chinese.Content
    } else {
      return english.Content
    }
  },

  globalData: {
    language:"中文",
    userInfo: null,
    openid:null,
    code:null,
    appid:'wx5ef2de2111a9a82a',
    secret:'e3658cc08939eb93cf45238c536ec1e6',
  }
})