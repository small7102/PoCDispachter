const language = {
  Chinese: {
    login: {
      rememberPassword: '记住密码',
      noUserAlert: '用户名不能为空',
      errorLengthAlert: '用户名长度为11位字符',
      noPasswordAlert: '请输入密码',
      errorPasswordLengthAlert: '密码长度为6',
      loginBtnText: '登录',
      title: 'PoC集群调度系统',
      message: {
        1: "终端ID错误",
        2: "密码不正确",
        3: "没有默认群组",
        4: "账号被禁用",
        5: "在线到达上限，限制登录",
        6: "账号类型错误",
        "101": "系统繁忙",
        "102": "用户认证失败",
        "103": "用户没有注册",
        "104": "参数错误",
        "107": "没有权限操作",
        "503": '网络错误'
      }
    },
    main: {
      tip: '长按按键语音，松开语音取消',
      onlineNotice: '上线',
      offlineNotice: '下线',
      switchNotice: '切换群组',
      repeatLoginNotice: '您的账号在其他终端登录',
      tempGroupName: '临时群组',
      calling: '正在通话',
      cancelTempGroupNotice: '解散了临时群组',
      creatTempGroupNotice: '创建了临时群组',
      quitTempGroupNotice: '退出临时群组',
      callingBusy: '占线中...',
      lat: '纬度',
      lng: '经度',
      modal: {
        title: '麦克风权限',
        desc: '麦克风没有权限，或者浏览器不支持麦克风，请检查',
        checkboxVal: '不再提醒',
        okBtnText: '知道了'
      },
      message: {
        0: '创建临时群组',
        1: '解散临时群组',
        2: '发起通话',
        3: '结束通话',
        4: '退出临时群组',
        5: '上线',
        6: '下线',
        7: '重复登录',
        8: '切换群组',
        9: {
          '0': '遥毙',
          '1': '遥晕',
          '8': '激活'
        },
        100: '登录',
        101: 'GPS定位',
        102: '报警',
        103: '短信'
      }
    },
    home: {
      home: {
        title: "群组",
        voiceTitle: '语音记录',
        messageTitle: '消息记录'
      },
      blockGroup: {
        name: '群组',
        tempGroup: '临时群组',
        memberLength: '群组成员',
        onlineLength: '当前在线',
        atGroupAlert: '您已经在当前组',
        calling: '在通话...',
        message: {
          0: {
            type: 'success',
            info: '切换群组'
          },
          1: {
            type: 'info',
            info: '此群组ID不存在'
          },
          2: {
            type: 'info',
            info: '不再此群组'
          }
        }
      },
      addTempGroup: {
        title: '临时群组',
        name: '名称',
        creater: '创建人',
        memberLength: '群组成员',
        onlineLength: '当前在线',
        tempGroupTitle: '临时群组名称',
        placeholder: '请输入群名称...',
        saveBtnText: '保存记录',
        submitText: '确定',
        noNameAlert: '名称不能为空',
        nameLengthAlert: '不能大于20个字符',
        repeatNameAlert: '该名称已存在'
      },
      sendMessage: {
        noMessage: '暂无消息',
        placeholder: '请输入...',
        sendBtnText: '发送',
        noValueAlert: '发送信息不能为空'
      },
      rightGroup: {
        recentGroup: '最近群组',
        quickGroup: '快捷群组',
        noRecentGroup: '暂无最近群组记录',
        noGroup: '暂无快捷群组记录',
        delBtnText: '删除所有'
      },
      voiceList: {
        noData: '暂无记录',
        moreData: '更多',
        nowAt: '当前处于'
      }
    },
    header: {
      title: 'PoC集群调度系统',
      quitBtnText: '退出',
      loginSuceessInfo: '欢迎登录',
      nowGroup: '当前所在群组'
    },
    tabs: {
      voiceDispatcher: '语音调度',
      mapMonitoring: '地图监控',
      trackReplay: '轨迹回放',
      log: '日志'
    },
    settings: {
      title: '自定义设置',
      quickKey: '快捷键',
      tip: '鼠标放上后，直接按下快捷键',
      openNotice: {
        name:'接收通知',
        items: {
          createGroup: '创建临时群组',
          onlineSetting: '上下线',
          switchGroup: '切换群组',
          quitTempGroup: '退出临时群组',
          cancelTempGroup: '解散临时群组'
        }
      }
    },
    searchGroup: {
      placeholder: '请输入...',
      noInpWarning: '名称不能为空',
      noResultWarning: '该终端不存在'
    },
    mapMonitoring: {
      successAlert: '设置成功',
      tip: '右键按住框选成员或点击下方按钮',
      title: '已选成员',
      noData: '您还没有选中的成员',
      selectBtnText: '选择当前屏幕成员',
      delText: '删除所有',
      cancelBtnText: '取消',
      messageBtnText: '消息',
      messageCtx: {
        title: '消息',
        placeholder: '请输入...',
        submitText: '发送',
        noWordAlert: '发送不能空信息'
      }
    },
    log: {
      operateLog: '操作日志',
      alarmLog: '报警记录',
      tabelTitle: {
        time: '时间',
        name: '(终端ID) 名称',
        type: '操作类型',
        remark: '备注'
      }
    },
    store: {
      mixin: {
        nowGroup: '当前所在群组',
        noName: '无',
        tempGroup: '临时群组',
        singleGroup: '单呼',
        createTempGroup: '创建临时群组',
        brokenSingleCalling: '单呼已取消',
        brokenTempGroup: '临时群组已解散',
        quitTempGroup: '您已退出临时群组',
        breakTempGroup: '解散临时群组',
        message: {
          0: {
            type: 'error',
            info: '请选择临时群组成员'
          },
          1: {
            type: 'success',
            info: '单呼创建成功'
          },
          2: {
            type: 'success',
            info : '临时群组创建成功'
          },
          3: {
            type: 'error',
            info: '该临时群组已存在'
          },
          4: {
            type: 'warning',
            info: '对方正忙'
          },
          5: {
            type: 'error',
            info: '您不能与自己创建单呼'
          }
        }
      },
      logType: {
        0: '组建临时群组',
        1: '解除临时群组',
        2: '语音呼叫',
        3: '结束呼叫',
        4: '退出临时群组',
        5: '终端上线',
        6: '终端下线',
        8: '切换群组',
        9: '通话设置',
        100: '登录',
        101: 'GPS定位',
        102: '报警',
        103: '短信'
      }
    }
  }
}

export default language
