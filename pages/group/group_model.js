import { Base } from '../../utils/base.js';

class Group extends Base {
  constructor(){
    super();
  }
  
  loadGroupDevices(groupid,callback) {
    var param = {
      url: 'deviceaccess/group/devices/'+groupid+'?limit=1000',
      sCallback: function(data){
        callback && callback(data);
      }
    };

    this.request(param);    
  }

  unassignDevice(groupId, deviceId,sCallback,fCallback) {
    var param = {
      url: `deviceaccess/unassign/group/${groupId}/${deviceId}`,
      method: 'DELETE',
      sCallback: function(res) {
        sCallback && sCallback(res);
      },
      fCallback: function(err) {
        fCallback && fCallback(err);
      }
    };

    this.request(param);
  }

  /**==================控制分类页的开关设备============= */
  /**
   * 获取设备（开关）服务--获取控制面板
   */

  getService(triad) {
    var that = this;
    var p = new Promise(function (resolve, reject) {
      var manufacture = triad.manufacture;
      var deviceType = triad.deviceType;
      var model = triad.model;
      var param = {
        url: `servicemanagement/ability/${manufacture}/${deviceType}/${model}`,
        sCallback: function (res) {
          resolve && resolve(res);
        },
        fCallback: function (err) {
          reject && reject(err);
        }
      }

      that.request(param);
    })

    return p;

  }

  /**
   * 获取设备属性，得到endpoint和shortaddress
   */
  getDeviceAttr(deviceId) {
    var that = this;
    var p = new Promise(function (resolve, reject) {
      var param = {
        url: `deviceaccess/allattributes/${deviceId}`,
        sCallback: function (res) {
          resolve && resolve(res);
        },
        fCallback: function (err) {
          reject && reject(err);
        }
      }

      that.request(param);
    })

    return p;
  }



  /**
   * 调用控制接口，控制开关
   * sendControl
   */
  sendControl(deviceId, requestId, body) {
    //body可以是对象
    var that = this;
    var p = new Promise(function (resolve, reject) {
      var param = {
        url: 'deviceaccess/rpc/' + deviceId + '/' + requestId,
        method: 'POST',
        data: body,
        sCallback: function (res) {
          resolve && resolve(res);
        },
        fCallback: function (err) {
          reject && reject(err);
        }
      };

      that.request(param);
    })

    return p;
  }

  /**对外只暴露这一个控制方法，在内部链式调用其他需要的方法 */
  turnSwitch(data, sCallback, fCallback) {
    var that = this;
    var _data = {};

    this.getDeviceAttr(data.deviceId)
      //获取设备属性
      .then(function (res) {
        if (res) {
          _data.attr = res;
          return that.getService(data.triad);
        } else {
          wx.showToast({
            title: '应用失败',
            image: '../../imgs/icon/pay@error.png',
            duration: 1000,
            // mask: true
          });
        }

      })
      //获取设备服务
      .then(function (res) {
        if (res) {
          var abilityDes = JSON.parse(res[0].abilityDes);
          _data.service = abilityDes;
          var serviceBody = abilityDes.serviceBody;
          var params = serviceBody.params;

          //根据键值查设备属性值
          var getAttrVal = function (key, list) {
            for (let i = 0; i < list.length; i++) {
              if (list[i].key == key)
                return list[i].value;
            }
            return undefined;
          }
          var body = {
            serviceName: abilityDes.serviceName,
            methodName: serviceBody.methodName
          }

          params.forEach(function (e) {
            body[e.key] = getAttrVal(e.key, _data.attr);
          })
          body.status = data.status;

          return that.sendControl(data.deviceId, data.requestId, body);
        } else {
          wx.showToast({
            title: '应用失败',
            image: '../../imgs/icon/pay@error.png',
            duration: 1000,
            // mask: true
          });
        }

      })
      .then((res) => {
        sCallback && sCallback(res);
      })
      .catch((err) => {
        fCallback && fCallback(err);
      });

  }

  /**=================END======================= */

}

export { Group };