<template>
  <view class="container">
    <scroll-view
      id="scroll-content"
      :scroll-top="scroll_top"
      :scroll-y="true"
      class="dialog-part"
      :scroll-into-view="'translate-' + toView"
      :enable-back-to-top="true"
      :scroll-with-animation="true"
    >
      <view
        class="dialog-wrap"
        id="translate-empty"
        v-if="!recording && dialogList.length == 0"
      >
        <result-bubble :item="initTranslate" :record-status="0" @modaldelete.stop="deleteItem"></result-bubble>
      </view>
      <view
        v-for="(item, index) in dialogList"
        :key="index"
        class="dialog-wrap"
        :data-index="index"
      >
        <result-bubble
          :item="item"
          :edit-show="index == dialogList.length - 1"
          :index="index"
          :current-translate-voice="currentTranslateVoice"
          @modaldelete.stop="deleteItem"
          @translate="translateTextAction"
          @expired="expiredAction"
        ></result-bubble>
      </view>
      <view class="dialog-wrap" id="translate-recording" v-if="recording">
        <result-bubble
          :item="currentTranslate"
          :record-status="recordStatus"
          @modaldelete.stop="deleteItem"
        ></result-bubble>
      </view>
      <view id="translate-fake"></view>
    </scroll-view>

    <view class="foot-group" @longpress.stop="catchTapEvent">
      <bottom-button
        :button-disabled="bottomButtonDisabled"
        @recordstart="streamRecord"
        @recordend="streamRecordEnd"
      ></bottom-button>
    </view>
  </view>
