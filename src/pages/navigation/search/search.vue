<template>
  <view class="container">
    <view class="search-box">
      <view class="city-box" @tap="translate">
        <view class="city">{{ cityName }}</view>
        <view class="iconfont icon-arrow-down"></view>
      </view>
      <view class="search-input">
        <uni-search-bar
          v-model="keyWord"
          placeholder="请输入关键字"
          @confirm="search"
        ></uni-search-bar>
      </view>
    </view>
    <view class="addr-list">
      <mescroll-uni
        top="40px"
        :down="downOption"
        @down="downCallback"
        :up="upOption"
        @up="upCallback"
      >
        <button
          v-for="(item, index) in searchList" :key="index"
          @tap.stop="goCardDetail(item)"
          plain
          class="item"
          hover-class="button-hover-class"
        >
          <view class="address-box">
            <text class="title">{{ item.title }}</text>
            <text class="address">{{ item.address }}</text>
            <text class="phone" v-if="item.tel">电话：{{item.tel}}</text>
          </view>
        </button>
      </mescroll-uni>
    </view>

    <!--  定位地址  -->
		<area-picker :show="areaShow" :animation="animated" :provinces="provinces" :citys="citys" :value="areaVal" @hidden="hiddenFloatView" @change="bindChange"></area-picker>
  </view>
</template>

<script>
import uniSearchBar from "@/components/uni-search-bar/uni-search-bar.vue";
import { TX_MAP_KEY } from "@/common/config";
import MescrollUni from "mescroll-uni";
import Vue from 'vue'
import model from '@/common/area.js'
import areaPicker from '@/pages/navigation/search/area.vue'
export default {
  components: { uniSearchBar, MescrollUni, areaPicker },
  data() {
    return {
      areaShow: false,
      animated: null,
      provinces: [],
      citys: [],
      areaVal: [0,0],
      upOption: {
        use: true,
        auto: true,
        page: {
          num: 0,
          size: 15,
        },
        noMoreSize: 10,
        empty: {
          tip: "暂无数据",
        },
      },
      downOption: {
        use: true,
        auto: false,
      },
      mescroll: {},
      keyWord: '',
      searchList: []
    };
  },
  computed: {
    cityName() {
      return this.$store.state.cityMap
    }
  },
  onLoad() {
    this.keyWord = this.$store.state.searchMap || ''
  },
  onReady(e) {
    const vx = this
    model.updateAreaData(this, 0, e, (res) => {
      vx.animated = res.animated
      vx.areaShow = res.show
      vx.provinces = res.provinces
      vx.citys = res.citys
      vx.areaVal = res.value
    });
  },
  methods: {
    goCardDetail(item) {
      const pages = getCurrentPages()
      if (pages.length > 1) {
        const PrePage = pages[pages.length - 2]
        this.$store.commit('searchMap', item.title)
        PrePage.$vm.moveToLocation(item)
        uni.navigateBack()
      }
    },
    getAllAddresss() {
				this.downCallback(this.mescroll)
			},
    downCallback(mescroll) {
      mescroll.resetUpScroll();
    },
    upCallback(mescroll) {
      const vx = this;
      let pageNum = mescroll.num; // 页码, 默认从1开始
      let pageSize = mescroll.size; // 页长, 默认每页10条
      if (mescroll.num == 1) {
        this.mescroll = mescroll;
      }
      this.getAddress(pageNum, pageSize)
        .then((res) => {
          let hasNext = res.data.length >= 8;
          //设置列表数据
          if (mescroll.num == 1) vx.searchList = []; //如果是第一页需手动置空列表
          const curPageData = res.data
          vx.searchList = vx.searchList.concat(curPageData); //追加新数据
          mescroll.endSuccess(curPageData.length, hasNext);
        })
        .catch((err) => {
          mescroll.endDownScroll();
          mescroll.hideUpScroll();
          mescroll.showEmpty();
          mescroll.endErr();
        });
    },
    search(e) {
      this.downCallback(this.mescroll)
    },
    getAddress(num, size) {
      if (!this.keyWord) {
        return Promise.resolve({data: []})
      }
      return this.$gd.uniRequest({
        url: 'cornucopia/place-search',
        isGet: true,
        data: {
          keyword: this.keyWord,
          boundary: `region(${this.cityName},0)`,
          page_index: num,
          page_size: size,
          key: TX_MAP_KEY
        },
        notAuth: true
      }).then(res => {
        if (res.success) {
          return res.data
        } else {
          Vue.gd.uniToast({title: '信息获取失败'})
          return []
        }
      })
    },
    //点击选择城市按钮显示picker-view
			translate: function(e) {
				const vx = this
				model.animationEvents(this, 0, true, 400, (res) => {
					vx.animated = res.animated
					vx.areaShow = res.show
					vx.provinces = res.provinces
					vx.citys = res.citys
					vx.areaVal = res.value
				});
			},
			//隐藏picker-view
			hiddenFloatView: function(e, sure = false) {
				const vx = this
				model.animationEvents(this, 200, false, 400, (res) => {
					vx.animated = res.animated
					vx.areaShow = res.show
					vx.provinces = res.provinces
					vx.citys = res.citys
					vx.areaVal = res.value
				});
				var length = this.areaVal[1];
        var lengthc = this.areaVal[0];
				var countyCity = this.citys[length].name;
				if (countyCity == "市辖区" || countyCity == "县" || countyCity === undefined || countyCity === '') {
					countyCity = this.provinces[lengthc].name;
				}
				if(sure || e.currentTarget.dataset.type === 'sure') {
          this.$store.commit('cityMap', countyCity)
        }
			},
			//滑动事件
			bindChange: function(e) {
				const vx = this
				model.updateAreaData(this, 1, e, (res) => {
					vx.animated = res.animated
					vx.areaShow = true
					vx.provinces = res.provinces
					vx.citys = res.citys
					vx.areaVal = res.value
				});
			}
  },
};
</script>

<style lang="scss" scoped>
.search-box {
  position: absolute;
  width: 100%;
  height: 40px;
  display: flex;
  justify-content: flex-start;
  align-items: center;
  padding: 0 20rpx;
  box-sizing: border-box;
  background: #fff;
  z-index: 2;
  left: 0;
  top: 0;
  .city-box {
    font-size: 30rpx;
    padding: 0 20rpx;
    display: flex;
    justify-content: flex-start;
    align-items: center;
    .iconfont {
      font-size: 26rpx;
    }
  }
  .search-input {
    flex: 1;
  }
}
.addr-list {
  width: 100%;
  height: calc(100% - 40px);
  .item {
    width: 100%;
    display: flex;
    justify-content: flex-start;
    align-items: center;
    padding: 30rpx;
    position: relative;
    text-align: left;
    height: auto;
    line-height: 1.5;
    .address-box {
      .title {
        color: #000;
        font-size: 32rpx;
        display: block;
      }
      .address {
        color: #4a4a4a;
        font-size: 28rpx;
        display: block;
      }
      .phone {
        color: #888;
        font-size: 26rpx;
        display: block;
      }
    }
  }
}
</style>
