<template>
  <div class="car-types-container">
    <div class="header">
      <el-button type="primary" link @click="router.back()">
        <el-icon><ArrowLeft /></el-icon>
      </el-button>
      <h2>车型选择</h2>
      <span></span>
    </div>

    <div class="content">
      <div v-if="loading" class="loading">
        <el-icon class="is-loading" :size="32"><Loading /></el-icon>
        <p>加载中...</p>
      </div>

      <div class="location-card" v-else>
        <div class="location-input">
          <el-icon color="#67c23a"><Location /></el-icon>
          <el-input v-model="startLocation" placeholder="请输入起点" />
        </div>
        <div class="location-divider">
          <el-icon color="#999"><Sort /></el-icon>
        </div>
        <div class="location-input">
          <el-icon color="#f56c6c"><Location /></el-icon>
          <el-input v-model="endLocation" placeholder="请输入终点" />
        </div>
        <div class="distance-input">
          <el-input-number v-model="distance" :min="0.1" :step="0.5" :precision="1" placeholder="预估里程(公里)" />
          <span class="label">公里</span>
        </div>
        <el-button type="primary" class="estimate-btn" @click="calculateEstimate" :loading="estimating">
          预估费用
        </el-button>
      </div>

      <div class="car-type-list" v-if="!loading && carTypes.length > 0">
        <h3 class="section-title">选择车型</h3>
        <div class="car-type-card" v-for="car in carTypes" :key="car.id" @click="selectCarType(car)">
          <div class="car-header">
            <span class="car-icon">{{ car.icon }}</span>
            <div class="car-info">
              <h4>{{ car.name }}</h4>
              <p class="car-desc">{{ car.description }}</p>
            </div>
            <div class="car-price" v-if="estimates[car.id]">
              <span class="price">¥{{ estimates[car.id].estimate }}</span>
              <span class="price-range">¥{{ estimates[car.id].range.min }}-{{ estimates[car.id].range.max }}</span>
            </div>
          </div>
          
          <div class="car-details" v-if="selectedCar?.id === car.id">
            <div class="features">
              <span class="feature-tag" v-for="feature in car.features" :key="feature">{{ feature }}</span>
            </div>
            <div class="suitable-for">
              <strong>适用场景：</strong>
              <span>{{ car.suitableFor.join('、') }}</span>
            </div>
            <div class="price-detail" v-if="pricingList[car.id]">
              <strong>价格明细：</strong>
              <p>{{ pricingList[car.id].description }}</p>
              <div class="price-breakdown">
                <span>起步价：¥{{ pricingList[car.id].basePrice }}</span>
                <span>里程费：¥{{ pricingList[car.id].perKm }}/公里</span>
                <span>时长费：¥{{ pricingList[car.id].perMinute }}/分钟</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="estimate-breakdown" v-if="selectedCar && estimates[selectedCar.id]">
        <h3 class="section-title">费用明细</h3>
        <div class="breakdown-card">
          <div class="breakdown-item">
            <span>起步价</span>
            <span>¥{{ estimates[selectedCar.id].breakdown.basePrice }}</span>
          </div>
          <div class="breakdown-item">
            <span>里程费</span>
            <span>¥{{ estimates[selectedCar.id].breakdown.distanceFee }}</span>
          </div>
          <div class="breakdown-item">
            <span>时长费</span>
            <span>¥{{ estimates[selectedCar.id].breakdown.durationFee }}</span>
          </div>
          <div class="breakdown-total">
            <span>预估总价</span>
            <span class="total-price">¥{{ estimates[selectedCar.id].estimate }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { ArrowLeft, Location, Sort, Loading } from '@element-plus/icons-vue';
import api from '@/utils/api';
import { ElMessage } from 'element-plus';

const router = useRouter();

const loading = ref(true);
const estimating = ref(false);
const carTypes = ref<any[]>([]);
const selectedCar = ref<any>(null);
const pricingList = reactive<Record<string, any>>({});
const estimates = reactive<Record<string, any>>({});

const startLocation = ref('');
const endLocation = ref('');
const distance = ref(5);

onMounted(() => {
  fetchCarTypes();
  fetchPricing();
});

async function fetchCarTypes() {
  try {
    const res = await api.get('/car/types');
    carTypes.value = res.data.carTypes;
    if (carTypes.value.length > 0) {
      selectedCar.value = carTypes.value[0];
    }
  } catch (error) {
    ElMessage.error('获取车型列表失败');
  } finally {
    loading.value = false;
  }
}

async function fetchPricing() {
  try {
    const res = await api.get('/car/pricing');
    res.data.pricingList.forEach((p: any) => {
      pricingList[p.id] = p;
    });
  } catch (error) {
    console.error('获取价格列表失败');
  }
}

async function calculateEstimate() {
  if (!distance.value || distance.value <= 0) {
    ElMessage.warning('请输入有效的里程');
    return;
  }

  estimating.value = true;
  try {
    const res = await api.post('/car/estimate', {
      distance: distance.value,
      duration: Math.round(distance.value * 3)
    });
    res.data.estimates.forEach((e: any) => {
      estimates[e.carTypeId] = e;
    });
    ElMessage.success('费用预估完成');
  } catch (error) {
    ElMessage.error('费用预估失败');
  } finally {
    estimating.value = false;
  }
}

function selectCarType(car: any) {
  selectedCar.value = car;
}
</script>

<style scoped>
.car-types-container {
  min-height: 100vh;
  background: #f5f7fa;
}

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 15px 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.header h2 {
  margin: 0;
  font-size: 18px;
}

.content {
  padding: 20px;
}

.loading {
  text-align: center;
  padding: 60px 20px;
  color: #999;
}

.loading p {
  margin-top: 15px;
}

.location-card {
  background: white;
  border-radius: 16px;
  padding: 20px;
  margin-bottom: 20px;
}

.location-input {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px;
  background: #f5f7fa;
  border-radius: 8px;
}

.location-divider {
  text-align: center;
  padding: 10px 0;
}

.distance-input {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 15px 0;
}

.distance-input .label {
  color: #666;
}

.estimate-btn {
  width: 100%;
  height: 48px;
  font-size: 16px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
}

.section-title {
  font-size: 16px;
  color: #333;
  margin: 0 0 15px 0;
}

.car-type-list {
  margin-bottom: 20px;
}

.car-type-card {
  background: white;
  border-radius: 12px;
  padding: 15px;
  margin-bottom: 12px;
  cursor: pointer;
  transition: all 0.2s;
  border: 2px solid transparent;
}

.car-type-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.car-type-card.selected {
  border-color: #667eea;
}

.car-header {
  display: flex;
  align-items: center;
  gap: 12px;
}

.car-icon {
  font-size: 32px;
}

.car-info {
  flex: 1;
}

.car-info h4 {
  margin: 0 0 4px 0;
  font-size: 16px;
  color: #333;
}

.car-desc {
  margin: 0;
  font-size: 12px;
  color: #999;
}

.car-price {
  text-align: right;
}

.car-price .price {
  display: block;
  font-size: 18px;
  font-weight: 600;
  color: #f56c6c;
}

.car-price .price-range {
  font-size: 12px;
  color: #999;
}

.car-details {
  margin-top: 15px;
  padding-top: 15px;
  border-top: 1px solid #f0f0f0;
}

.features {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 12px;
}

.feature-tag {
  padding: 4px 12px;
  background: #ecf5ff;
  color: #409eff;
  border-radius: 12px;
  font-size: 12px;
}

.suitable-for {
  font-size: 14px;
  color: #666;
  margin-bottom: 12px;
  line-height: 1.6;
}

.price-detail {
  font-size: 14px;
  color: #666;
  line-height: 1.6;
}

.price-detail p {
  margin: 4px 0 8px 0;
}

.price-breakdown {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  font-size: 13px;
}

.estimate-breakdown .breakdown-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
}

.breakdown-item {
  display: flex;
  justify-content: space-between;
  padding: 10px 0;
  font-size: 14px;
  color: #666;
}

.breakdown-total {
  display: flex;
  justify-content: space-between;
  padding: 15px 0 0 0;
  margin-top: 10px;
  border-top: 1px solid #f0f0f0;
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.total-price {
  color: #f56c6c;
  font-size: 20px;
}
</style>