</template>
<script>
import { language } from "@/common/conf.js";
import BottomButton from "../components/bottom-button/bottom-button";
import ResultBubble from "../components/result-bubble/result-bubble";
import util from '@/common/utils.js'
const plugin = requirePlugin("WechatSI");
const noVoice = '/pagesOther/static/no_voice.png'
const manager = plugin.getRecordRecognitionManager()
export default {
  components: { BottomButton, ResultBubble },
  data() {
    return {
      dialogList: [],
      scroll_top: 10000, // 竖向滚动条位置

      bottomButtonDisabled: false, // 底部按钮disabled

      tips_language: language[0], // 目前只有中文

      initTranslate: {
        // 为空时的卡片内容
        create: util.recordTime(new Date()),
        text: "等待说话",
      },

      currentTranslate: {
        // 当前语音输入内容
        create: util.recordTime(new Date()),
        text: "等待说话",
      },
      recording: false, // 正在录音
      recordStatus: 0, // 状态： 0 - 录音中 1- 翻译中 2 - 翻译完成/二次翻译

      toView: "fake", // 滚动位置
      lastId: -1, // dialogList 最后一个item的 id
      currentTranslateVoice: "", // 当前播放语音路径
    };
  },
  onLoad () {
    console.log('start')
    this.getHistory();
    this.initRecord();
    this.toView = this.toView;
    uni.getSetting({
      success(res) {
        console.log("succ");
        console.log(res);
        if (!res.authSetting["scope.record"]) {
          uni.authorize({
            scope: "scope.record",
            success() {
              // 用户已经同意小程序使用录音功能，后续调用 uni.startRecord 接口不会弹窗询问
              console.log("succ auth");
            },
            fail() {
              console.log("fail auth");
            },
          });
        } else {
          console.log("record has been authed");
        }
      },
      fail(res) {
        console.log("fail");
        console.log(res);
      },
    });
  },
  onHide () {
    this.setHistory();
  },
  methods: {
    /**
     * 按住按钮开始语音识别
     */
    streamRecord (e) {
      // console.log("streamrecord" ,e)
      let buttonItem = e.buttonItem || {};
      manager.start({
        lang: buttonItem.lang,
      });
      this.recordStatus = 0
      this.recording = true
      this.currentTranslate = {
        // 当前语音输入内容
        create: util.recordTime(new Date()),
        text: "正在聆听中",
        lfrom: buttonItem.lang,
        lto: buttonItem.lto,
      }
      this.scrollToNew();
    },

    /**
     * 松开按钮结束语音识别
     */
    streamRecordEnd (e) {
      console.log("streamRecordEnd" ,e)
      let buttonItem = e.buttonItem || {}; // 自定义组件触发事件时提供的detail对象

      // 防止重复触发stop函数
      if (!this.recording || this.recordStatus != 0) {
        console.warn("has finished!");
        return;
      }

      manager.stop();
      this.bottomButtonDisabled = true
    },

    /**
     * 翻译
     */
    translateText (item, index) {
      let lfrom = item.lfrom || "zh_CN";
      let lto = item.lto || "en_US";

      plugin.translate({
        lfrom: lfrom,
        lto: lto,
        content: item.text,
        tts: true,
        success: (resTrans) => {
          let passRetcode = [
            0, // 翻译合成成功
            -10006, // 翻译成功，合成失败
            -10007, // 翻译成功，传入了不支持的语音合成语言
            -10008, // 翻译成功，语音合成达到频率限制
          ];

          if (passRetcode.indexOf(resTrans.retcode) >= 0) {
            let tmpDialogList = this.dialogList.slice(0);

            if (!isNaN(index)) {
              let tmpTranslate = Object.assign({}, item, {
                autoPlay: true, // 自动播放背景音乐
                translateText: resTrans.result,
                translateVoicePath: resTrans.filename || "",
                translateVoiceExpiredTime: resTrans.expired_time || 0,
              });

              tmpDialogList[index] = tmpTranslate;

              this.dialogList = tmpDialogList
              this.bottomButtonDisabled = false
              this.recording = false

              this.scrollToNew();
            } else {
              console.error("index error", resTrans, item);
            }
          } else {
            console.warn("翻译失败", resTrans, item);
          }
        },
        fail (resTrans) {
          console.error("调用失败", resTrans, item);
          this.bottomButtonDisabled = false
          this.recording = false
        },
        complete: (resTrans) => {
          this.recordStatus = 1
          uni.hideLoading();
        },
      });
    },

    /**
     * 修改文本信息之后触发翻译操作
     */
    translateTextAction (e) {
      // console.log("translateTextAction" ,e)
      let item = e.item;
      let index = e.index;

      this.translateText(item, index);
    },

    /**
     * 语音文件过期，重新合成语音文件
     */
    expiredAction (e) {
      let item = e.item || {};
      let index = e.index;

      if (isNaN(index) || index < 0) {
        return;
      }

      let lto = item.lto || "en_US";

      plugin.textToSpeech({
        lang: lto,
        content: item.translateText,
        success: (resTrans) => {
          if (resTrans.retcode == 0) {
            let tmpDialogList = this.dialogList.slice(0);

            let tmpTranslate = Object.assign({}, item, {
              autoPlay: true, // 自动播放背景音乐
              translateVoicePath: resTrans.filename,
              translateVoiceExpiredTime: resTrans.expired_time || 0,
            });
            tmpDialogList[index] = tmpTranslate;
            this.dialogList = tmpDialogList
          } else {
            console.warn("语音合成失败", resTrans, item);
          }
        },
        fail (resTrans) {
          console.warn("语音合成失败", resTrans, item);
        },
      });
    },

    /**
     * 初始化为空时的卡片
     */
    initCard () {
      let initTranslateNew = Object.assign({}, this.initTranslate, {
        create: util.recordTime(new Date()),
      });
      this.initTranslate = initTranslateNew
    },

    /**
     * 删除卡片
     */
    deleteItem (e) {
      console.log("deleteItem" ,e)
      // let detail = e.detail;
      let item = e.item;

      let tmpDialogList = this.dialogList.slice(0);
      let arrIndex = e.index;
      tmpDialogList.splice(arrIndex, 1);

      // 不使用setTImeout可能会触发 Error: Expect END descriptor with depth 0 but get another
      setTimeout(() => {
        this.dialogList = tmpDialogList
        if (tmpDialogList.length == 0) {
          this.initCard();
        }
      }, 0);
    },
    /**
     * 识别内容为空时的反馈
     */
    showRecordEmptyTip () {
      this.recording = false
      this.bottomButtonDisabled = false
      uni.showToast({
        title: this.tips_language.recognize_nothing,
        icon: "success",
        image: noVoice,
        duration: 1000,
        success (res) {},
        fail (res) {
          console.log(res);
        },
      });
    },

    /**
     * 初始化语音识别回调
     * 绑定语音播放开始事件
     */
    initRecord () {
      //有新的识别内容返回，则会调用此事件
      manager.onRecognize = (res) => {
        let currentData = Object.assign({}, this.currentTranslate, {
          text: res.result,
        });
        this.currentTranslate = currentData
        this.scrollToNew();
      };

      // 识别结束事件
      manager.onStop = (res) => {
        let text = res.result;

        if (text == "") {
          this.showRecordEmptyTip();
          return;
        }

        let lastId = this.lastId + 1;

        let currentData = Object.assign({}, this.currentTranslate, {
          text: res.result,
          translateText: "正在翻译中",
          id: lastId,
          voicePath: res.tempFilePath,
        });

        this.currentTranslate = currentData
        this.recordStatus = 1
        this.lastId = lastId

        this.scrollToNew();

        this.translateText(currentData, this.dialogList.length);
      };

      // 识别错误事件
      manager.onError = (res) => {
        this.recording = false
        this.bottomButtonDisabled = false
      };

      // 语音播放开始事件
      uni.onBackgroundAudioPlay((res) => {
        const backgroundAudioManager = uni.getBackgroundAudioManager();
        let src = backgroundAudioManager.src;
        this.currentTranslateVoice = src
      });
    },

    /**
     * 设置语音识别历史记录
     */
    setHistory () {
      try {
        let dialogList = this.dialogList;
        dialogList.forEach((item) => {
          item.autoPlay = false;
        });
        uni.setStorageSync("history", dialogList);
      } catch (e) {
        console.error("setStorageSync setHistory failed");
      }
    },

    /**
     * 得到历史记录
     */
    getHistory () {
      try {
        let history = uni.getStorageSync("history");
        if (history) {
          let len = history.length;
          let lastId = this.lastId;
          if (len > 0) {
            lastId = history[len - 1].id || -1;
          }
          this.dialogList = history
          this.toView = this.toView
          this.lastId = lastId
        }
      } catch (e) {
        // Do something when catch error
        this.dialogList = []
      }
    },

    /**
     * 重新滚动到底部
     */
    scrollToNew () {
      this.toView = this.toView
    },
  },
};
</script>
<style scoped>
/**index.wxss**/

