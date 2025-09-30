<template>
  <div class="not-found-page">
    <div class="not-found-page__container">
      <div class="not-found-page__content">
        <!-- 404 图标 -->
        <div class="not-found-page__icon">
          <svg width="120" height="120" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
            <circle cx="12" cy="12" r="10"/>
            <path d="m9 9 6 6"/>
            <path d="m15 9-6 6"/>
          </svg>
        </div>

        <!-- 错误信息 -->
        <div class="not-found-page__text">
          <h1 class="not-found-page__title">404</h1>
          <h2 class="not-found-page__subtitle">页面未找到</h2>
          <p class="not-found-page__description">
            抱歉，您访问的页面不存在或已被移动。
            <br>
            让我们帮您回到正确的地方。
          </p>
        </div>

        <!-- 操作按钮 -->
        <div class="not-found-page__actions">
          <router-link to="/" class="btn btn--primary">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
              <polyline points="9,22 9,12 15,12 15,22"/>
            </svg>
            返回首页
          </router-link>
          
          <button @click="goBack" class="btn btn--secondary">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="m15 18-6-6 6-6"/>
            </svg>
            返回上页
          </button>
        </div>

        <!-- 建议链接 -->
        <div class="not-found-page__suggestions">
          <h3 class="suggestions__title">您可能想要：</h3>
          <ul class="suggestions__list">
            <li>
              <router-link to="/history" class="suggestions__link">
                查看历史记录
              </router-link>
            </li>
            <li>
              <router-link to="/settings" class="suggestions__link">
                个人设置
              </router-link>
            </li>
            <li>
              <router-link to="/login" class="suggestions__link">
                登录账户
              </router-link>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'

/**
 * 404 页面未找到组件
 */

const router = useRouter()

/**
 * 返回上一页
 */
const goBack = (): void => {
  // 如果有历史记录则返回上一页，否则跳转到首页
  if (window.history.length > 1) {
    router.back()
  } else {
    router.push('/')
  }
}
</script>

<style lang="scss" scoped>
@import '@/styles/base/variables';
@import '@/styles/utils/mixins';

.not-found-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  @include flex-center;
  padding: 2rem 1rem;

  &__container {
    width: 100%;
    max-width: 600px;
  }

  &__content {
    background: rgba(255, 255, 255, 0.95);
    border-radius: 20px;
    padding: 3rem 2rem;
    text-align: center;
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
    backdrop-filter: blur(10px);

    @include mobile {
      padding: 2rem 1.5rem;
      border-radius: 16px;
    }
  }

  &__icon {
    color: #667eea;
    margin-bottom: 2rem;
    opacity: 0.8;

    svg {
      width: 120px;
      height: 120px;

      @include mobile {
        width: 80px;
        height: 80px;
      }
    }
  }

  &__text {
    margin-bottom: 2.5rem;
  }

  &__title {
    font-size: 4rem;
    font-weight: 800;
    color: #333;
    margin: 0 0 0.5rem 0;
    line-height: 1;

    @include mobile {
      font-size: 3rem;
    }
  }

  &__subtitle {
    font-size: 1.5rem;
    font-weight: 600;
    color: #555;
    margin: 0 0 1rem 0;

    @include mobile {
      font-size: 1.25rem;
    }
  }

  &__description {
    color: #666;
    font-size: 1rem;
    line-height: 1.6;
    margin: 0;
    max-width: 400px;
    margin-left: auto;
    margin-right: auto;

    @include mobile {
      font-size: 0.9rem;
    }
  }

  &__actions {
    display: flex;
    gap: 1rem;
    justify-content: center;
    margin-bottom: 2rem;

    @include mobile {
      flex-direction: column;
      align-items: center;
    }
  }

  &__suggestions {
    padding-top: 2rem;
    border-top: 1px solid #eee;
  }
}

.suggestions {
  &__title {
    font-size: 1.1rem;
    font-weight: 600;
    color: #333;
    margin: 0 0 1rem 0;
  }

  &__list {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    gap: 1.5rem;
    justify-content: center;
    flex-wrap: wrap;

    @include mobile {
      flex-direction: column;
      gap: 0.75rem;
    }
  }

  &__link {
    color: #667eea;
    text-decoration: none;
    font-size: 0.9rem;
    font-weight: 500;
    padding: 0.5rem 1rem;
    border-radius: 6px;
    transition: all 0.2s;

    &:hover {
      background: rgba(102, 126, 234, 0.1);
      color: #5a6fd8;
    }
  }
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.875rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  text-decoration: none;
  cursor: pointer;
  transition: all 0.2s;
  min-width: 140px;
  justify-content: center;

  &--primary {
    background: linear-gradient(135deg, #667eea, #764ba2);
    color: white;

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 20px rgba(102, 126, 234, 0.4);
    }
  }

  &--secondary {
    background: #6c757d;
    color: white;

    &:hover {
      background: #5a6268;
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(108, 117, 125, 0.4);
    }
  }

  svg {
    width: 16px;
    height: 16px;
  }

  @include mobile {
    width: 100%;
    max-width: 200px;
  }
}

@include mobile {
  .not-found-page {
    padding: 1rem;

    &__actions {
      gap: 0.75rem;
    }
  }

  .suggestions__list {
    gap: 0.5rem;
  }
}
</style>