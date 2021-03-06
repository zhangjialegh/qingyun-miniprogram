/****** config ******/
export const STORAGE_KEY = 'STORAGE_KEY'
export const WECHAT_NAME = '青云器'
export let TX_MAP_KEY = '7YDBZ-EPIC3-QHH3S-YBKWX-DCZYQ-ETF2E'
export const COLORS_PICK = ['#b7ba6b', '#426ab3', '#d93a49', '#f26522', '#006c54', '#c77eb5', '#472d56', '#c7a252', '#7c8577','#7f7522']

/****** 项目 ******/
export let BASE_URL = 'https://qingyun.jialekoi.cn'
// #ifdef H5
BASE_URL = 'http://localhost:8000'
TX_MAP_KEY = 'G26BZ-NIGWU-Y42VR-2SHCA-5REZ3-QUFKD'
// #endif
if (process.env.NODE_ENV === 'production') {
	BASE_URL = 'https://qingyun.jialekoi.cn'
}