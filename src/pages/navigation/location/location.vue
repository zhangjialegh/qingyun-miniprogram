<template>
	<view class='container'>
		<!-- 保存按钮 -->
    <view class="search-box">
			<uni-search-bar placeholder="请输入关键字" @confirm="search"></uni-search-bar>
		</view>
		<view class="map-box">
			<map id="map" ref="map" style="width:100%;height:100%" :show-location="true" :latitude="latitude" :longitude="longitude" v-if="init"></map>
		</view>
	</view>
</template>

<script>
	import uniSearchBar from '@/components/uni-search-bar/uni-search-bar.vue'
	import { TX_MAP_KEY } from '@/common/config'
	export default {
		components: {uniSearchBar},
		data() {
			return {
				latitude: 0,
				longitude: 0,
				markers: [],
				init: false
			}
		},
		onLoad() {
			const vx = this
			uni.getLocation({
				type: 'gcj02',
				success: function(res) {
					const latitude = res.latitude;
					const longitude = res.longitude;
					vx.longitude = longitude
					vx.latitude = latitude
					vx.geocoder(`${latitude,longitude}`)
					vx.markers = [{
						id: 1,
						latitude,
						longitude,
						iconPath: '/static/location.png',
						width: 30
					}]
					vx.init = true
				}
			})
		},
		methods: {
			geocoder(location) {
				uni.request({
					url: 'https://apis.map.qq.com/ws/geocoder/v1/',
					method: 'GET',
					data: {
						location,
						get_poi: 0,
						key: TX_MAP_KEY
					},
					success(res) {
						console.log(res,'iii')
					},
					fail(err) {
						console.log(err)
					}
				})
			},
			search(e) {
				console.log(val,'ii')
				uni.request({
					url: 'https://apis.map.qq.com/ws/place/v1/search',
					method: 'GET',
					data: {
						keyword: e.val
					}
				})
			}
		}
	}
</script>

<style lang="scss" scoped>
	/* pages/addinfo/addinfo.wxss */
	.search-box {
		width: 100%;
		height: 52px;
	}
	.map-box {
		width: 100%;
		height: calc(100% - 52px);
	}
</style>
