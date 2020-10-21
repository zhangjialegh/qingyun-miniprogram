<template>
  <view class="container">
    <view class="map-box">
      <map
        id="mapId"
        ref="mapId"
        v-if="init"
        style="width:100%;height:100%"
        :show-location="showLocation"
        :latitude="latitude"
        :longitude="longitude"
        :markers="markers"
        @callouttap="savePoint"
        @labeltap="handleNavigate"
      >
        <cover-view class="search-box" @click="navigate">
          <cover-view class="search-inner">
            <cover-view class="city">{{ cityName }}</cover-view>
            <cover-view class="search">
              <cover-view class="iconfont icon-search"></cover-view>
              <cover-view v-if="keyword">{{ keyword }}</cover-view>
							<cover-view class="placeholder" v-else>请输入要搜索的地址名称</cover-view>
            </cover-view>
          </cover-view>
        </cover-view>
      </map>
    </view>
  </view>
</template>

<script>
import { TX_MAP_KEY } from "@/common/config";
export default {
  data() {
    return {
      latitude: 0,
      longitude: 0,
      markers: [],
			init: false,
			showLocation: true,
      mapCtx: null,
      currentPoint: null,
      timer: null
    };
  },
  computed: {
    keyword() {
      return this.$store.state.searchMap;
		},
		cityName() {
			return this.$store.state.cityMap
		}
  },
  onLoad() {
    const vx = this;
    uni.getLocation({
      type: "gcj02",
      success: function(res) {
        const latitude = res.latitude;
        const longitude = res.longitude;
        vx.longitude = longitude;
				vx.latitude = latitude;
        vx.geocoder(`${latitude},${longitude}`);
        vx.init = true;
      },
    });
  },
  onHide() {
    clearTimeout(this.timer)
    this.timer = null
  },
  methods: {
    geocoder(location) {
			const vx = this
      uni.request({
        url: "https://apis.map.qq.com/ws/geocoder/v1/",
        method: "GET",
        data: {
          location,
          get_poi: 0,
          key: TX_MAP_KEY,
        },
        success(res) {
          if (res.statusCode && res.errMsg === 'request:ok') {
            vx.mapCtx = uni.createMapContext('mapId', vx)
            vx.mapCtx.moveToLocation({
              latitude: res.data.result.location.lat,
              longitude: res.data.result.location.lng,
              success(res) {
                console.log(res,'mov s')
              },
              fail(err) {
                console.log(err, 'mov f')
              }
            })
            vx.$store.commit('cityMap', res.data.result.address_component.city)
            vx.$store.commit('searchMap', '')
					} else {
						uni.showToast({title: '获取位置失败，请打开定位开关'})
					}
        },
        fail(err) {
          console.log(err);
        },
      });
    },
		moveToLocation(item) {
      this.currentPoint = item
      this.$nextTick(()=>{
        this.timer = setTimeout(()=>{
            this.markers = [{
              id: 1,
              longitude: item.location.lng,
              latitude: item.location.lat,
              width: 20,
              height: 30,
              iconPath: '/static/location.png',
              callout: {
                content: item.title,
                display: 'ALWAYS',
                padding: 8,
                borderRadius: 12,
                fontSize: 14,
                bgColor: '#07c160',
                color: '#ffffff'
              },
              label: {
                content: item.address,
                padding: 5,
                borderRadius: 10,
                x: -50,
                y: 0,
                fontSize: 10,
                bgColor: '#ffffff',
                color: '#07c160',
                borderColor: '#07c160',
                borderWidth: 1
              }
          }]
          this.mapCtx.moveToLocation({
            longitude: item.location.lng,
            latitude: item.location.lat,
            success(res) {
              console.log(res,'mov s')
            },
            fail(err) {
              console.log(err, 'mov f')
            }
          })
          this.mapCtx.translateMarker({
            markerId: 1,
            destination: {
              longitude: item.location.lng,
              latitude: item.location.lat
            },
            fail(err) {
              console.log(err, 'arke f')
            }
          })
        }, 500)
      })
		},
    navigate() {
			uni.navigateTo({
        url: '/pages/navigation/search/search'
      })
    },
    savePoint(e) {
      this.$gd.uniModal({
        title: this.currentPoint.title,
        content: '收藏该位置？',
        confirmText: '收藏',
        showCancel: true,
        confirm: () => {
          this.insertRequest()
        }
      })
    },
    insertRequest() {
      const {title,address,location,tel} = this.currentPoint
      this.$gd.uniRequest({
        url: 'location/insert',
        isGet: false,
        data: {
          name: title,
          address,
          lng: location.lng,
          lat: location.lat,
          tel: tel || null
        }
      }).then(res => {
        if (res.success) {
          this.$gd.uniToast({
            title: '保存成功',
            icon: 'success',
            success() {
              const pages = getCurrentPages()
              if (pages.length > 1) {
                const PrePage = pages[pages.length - 2]
                PrePage.$vm.getAllLocations()
              }
            }
          })
        }
      })
    },
    handleNavigate(e) {
      const item = this.currentPoint
      uni.openLocation({
        longitude: item.location.lng,
        latitude: item.location.lat,
        name: item.title,
        address: item.address
      })
    }
  },
};
</script>

<style lang="scss" scoped>
.map-box {
  width: 100%;
  height: 100%;
  position: relative;
  .search-box {
    position: absolute;
    top: 15rpx;
    left: 0;
    width: 100%;
    padding: 0 var(--section-padding);
    box-sizing: border-box;
    .search-inner {
      width: 100%;
      background: #fff;
      display: flex;
      justify-content: flex-start;
			align-items: center;
			padding: 20rpx 0;
			.city {
				padding: 0 30rpx;
				font-size: 30rpx;
			}
			.search {
				font-size: 30rpx;
				display: flex;
				justify-content: flex-start;
				align-items: center;
				.iconfont {
					font-size: 30rpx;
					padding-right: 15rpx;
				}
				.placeholder {
					color: #999;
				}
			}
    }
  }
}
</style>
