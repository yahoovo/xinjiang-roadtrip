export const CATEGORIES = {
  top:       { label: '上装', icon: '👕' },
  bottom:    { label: '下装', icon: '👖' },
  outer:     { label: '外套', icon: '🧥' },
  accessory: { label: '配饰', icon: '🧣' },
  shoes:     { label: '鞋履', icon: '👟' },
}

export const SCENE_TAGS  = ['拍照', '徒步', '用餐', '观景']
export const WEATHER_TAGS = ['高温', '寒冷', '风沙']

// Ada 北疆 14 天预置服装
export const DEFAULT_CLOTHES = [
  { id: 'c1',  name: '白色轻薄上衣',   category: 'top',       color: '#F5F5F0', scenes: ['拍照','用餐'],         weather: ['高温'],        notes: '拍照显白，轻薄透气' },
  { id: 'c2',  name: '蓝白条纹上衣',   category: 'top',       color: '#4A90D9', scenes: ['拍照','用餐'],         weather: ['高温'],        notes: '法式休闲感强' },
  { id: 'c3',  name: '棕色针织毛衣',   category: 'top',       color: '#8B6914', scenes: ['观景','用餐'],         weather: ['寒冷'],        notes: '早晚温差大时必备' },
  { id: 'c4',  name: '黑色打底长袖',   category: 'top',       color: '#1A1A1A', scenes: ['徒步','拍照'],         weather: ['寒冷'],        notes: '叠穿神器' },
  { id: 'c5',  name: '奶白色衬衫',     category: 'top',       color: '#FFF8F0', scenes: ['拍照','用餐'],         weather: ['高温'],        notes: '适合有历史感的场景' },
  { id: 'c6',  name: '牛仔长裤',       category: 'bottom',    color: '#3A5F8A', scenes: ['拍照','徒步','用餐'],  weather: ['高温','寒冷'], notes: '万能百搭' },
  { id: 'c7',  name: '卡其工装裤',     category: 'bottom',    color: '#A0845C', scenes: ['徒步','拍照'],         weather: ['高温','风沙'], notes: '多口袋实用，适合户外' },
  { id: 'c8',  name: '白色半身裙',     category: 'bottom',    color: '#FFFFFF', scenes: ['拍照','用餐'],         weather: ['高温'],        notes: '赛里木湖、那拉提草原出片必备' },
  { id: 'c9',  name: '黑色修身长裤',   category: 'bottom',    color: '#181818', scenes: ['用餐','观景'],         weather: ['寒冷'],        notes: '城市游览首选' },
  { id: 'c10', name: '米色风衣',       category: 'outer',     color: '#C8B89A', scenes: ['观景','拍照'],         weather: ['风沙','寒冷'], notes: '防风防沙，造型感强' },
  { id: 'c11', name: '黑色羽绒服',     category: 'outer',     color: '#202020', scenes: ['徒步','观景'],         weather: ['寒冷'],        notes: '喀纳斯早晨必备，温差可达 20°C' },
  { id: 'c12', name: '牛仔外套',       category: 'outer',     color: '#4A6080', scenes: ['拍照','用餐'],         weather: ['高温'],        notes: '轻薄外套，早晚穿' },
  { id: 'c13', name: '奶茶色棒球帽',   category: 'accessory', color: '#D4B896', scenes: ['拍照','徒步'],         weather: ['高温','风沙'], notes: '遮阳必备，与大多数穿搭相配' },
  { id: 'c14', name: '奶油色丝巾',     category: 'accessory', color: '#FFF3DC', scenes: ['拍照','用餐'],         weather: ['风沙','寒冷'], notes: '防风沙 + 增加造型层次感' },
  { id: 'c15', name: '墨镜',           category: 'accessory', color: '#1A1A1A', scenes: ['拍照','徒步','观景'],  weather: ['高温'],        notes: '高原紫外线强，护眼必备' },
  { id: 'c16', name: '白色运动鞋',     category: 'shoes',     color: '#F5F5F5', scenes: ['用餐','拍照'],         weather: ['高温'],        notes: '城市漫步与轻量徒步皆可' },
  { id: 'c17', name: '登山靴',         category: 'shoes',     color: '#6B4F3A', scenes: ['徒步'],               weather: ['高温','寒冷'], notes: '喀纳斯、那拉提草原徒步必备' },
  { id: 'c18', name: '简约凉鞋',       category: 'shoes',     color: '#C4A882', scenes: ['用餐','观景'],         weather: ['高温'],        notes: '住宿与城市内部游览' },
]

// 预置套装
export const DEFAULT_SETS = [
  {
    id: 's1',
    name: '草原白日梦',
    items: ['c8', 'c5', 'c13', 'c16'],
    scenes: ['拍照'],
    weather: ['高温'],
    notes: '那拉提、禾木村、赛里木湖必备 look，纯白系出片率极高',
    color: '#F5F5F0',
  },
  {
    id: 's2',
    name: '户外探险家',
    items: ['c4', 'c7', 'c10', 'c13', 'c17'],
    scenes: ['徒步'],
    weather: ['风沙', '寒冷'],
    notes: '喀纳斯徒步、可可托海三号矿坑，实用性第一',
    color: '#8B6914',
  },
  {
    id: 's3',
    name: '黄昏电影感',
    items: ['c3', 'c6', 'c14', 'c16'],
    scenes: ['拍照', '观景'],
    weather: ['寒冷'],
    notes: '日落黄金时刻，棕色系与暖光相配，胶片感极强',
    color: '#8B6914',
  },
  {
    id: 's4',
    name: '城市轻旅',
    items: ['c2', 'c6', 'c12', 'c16'],
    scenes: ['用餐', '拍照'],
    weather: ['高温'],
    notes: '乌鲁木齐大巴扎、伊宁城区游览',
    color: '#4A90D9',
  },
]
