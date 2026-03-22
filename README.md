# 视障语义地图后端服务 - 模块五

基于 Node.js + Express + MongoDB 的视障出行环境语义地图后端服务框架。

## 项目结构

```
Blind_map/
├── backend/                # Node.js 后端服务
│   ├── app.js              # 主应用入口
│   ├── package.json        # 后端依赖配置
│   ├── .env.example        # 环境变量示例
│   ├── config/
│   │   └── database.js     # MongoDB 连接配置
│   ├── models/
│   │   └── SamplingPoint.js # 采样点 Schema 和数据库操作
│   ├── routes/
│   │   ├── upload.js       # 子模块 5.2: 数据接收接口
│   │   ├── navigation.js   # 子模块 5.4: 空间半径查询
│   │   └── map.js          # 子模块 5.1: OSM Overpass 代理
│   └── public/
│       └── images/         # 上传的图片存储目录
├── frontend/               # 前端应用（待开发）
├── data_pipeline/          # 数据处理管道（待开发）
├── map_data.json.txt       # 采集的地图数据
└── README.md               # 项目文档
```

## 快速开始

### 1. 进入后端目录

```bash
cd Blind_map/backend
```

### 2. 安装依赖

```bash
npm install
```

### 3. 配置环境变量

```bash
cp .env.example .env
# 编辑 .env 文件，配置 MongoDB 连接字符串等
```

### 4. 启动 MongoDB

确保本地 MongoDB 服务已启动，或使用 MongoDB Atlas 等云服务。

### 5. 启动服务

```bash
# 生产模式
npm start

# 开发模式（热重载）
npm run dev
```

服务将在 http://localhost:3000 启动。

## API 接口说明

### 1. 上传采样点数据

**端点**: `POST /api/upload/sampling_point`

**请求格式**: `multipart/form-data`

**参数**:
- `jsonData` (string): JSON 格式的采样点数据，包含 point_id、coordinates、scene_description 等
- `image_N`, `image_NE`, `image_E`, `image_SE`, `image_S`, `image_SW`, `image_W`, `image_NW` (file): 各方向的图片文件（可选）

**示例**:
```bash
curl -X POST http://localhost:3000/api/upload/sampling_point \
  -F "jsonData={\"point_id\":\"P001\",\"coordinates\":{\"longitude\":\"23°8'11''\",\"latitude\":\"113°19'21''\"},\"scene_description\":\"测试点\"}" \
  -F "image_N=@/path/to/north.jpg" \
  -F "image_E=@/path/to/east.jpg"
```

### 2. 查找附近采样点

**端点**: `GET /api/navigation/nearby`

**参数**:
- `lat` (number, required): 纬度
- `lon` (number, required): 经度
- `radius` (number, optional): 搜索半径（米），默认 50

**示例**:
```bash
curl "http://localhost:3000/api/navigation/nearby?lat=23.1364&lon=113.3223&radius=100"
```

### 3. 获取 OSM 地图数据

**端点**: `GET /api/map/chunk`

**参数**:
- `bbox` (string, required): 边界框，格式为 `minLon,minLat,maxLon,maxLat`

**示例**:
```bash
curl "http://localhost:3000/api/map/chunk?bbox=113.31,23.12,113.33,23.15"
```

## 技术细节

### 地理空间查询

- 使用 MongoDB 的 `2dsphere` 索引支持地理空间计算
- 查询使用 `$nearSphere` 操作符，返回按距离排序的结果
- 坐标格式遵循 GeoJSON 标准：`[longitude, latitude]`（先经度后纬度）

### 经纬度转换

前端传入的度分秒格式（如 `23°8'11''`）会自动转换为十进制度数存储。

### 数据模型

```javascript
{
  point_id: String,           // 唯一标识
  location: {                 // GeoJSON Point
    type: 'Point',
    coordinates: [Number]     // [经度, 纬度]
  },
  scene_description: String,  // 场景描述
  images: {                   // 各方向图片路径
    N: String, NE: String, E: String, SE: String,
    S: String, SW: String, W: String, NW: String
  }
}
```

## 注意事项

1. **启动位置**: 必须在 `backend/` 目录内运行 `npm start`，而不是在根目录
2. **经纬度顺序**: MongoDB GeoJSON 的 `coordinates` 数组顺序必须是 `[longitude, latitude]`（先经度后纬度）
3. **图片上传**: 某些方向的图片可能为空，后端会做空值保护
4. **OSM 查询**: 只查询与行人相关的要素（pedestrian, footway, steps, crossing）
