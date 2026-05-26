<template>
  <div class="service-container">
    <div class="header">
      <el-button type="primary" link @click="router.back()">
        <el-icon><ArrowLeft /></el-icon>
      </el-button>
      <h2>服务范围</h2>
      <span></span>
    </div>

    <div class="content">
      <div class="tabs">
        <div class="tab" :class="{ active: activeTab === 'cities' }" @click="activeTab = 'cities'">
          服务城市
        </div>
        <div class="tab" :class="{ active: activeTab === 'promotions' }" @click="activeTab = 'promotions'">
          优惠活动
        </div>
        <div class="tab" :class="{ active: activeTab === 'guides' }" @click="activeTab = 'guides'">
          出行攻略
        </div>
      </div>

      <div v-if="activeTab === 'cities'">
        <div v-if="loading" class="loading">
          <el-icon class="is-loading" :size="32"><Loading /></el-icon>
          <p>加载中...</p>
        </div>

        <div class="city-list" v-else>
          <div class="city-section">
            <h3 class="section-title">已开通城市</h3>
            <div class="city-grid">
              <div class="city-card" v-for="city in activeCities" :key="city.id">
                <div class="city-name">{{ city.name }}</div>
                <div class="city-code">{{ city.code }}</div>
                <div class="city-coverage">{{ city.coverage }}</div>
              </div>
            </div>
          </div>

          <div class="city-section" v-if="comingCities.length > 0">
            <h3 class="section-title">即将开通</h3>
            <div class="city-grid">
              <div class="city-card coming" v-for="city in comingCities" :key="city.id">
                <div class="city-name">{{ city.name }}</div>
                <div class="city-code">{{ city.code }}</div>
                <div class="city-coverage">{{ city.coverage }}</div>
                <el-tag type="warning" size="small">敬请期待</el-tag>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div v-if="activeTab === 'promotions'">
        <div v-if="promotionsLoading" class="loading">
          <el-icon class="is-loading" :size="32"><Loading /></el-icon>
          <p>加载中...</p>
        </div>

        <div class="promotion-list" v-else>
          <div class="promotion-card" v-for="promo in promotions" :key="promo.id">
            <div class="promo-icon">{{ promo.icon }}</div>
            <div class="promo-content">
              <h4>{{ promo.title }}</h4>
              <p class="promo-subtitle">{{ promo.subtitle }}</p>
              <p class="promo-desc">{{ promo.description }}</p>
              <div class="promo-meta" v-if="promo.validDays">
                <span v-if="typeof promo.validDays === 'number'">有效期{{ promo.validDays }}天</span>
                <span v-else-if="Array.isArray(promo.validDays)">{{ promo.validDays.join('、') }}</span>
              </div>
              <div class="promo-meta" v-if="promo.validTime">
                <span>{{ promo.validTime }}</span>
              </div>
              <div class="promo-meta" v-if="promo.validDate">
                <span>{{ promo.validDate }}</span>
              </div>
            </div>
            <el-button type="primary" size="small" class="promo-btn">立即领取</el-button>
          </div>
        </div>
      </div>

      <div v-if="activeTab === 'guides'">
        <div v-if="guidesLoading" class="loading">
          <el-icon class="is-loading" :size="32"><Loading /></el-icon>
          <p>加载中...</p>
        </div>

        <div class="guide-list" v-else>
          <div class="guide-card" v-for="guide in guides" :key="guide.id">
            <div class="guide-header">
              <h4>{{ guide.title }}</h4>
              <el-tag type="success" size="small">{{ guide.date }}</el-tag>
            </div>
            <p class="guide-subtitle">{{ guide.subtitle }}</p>
            <div class="guide-tips">
              <div class="tip-item" v-for="(tip, index) in guide.tips" :key="index">
                <span class="tip-icon">{{ tip.icon }}</span>
                <span class="tip-text">{{ tip.text }}</span>
              </div>
            </div>
            <div class="guide-content">
              <pre>{{ guide.content }}</pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { ArrowLeft, Loading } from '@element-plus/icons-vue';
