import React from 'react';
import { WeChatIcon, QQIcon, WeiboIcon } from './SocialIcons';

interface Props {
  onSocialLogin: (provider: string) => void;
}

export default function SocialLoginButtons({ onSocialLogin }: Props) {
  return (
    <div className="social-login-section">
      <div className="section-title">第三方登录</div>
      <div className="social-buttons">
        <button
          type="button"
          className="social-btn wechat"
          onClick={() => onSocialLogin('wechat')}
          title="微信登录"
        >
          <WeChatIcon />
        </button>
        <button
          type="button"
          className="social-btn qq"
          onClick={() => onSocialLogin('qq')}
          title="QQ登录"
        >
          <QQIcon />
        </button>
        <button
          type="button"
          className="social-btn weibo"
          onClick={() => onSocialLogin('weibo')}
          title="微博登录"
        >
          <WeiboIcon />
        </button>
      </div>
    </div>
  );
}