.flex-column {
  display: flex;
  display: -webkit-flex;
  -webkit-flex-direction: column;
  flex-direction: column;
  align-items: center;
  -webkit-align-items: center;
  justify-content: space-between;
  -webkit-justify-content: space-between;
}

.dialog-wrap {
  position: relative;
  padding: 0rpx 40rpx 50rpx 40rpx;
  box-sizing: border-box;
  display: flex;
  display: -webkit-flex;
  width: 100%;
  flex-direction: column;
  -webkit-flex-direction: column;
}

.send-message .text-detail {
  color: #9b9b9b;
}

.dialog-part {
  position: absolute;
  left: 0;
  top: 0;
  bottom: 257rpx;
  right: 0;
  z-index: 1;
}

.user-input {
  flex: 1;
  height: 60rpx;
  box-sizing: border-box;
  margin: 0 10px;
  border-radius: 10rpx;
}

.text-content {
  margin: 0 48px 0 0;
  box-sizing: border-box;
}

.edit-icon {
  position: absolute;
  right: 10rpx;
  bottom: 0;
  padding: 0 8rpx;
}

.play-icon {
  position: absolute;
  right: 10rpx;
  bottom: 14rpx;
  padding: 0 8rpx;
  display: flex;
  align-items: center;
}

.play-loud-icon {
  position: absolute;
  right: 0;
  bottom: 14rpx;
  padding: 0 8rpx;
  display: flex;
  align-items: center;
}

.text-detail {
  font-size: 18px;
  line-height: 24px;
  /*margin-right: 25px;*/
  box-sizing: border-box;
  font-family: "PingFang-SC-Regular", "SimSun", "Microsoft Yahei";
  font-variant-ligatures: none;
}

.translate-message {
  position: relative;
}

.send-message {
  position: relative;
}

.create-time {
  font-size: 14px;
  color: #b2b2b2;
  margin-bottom: 5px;
  display: flex;
  display: -webkit-flex;
  justify-content: center;
  -webkit-justify-content: center;
}

.filter-blur {
  -webkit-filter: blur(5px);
  filter: blur(5px);
}

.empty-tip {
  position: absolute;
  margin: auto;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
  height: 24px;
  width: 100px;
  font-size: 24px;
  color: #000000;
  opacity: 0.1;
}

.translate-fake {
  width: 100%;
  height: 1px;
}

.foot-group {
  position: fixed;
  left: 0;
  bottom: 0;
  z-index: 40;
  width: 100%;
}
</style>