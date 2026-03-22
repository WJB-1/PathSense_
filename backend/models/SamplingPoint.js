/**
 * 子模块 5.3: Spatial DB Ingestion
 * 
 * 定义 MongoDB Schema，封装数据库写入逻辑
 * 关键点：必须为 location 字段创建 2dsphere 索引
 */

const mongoose = require('mongoose');

// 定义采样点 Schema
const samplingPointSchema = new mongoose.Schema({
  point_id: { 
    type: String, 
    required: true, 
    unique: true,
    index: true
  },
  location: {
    type: { 
      type: String, 
      enum: ['Point'], 
      default: 'Point',
      required: true
    },
    coordinates: { 
      type: [Number], 
      required: true 
      // 格式：[longitude, latitude] - 注意MongoDB GeoJSON的顺序是先经度后纬度
    }
  },
  scene_description: { 
    type: String, 
    default: "" 
  },
  images: {
    N: { type: String, default: null },
    NE: { type: String, default: null },
    E: { type: String, default: null },
    SE: { type: String, default: null },
    S: { type: String, default: null },
    SW: { type: String, default: null },
    W: { type: String, default: null },
    NW: { type: String, default: null }
  }
}, {
  timestamps: true, // 自动添加 createdAt 和 updatedAt 字段
  collection: 'sampling_points'
});

// 为 location 字段创建 2dsphere 索引 - 这是支持地理空间查询的关键
samplingPointSchema.index({ location: '2dsphere' });

// 创建模型
const SamplingPoint = mongoose.model('SamplingPoint', samplingPointSchema);

/**
 * 内部封装方法：保存采样点数据到数据库
 * @param {Object} pointData - 解析好的数据包
 * @param {string} pointData.point_id - 采样点ID
 * @param {Object} pointData.location - GeoJSON Point 对象
 * @param {string} pointData.scene_description - 场景描述
 * @param {Object} pointData.images - 各方向图片路径映射
 * @returns {Promise<Object>} - 保存后的文档
 */
async function saveSamplingPoint(pointData) {
  try {
    // 使用 findOneAndUpdate 实现 upsert 逻辑
    // 如果 point_id 已存在则更新，否则创建新记录
    const savedPoint = await SamplingPoint.findOneAndUpdate(
      { point_id: pointData.point_id },
      {
        point_id: pointData.point_id,
        location: pointData.location,
        scene_description: pointData.scene_description || "",
        images: pointData.images || {}
      },
      { 
        new: true,      // 返回更新后的文档
        upsert: true,   // 如果不存在则创建
        runValidators: true // 运行 Schema 验证
      }
    );
    
    console.log(`[DB] 采样点 ${pointData.point_id} 保存成功`);
    return savedPoint;
  } catch (error) {
    console.error(`[DB] 保存采样点 ${pointData.point_id} 失败:`, error.message);
    throw error;
  }
}

/**
 * 地理空间半径查询 - 子模块 5.4 的基础
 * @param {number} lat - 纬度
 * @param {number} lon - 经度
 * @param {number} radius - 搜索半径（米）
 * @returns {Promise<Array>} - 按距离排序的采样点列表
 */
async function findNearbyPoints(lat, lon, radius = 50) {
  try {
    const points = await SamplingPoint.find({
      location: {
        $nearSphere: {
          $geometry: {
            type: 'Point',
            coordinates: [lon, lat] // 注意：GeoJSON 顺序是 [经度, 纬度]
          },
          $maxDistance: radius // 单位：米
        }
      }
    }).lean(); // 使用 lean() 获取纯 JavaScript 对象，提高性能
    
    console.log(`[DB] 在 (${lat}, ${lon}) 半径 ${radius}m 内找到 ${points.length} 个采样点`);
    return points;
  } catch (error) {
    console.error(`[DB] 地理空间查询失败:`, error.message);
    throw error;
  }
}

/**
 * 将度分秒格式的经纬度转换为十进制度数
 * @param {string} dmsString - 度分秒格式，如 "23°8'11''"
 * @returns {number} - 十进制度数
 */
function convertDMSToDecimal(dmsString) {
  if (typeof dmsString === 'number') {
    return dmsString;
  }
  
  // 匹配度分秒格式：数字°数字'数字''
  const match = dmsString.match(/(\d+)°(\d+)'(\d+)''/);
  if (!match) {
    throw new Error(`无法解析度分秒格式: ${dmsString}`);
  }
  
  const degrees = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);
  const seconds = parseInt(match[3], 10);
  
  // 计算十进制度数
  const decimal = degrees + minutes / 60 + seconds / 3600;
  return parseFloat(decimal.toFixed(6)); // 保留6位小数
}

module.exports = {
  SamplingPoint,
  saveSamplingPoint,
  findNearbyPoints,
  convertDMSToDecimal
};
