<template>
  <view class="index-wrap">
    <view class="cloud-back-box">
      <clouds></clouds>
    </view>
    <view class="index-body-wrap">
      <!-- <view class="header ware">

			</view> -->
      <uni-grid :gridList="gridsData" :column="3"></uni-grid>
    </view>
  </view>
</template>

<script>
import uniGrid from "@/components/uni-grid/uni-grid.vue";
import clouds from "@/pages/index/cloud.vue";
export default {
  components: {
    clouds,
    uniGrid,
  },
  data() {
    return {
      gridsData: [
        {
          title: "实用工具",
          id: 1,
          lists: [
            {
              path: "/pages/websecret/index/index",
              text: "网密",
              image: "/static/websecret.png",
              backgroundImage: "",
            },
            {
              path: "/pages/puzzle/index/index",
              text: "拼图",
              image: "/static/movable.png",
              backgroundImage: "",
            },
            {
              path: "/pages/weather/weather",
              text: "天气",
              image: "/static/weather.png",
              backgroundImage: "",
            },
            // #ifndef H5
            {
              path: "/pages/scan/scan",
              text: "OCR",
              image: "/static/ocr.png",
              backgroundImage: "",
            },
            // #endif
            {
              path: "/pages/navigation/index/index",
              text: "地点收藏",
              image: "/static/map.png",
              backgroundImage: "",
            },
          ],
        },
        {
          title: "生活趣味",
          id: 2,
          lists: [
            {
              path: "/pages/turntable/turntable",
              text: "决与择",
              image: "/static/turntable.png",
              backgroundImage: "",
            },
          ],
        },
        // #ifdef MP-WEIXIN
        {
          title: "三方服务",
          id: 3,
          lists: [
            {
              path: "/pagesOther/voice/voice",
              text: "同声传译",
              image: "https://ifile.jialekoi.cn/qingyun/3/1.png",
              backgroundImage: "",
            },
          ],
        }
        // #endif
      ],
    };
  },
  onLoad() {
    this.getAllCategory();
  },
  // #ifndef H5
  onShareAppMessage() {
    return {
      title: "生活不易，我选青云器",
      desc: "一切为了你生活的小便捷和小乐趣",
      path: "/pages/index/index",
    };
  },
  // #endif
  methods: {
    navigate(e) {
      const { path } = e.currentTarget.dataset;
      if (path) {
        uni.navigateTo({
          url: path,
        });
      }
    },
    getAllCategory() {
      const vx = this;
      const gridsData = this.gridsData.slice();
      let platform = "";
      // #ifdef H5
      platform = "H5";
      // #endif

      this.$gd
        .uniRequest({
          url: "cornucopia/congar",
          isGet: true,
          data: {
            platform,
          },
          notAuth: true,
        })
        .then((res) => {
          if (res.data.length) {
            gridsData.forEach((grid) => {
              res.data.forEach((item) => {
                if (grid.id === item.id) {
                  grid.lists.push(...item.lists);
                } else {
                  gridsData.push(item);
                }
              });
            });
            vx.gridsData = gridsData;
          }
        });
    },
  },
};
</script>

<style lang="scss" scoped>
.index-wrap {
  background-color: #f9f9f9;
  width: 100vw;
  position: relative;
  z-index: 0;
  /* #ifndef H5 */
  min-height: 100vh;
  /* #endif */
  /* #ifdef H5 */
  min-height: calc(100vh - 44px);

  /* #endif */
  .cloud-back-box {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 1;
  }

  .index-body-wrap {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 2;
    padding: 0 10rpx;
    padding-top: 15rpx;
    overflow: scroll;
  }

  .ware {
    margin-bottom: 15rpx;
  }

  .header {
    width: 100%;
    border-radius: 15rpx;
    height: 250rpx;
    background-color: var(--base-color);
    overflow: hidden;
  }

  .body {
    width: 100%;
    border-radius: 15rpx;
    background-color: rgba(255, 255, 255, 0.7);

    .title {
      padding: 30rpx;
      color: #4a4a4a;
      font-size: 32rpx;
    }

    .grid-item-box {
      display: flex;
      justify-content: center;
      align-items: center;
      flex-direction: column;
      flex: 1;
      position: relative;
      padding: 30rpx 0;

      .grid-item-image {
        width: 50rpx;
        height: 50rpx;

        image {
          width: 100%;
          height: 100%;
        }
      }

      .text {
        font-size: 24rpx;
        margin-top: 15rpx;
        color: #4a4a4a;
      }
    }
  }
}
</style>
