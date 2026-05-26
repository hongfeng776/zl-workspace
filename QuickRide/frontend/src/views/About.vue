<template>
  <div class="about-container">
    <div class="header">
      <el-button type="primary" link @click="router.back()">
        <el-icon><ArrowLeft /></el-icon>
      </el-button>
      <h2>{{ pageTitle }}</h2>
      <span></span>
    </div>

    <div class="content">
      <div v-if="loading" class="loading">
        <el-icon class="is-loading" :size="32"><Loading /></el-icon>
        <p>加载中...</p>
      </div>

      <div v-else-if="activeTab === 'about' && aboutData" class="about-content">
        <div class="about-header">
          <h1>{{ aboutData.companyName }}</h1>
          <p class="slogan">{{ aboutData.slogan }}</p>
          <p class="description">{{ aboutData.description }}</p>
          <p class="founded">成立于 {{ aboutData.founded }}</p>
        </div>

        <div class="contact-card">
          <h3>联系我们</h3>
          <div class="contact-item">
            <el-icon><Phone /></el-icon>
            <span>{{ aboutData.contact.phone }}</span>
          </div>
          <div class="contact-item">
            <el-icon><Message /></el-icon>
            <span>{{ aboutData.contact.email }}</span>
          </div>
          <div class="contact-item">
            <el-icon><Location /></el-icon>
            <span>{{ aboutData.contact.address }}</span>
          </div>
          <div class="contact-item">
            <el-icon><Clock /></el-icon>
            <span>{{ aboutData.contact.workingHours }}</span>
          </div>
        </div>

        <div class="milestones-card">
          <h3>发展历程</h3>
          <div class="timeline">
            <div class="timeline-item" v-for="(item, index) in aboutData.milestones" :key="index">
              <div class="timeline-dot"></div>
              <div class="timeline-content">
                <span class="timeline-year">{{ item.year }}</span>
                <p class="timeline-event">{{ item.event }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div v-else-if="activeTab === 'terms' && termsData" class="terms-content">
        <div class="doc-header">
          <h2>{{ termsData.title }}</h2>
          <p class="doc-meta">版本：{{ termsData.version }} · 更新于 {{ termsData.updatedAt }}</p>
        </div>
        <div class="doc-content">
          <pre>{{ termsData.content }}</pre>
        </div>
      </div>

      <div v-else-if="activeTab === 'privacy' && privacyData" class="privacy-content">
        <div class="doc-header">
          <h2>{{ privacyData.title }}</h2>
          <p class="doc-meta">版本：{{ privacyData.version }} · 更新于 {{ privacyData.updatedAt }}</p>
        </div>
        <div class="doc-content">
          <pre>{{ privacyData.content }}</pre>
        </div>
      </div>

      <div v-else-if="activeTab === 'faq'" class="faq-content">
        <div class="faq-list">
          <el-collapse v-model="activeFaq" accordion>
            <el-collapse-item v-for="item in faqList" :key="item.id" :name="item.id.toString()">
              <template #title>
                <span class="faq-question">{{ item.question }}</span>
              </template>
              <p class="faq-answer">{{ item.answer }}</p>
            </el-collapse-item>
          </el-collapse>
        </div>
      </div>

      <div class="nav-tabs" v-if="showTabs">
        <div class="tab" :class="{ active: activeTab === 'about' }" @click="switchTab('about')">
          <el-icon><InfoFilled /></el-icon>
          <span>关于我们</span>
        </div>
        <div class="tab" :class="{ active: activeTab === 'terms' }" @click="switchTab('terms')">
          <el-icon><Document /></el-icon>
          <span>服务条款</span>
        </div>
        <div class="tab" :class="{ active: activeTab === 'privacy' }" @click="switchTab('privacy')">
          <el-icon><Lock /></el-icon>
          <span>隐私政策</span>
        </div>
        <div class="tab" :class="{ active: activeTab === 'faq' }" @click="switchTab('faq')">
          <el-icon><QuestionFilled /></el-icon>
          <span>常见问题</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import {
  ArrowLeft,
  Loading,
  Phone,
  Message,
  Location,
  Clock,
  Document,
  Lock,
  InfoFilled,
  QuestionFilled
} from '@element-plus/icons-vue';
import api from '@/utils/api';
import { ElMessage } from 'element-plus';

const router = useRouter();
const route = useRoute();

const loading = ref(true);
const activeTab = ref('about');
const activeFaq = ref(['1']);
const aboutData = ref<any>(null);
const termsData = ref<any>(null);
const privacyData = ref<any>(null);
const faqList = ref<any[]>([]);

const showTabs = computed(() => !route.query.tab);

const pageTitle = computed(() => {
  const tab = route.query.tab || activeTab.value;
  const titles: Record<string, string> = {
    about: '关于我们',
    terms: '服务条款',
    privacy: '隐私政策',
    faq: '常见问题'
  };
  return titles[tab as string] || '关于我们';
});

onMounted(() => {
  if (route.query.tab) {
    activeTab.value = route.query.tab as string;
  }
  fetchAllData();
});

async function fetchAllData() {
  loading.value = true;
  try {
    await Promise.all([
      fetchAbout(),
      fetchTerms(),
      fetchPrivacy(),
      fetchFaq()
    ]);
  } catch (error) {
    console.error('加载数据失败');
  } finally {
    loading.value = false;
  }
}

async function fetchAbout() {
  try {
    const res = await api.get('/platform/about');
    aboutData.value = res.data.about;
  } catch (error) {
    ElMessage.error('获取关于我们信息失败');
  }
}

async function fetchTerms() {
  try {
    const res = await api.get('/platform/terms');
    termsData.value = res.data.terms;
  } catch (error) {
    ElMessage.error('获取服务条款失败');
  }
}

async function fetchPrivacy() {
  try {
    const res = await api.get('/platform/privacy');
    privacyData.value = res.data.privacy;
  } catch (error) {
    ElMessage.error('获取隐私政策失败');
  }
}

async function fetchFaq() {
  try {
    const res = await api.get('/platform/faq');
    faqList.value = res.data.faq;
  } catch (error) {
    ElMessage.error('获取常见问题失败');
  }
}

function switchTab(tab: string) {
  activeTab.value = tab;
}
</script>

<style scoped>
.about-container {
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
  padding: 20px 20px 80px;
}

.loading {
  text-align: center;
  padding: 60px 20px;
  color: #999;
}

.loading p {
  margin-top: 15px;
}

.about-header {
  text-align: center;
  padding: 30px 20px;
  background: white;
  border-radius: 12px;
  margin-bottom: 20px;
}

.about-header h1 {
  margin: 0 0 10px 0;
  font-size: 24px;
  color: #333;
}

.slogan {
  margin: 0 0 10px 0;
  font-size: 16px;
  color: #667eea;
  font-weight: 500;
}

.description {
  margin: 0 0 10px 0;
  font-size: 14px;
  color: #666;
  line-height: 1.6;
}

.founded {
  margin: 0;
  font-size: 13px;
  color: #999;
}

.contact-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 20px;
}

