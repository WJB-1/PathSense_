# 测试脚本说明

本目录包含模块一、二、四、五的测试脚本，用于验证功能正确性和接口兼容性。

## 测试脚本列表

### 模块一、二测试

#### 1. test_module1_grid.js
**用途**: 测试模块一（区块网格管理器）的核心功能

**测试内容**:
- `getTile` - 瓦片坐标计算
- `getTileBoundingBox` - 边界框计算
- `getCurrentAndSurroundingChunks` - 九宫格计算
- `dmsToDecimal` - 度分秒转换
- `parseChunkId` - chunkId 解析
- `calculateDistance` - 距离计算
- `hasCrossedTileBoundary` - 边界跨越检测

**运行方法**:
```bash
cd Blind_map
node test/test_module1_grid.js
```

#### 2. test_module2_map_service.js
**用途**: 测试模块二（OSM 底图加载器）的功能

**测试内容**:
- `fetchMapDataByLocation` - 地图数据加载与缓存
- `preloadSurroundingChunks` - 九宫格预加载
- `checkAndLoadOnBoundaryCross` - 边界跨越检测
- `clearCache` - 缓存清理
- 并发请求处理

**运行方法**:
```bash
# 1. 先启动后端服务
cd Blind_map/backend
npm start

# 2. 在另一个终端运行测试
cd Blind_map
node test/test_module2_map_service.js
```

#### 3. test_module1_2_compatibility.js
**用途**: 测试模块一与模块二的接口兼容性

**测试内容**:
- chunkId 格式一致性
- BBox 格式一致性（先经后纬）
- 坐标顺序兼容性
- 模块一输出到模块二输入的数据流

**运行方法**:
```bash
cd Blind_map
node test/test_module1_2_compatibility.js
```

#### 4. test_module1_2_3_4_compatibility.js
**用途**: 测试模块一、二与模块三、四的接口兼容性

**测试内容**:
- 模块1的 chunkId 与模块4的数据分区标识兼容性
- 模块1的坐标转换与模块4的 SamplingPoint.coordinates 兼容性
- 模块2的 BBox 与后端接口的兼容性
- 模块3产生的图像路径与模块4的 DirectionImages 兼容性
- 数据流：模块3 → 模块4（组装）→ 后端模块5

**运行方法**:
```bash
cd Blind_map
node test/test_module1_2_3_4_compatibility.js
```

#### 5. test_all_module1_2.js
**用途**: 模块一、二综合测试运行器

**功能**:
- 自动运行所有模块一、二的测试
- 检查后端服务状态
- 生成综合测试报告
- 汇总所有测试结果

**运行方法**:
```bash
cd Blind_map
node test/test_all_module1_2.js
```

### 模块四、五测试

#### 6. test_module5_api.js
**用途**: 测试模块五后端 API 的所有端点

**测试内容**:
- 健康检查端点 (`/health`)
- 根路由信息 (`/`)
- 采样点上传 (`POST /api/upload/sampling_point`)
- 附近采样点查询 (`GET /api/navigation/nearby`)
- OSM 地图数据获取 (`GET /api/map/chunk`)
- 错误处理（404、无效参数等）

**运行方法**:
```bash
# 1. 先启动后端服务
cd Blind_map/backend
npm start

# 2. 在另一个终端运行测试
cd Blind_map
node test/test_module5_api.js
```

#### 7. test_module4_5_compatibility.js
**用途**: 测试模块四与模块五的接口兼容性

**测试内容**:
- 数据格式验证（point_id、coordinates、images、status、timestamp）
- 模块四数据上传到模块五
- 数据查询验证
- 边界情况（部分方向缺失、特殊字符、坐标顺序）

**运行方法**:
```bash
# 1. 先启动后端服务
cd Blind_map/backend
npm start

# 2. 在另一个终端运行测试
cd Blind_map
node test/test_module4_5_compatibility.js
```

## 测试环境要求

1. **Node.js** >= 14.0
2. **MongoDB** 服务已启动
3. **后端服务** 已启动并监听在 localhost:3000

## 安装依赖

测试脚本依赖 `form-data` 包（仅 test_module5_api.js 需要）：

```bash
cd Blind_map/backend
npm install form-data --save-dev
```

## 测试输出说明

测试脚本会输出：
- 每个测试用例的执行结果（✓ 通过 / ✗ 失败）
- 失败时的错误信息
- 测试汇总统计（通过/失败数量、通过率）

## 预期结果

所有测试应显示绿色 ✓，表示：
1. 模块五后端 API 工作正常
2. 模块四生成的数据格式与模块五兼容
3. 数据可以正确上传和查询

## 注意事项

1. 测试脚本不会修改工程代码，仅用于验证
2. 测试数据使用特定的 point_id 前缀（如 `TEST_`、`Point_`），便于识别
3. 测试完成后可手动清理测试数据（如果需要）