import api from '@/utils/api';
import { ElMessage } from 'element-plus';

const router = useRouter();

const activeTab = ref('cities');
const loading = ref(true);
const promotionsLoading = ref(true);
const guidesLoading = ref(true);
const cities = ref<any[]>([]);
const promotions = ref<any[]>([]);
const guides = ref<any[]>([]);

const activeCities = computed(() => cities.value.filter(c => c.status === 'active'));
const comingCities = computed(() => cities.value.filter(c => c.status === 'coming'));

onMounted(() => {
  fetchCities();
  fetchPromotions();
  fetchGuides();
});

async function fetchCities() {
  try {
    const res = await api.get('/service/cities');
    cities.value = res.data.cities;
  } catch (error) {
    ElMessage.error('获取城市列表失败');
  } finally {
    loading.value = false;
  }
}

async function fetchPromotions() {
  try {
    const res = await api.get('/service/promotions');
    promotions.value = res.data.promotions;
  } catch (error) {
    ElMessage.error('获取优惠活动失败');
  } finally {
    promotionsLoading.value = false;
  }
}

async function fetchGuides() {
  try {
    const res = await api.get('/service/holiday-guides');
    guides.value = res.data.guides;
  } catch (error) {
    ElMessage.error('获取出行攻略失败');
  } finally {
    guidesLoading.value = false;
  }
}
</script>

<style scoped>
.service-container {
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

.tabs {
  display: flex;
  background: white;
  border-radius: 12px;
  padding: 4px;
  margin-bottom: 20px;
}

.tab {
  flex: 1;
  text-align: center;
  padding: 10px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  color: #666;
  transition: all 0.2s;
}

.tab.active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  font-weight: 500;
}

.loading {
  text-align: center;
  padding: 60px 20px;
  color: #999;
}

.loading p {
  margin-top: 15px;
}

.city-section {
  margin-bottom: 25px;
}

.section-title {
  font-size: 16px;
  color: #333;
  margin: 0 0 15px 0;
}

.city-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.city-card {
  background: white;
  border-radius: 12px;
  padding: 15px;
  text-align: center;
}

.city-card.coming {
  opacity: 0.8;
  background: #fff7e6;
}

.city-name {
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin-bottom: 4px;
}

.city-code {
  font-size: 12px;
  color: #999;
  margin-bottom: 8px;
}

.city-coverage {
  font-size: 12px;
  color: #667eea;
  margin-bottom: 8px;
}

.promotion-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.promotion-card {
  background: white;
  border-radius: 12px;
  padding: 15px;
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.promo-icon {
  font-size: 40px;
  flex-shrink: 0;
}

.promo-content {
  flex: 1;
}

.promo-content h4 {
  margin: 0 0 4px 0;
  font-size: 16px;
  color: #333;
}

.promo-subtitle {
  margin: 0 0 8px 0;
  font-size: 14px;
  color: #f56c6c;
  font-weight: 500;
}

.promo-desc {
  margin: 0 0 8px 0;
  font-size: 12px;
  color: #666;
  line-height: 1.5;
}

.promo-meta {
  font-size: 11px;
  color: #999;
  margin-bottom: 4px;
}

.promo-btn {
  flex-shrink: 0;
}

.guide-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.guide-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
}

.guide-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.guide-header h4 {
  margin: 0;
  font-size: 16px;
  color: #333;
}

.guide-subtitle {
  margin: 0 0 15px 0;
  font-size: 14px;
  color: #667eea;
}

.guide-tips {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 15px;
  padding: 15px;
  background: #f0f9ff;
  border-radius: 8px;
}

.tip-item {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 13px;
  color: #333;
}

.tip-icon {
  font-size: 18px;
}

.guide-content pre {
  margin: 0;
  font-size: 13px;
  color: #666;
  line-height: 1.8;
  white-space: pre-wrap;
  font-family: inherit;
}
</style>
