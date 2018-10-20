// pages/mypublish/mypublish.js
var API = require('../../utils/api.js')
import {
  Config
} from '../../utils/config.js';
import {
  myNews
} from 'mynews_model.js';
var mynews = new myNews();
var chinese = require("../../utils/Chinese.js")
var english = require("../../utils/English.js")
var app = getApp();
var page = 0;
var info = []
Page({

  /**
   * 页面的初始数据
   */
  data: {
    infolist: null,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    info = []
    var data = {
      openId: app.globalData.oppenid,
      page: 0,
    }
    this._loadInfoList(data)
    this.setData({
      content: app.getLanuage(app.globalData.language),
      end: false
    })
  },

  onShow: function () {
    this.setData({
      content: app.getLanuage(app.globalData.language)
    })
  },

  /**
   * 获取信息列表/按页显示
   */
  _loadInfoList: function (data) {
    mynews.getNews(data, (res) => {
      this.setData({
        infoList: res.data
      });
      if (this.data.infoList.length % 9 != 0 || this.data.infoList === 0) {
        page = page - 1
        for (var i = 0; i < this.data.infoList.length; i++)
          info.push(this.data.infoList[i])
        this.setData({
          infolist: info,
          end: true
        })
      }
    })
  },
  //删除信息
  delete: function (e) {
    var that = this
    var params = {
      pId: e.currentTarget.dataset.infoid,
    }
    console.log(params)
    wx.showModal({
      title: this.data.content.del,
      content: this.data.content.delmes,
      success: function (res) {
        if (res.confirm) {
          mynews.deleteInformation(params, (res) => {
            if (res.data === 1) {
              var index = e.currentTarget.dataset.index;
              var infolist = that.data.infolist;
              //移除列表中下标为index的项
              infolist.splice(index, 1);
              //更新列表的状态
              that.setData({
                infolist: infolist
              });
              wx.showToast({
                title: '成功',
                icon: 'success',
                duration: 2000
              })
              if (infolist == null) {
                wx.reLaunch({
                  url: '../my/my',
                })
              }
            }
          })
        }
      }
    })
  },
  /**
  * 点击图片查看
  */
  imageClick: function (e) {
    var src = e.currentTarget.dataset.src;
    var pictures = [];
    pictures.push(src)
    // var pictures = e.currentTarget.dataset.pictures.pictures;
    wx.previewImage({
      current: src,
      urls: pictures,
    })
  },
//下拉刷新
  onPullDownRefresh: function () {
    info = [];
    if (!this.data.end) {
      // 显示顶部刷新图标
      wx.showNavigationBarLoading();
      var data = {
        page: 0,
        openId: app.globalData.openId,
      }
      this._loadInfoList(data);
      // this.setData({
      //   infolist: this.data.infoList
      // })

      // 隐藏导航栏加载框
      wx.hideNavigationBarLoading();
      // 停止下拉动作
      wx.stopPullDownRefresh();
    }
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    if (!this.data.end) {
      var data = {
        page: page + 1,
        openId: app.globalData.openId,
      }
      // 显示加载图标
      wx.showLoading({
        title: '加载中',
      })
      this._loadInfoList(page);
      // 隐藏加载框
      wx.hideLoading();
    }
  },

})