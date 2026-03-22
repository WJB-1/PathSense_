# 测试脚本说明

本目录包含模块四和模块五的测试脚本，用于验证功能正确性和接口兼容性。

## 测试脚本列表

### 1. test_module5_api.js
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

### 2. test_module4_5_compatibility.js
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