.contact-card h3 {
  margin: 0 0 15px 0;
  font-size: 16px;
  color: #333;
}

.contact-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 0;
  border-bottom: 1px solid #f0f0f0;
  font-size: 14px;
  color: #666;
}

.contact-item:last-child {
  border-bottom: none;
}

.contact-item :deep(.el-icon) {
  color: #667eea;
  font-size: 18px;
}

.milestones-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
}

.milestones-card h3 {
  margin: 0 0 20px 0;
  font-size: 16px;
  color: #333;
}

.timeline {
  position: relative;
  padding-left: 20px;
}

.timeline::before {
  content: '';
  position: absolute;
  left: 5px;
  top: 5px;
  bottom: 5px;
  width: 2px;
  background: #e4e7ed;
}

.timeline-item {
  position: relative;
  padding-bottom: 20px;
}

.timeline-item:last-child {
  padding-bottom: 0;
}

.timeline-dot {
  position: absolute;
  left: -20px;
  top: 3px;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #667eea;
  border: 2px solid white;
  box-shadow: 0 0 0 2px #667eea;
}

.timeline-year {
  font-size: 14px;
  font-weight: 600;
  color: #667eea;
}

.timeline-event {
  margin: 4px 0 0 0;
  font-size: 13px;
  color: #666;
}

.doc-header {
  text-align: center;
  padding: 20px;
  background: white;
  border-radius: 12px;
  margin-bottom: 15px;
}

.doc-header h2 {
  margin: 0 0 8px 0;
  font-size: 20px;
  color: #333;
}

.doc-meta {
  margin: 0;
  font-size: 12px;
  color: #999;
}

.doc-content {
  background: white;
  border-radius: 12px;
  padding: 20px;
}

.doc-content pre {
  margin: 0;
  font-size: 14px;
  color: #333;
  line-height: 1.8;
  white-space: pre-wrap;
  font-family: inherit;
}

.faq-list {
  background: white;
  border-radius: 12px;
  overflow: hidden;
}

.faq-question {
  font-size: 14px;
  color: #333;
}

.faq-answer {
  margin: 0;
  font-size: 14px;
  color: #666;
  line-height: 1.6;
}

.nav-tabs {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  background: white;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
  padding: 8px 0;
}

.tab {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.tab :deep(.el-icon) {
  font-size: 22px;
  color: #999;
}

.tab span {
  font-size: 11px;
  color: #999;
}

.tab.active :deep(.el-icon),
.tab.active span {
  color: #667eea;
}
</style>
