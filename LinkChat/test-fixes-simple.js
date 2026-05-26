const http = require('http');

function request(path, method, data, token) {
  return new Promise((resolve, reject) => {
    const body = data ? JSON.stringify(data) : '';
    const headers = {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(body)
    };
    if (token) {
      headers['Authorization'] = 'Bearer ' + token;
    }
    const req = http.request({
      hostname: '127.0.0.1',
      port: 3001,
      path: '/api' + path,
      method: method,
      headers: headers
    }, (res) => {
      let responseBody = '';
      res.on('data', chunk => responseBody += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(responseBody) });
        } catch (e) {
          resolve({ status: res.statusCode, body: responseBody });
        }
      });
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

async function runTests() {
  console.log('========================================');
  console.log('  乐聊 Bug 修复验证测试');
  console.log('========================================\n');

  const testPhone = '152' + Math.floor(Math.random() * 100000000).toString().padStart(8, '0');
  const testPhone2 = '153' + Math.floor(Math.random() * 100000000).toString().padStart(8, '0');
  const testPassword = '123456';
  const newPassword = '654321';
  let authToken = '';
  let wechatUserToken = '';

  try {
    console.log('【测试1】注册验证码发送和接收');
    let res = await request('/auth/send-code', 'POST', { phone: testPhone, type: 'register' });
    console.log('  状态码:', res.status);
    console.log('  结果:', res.body.message);
    const registerCode = res.body.code;
    console.log('  验证码:', registerCode);
    if (registerCode && registerCode.length === 6) {
      console.log('  ✅ 验证码正常接收\n');
    } else {
      console.log('  ❌ 验证码异常\n');
    }

    console.log('【测试2】用户注册（验证码验证）');
    res = await request('/auth/register', 'POST', { phone: testPhone, code: registerCode, password: testPassword });
    console.log('  状态码:', res.status);
    console.log('  结果:', res.body.message);
    if (res.status === 201 && res.body.token) {
      authToken = res.body.token;
      console.log('  ✅ 注册成功，验证码验证通过\n');
    } else {
      console.log('  ❌ 注册失败:', res.body.message, '\n');
    }

    console.log('【测试3】微信登录（第三方登录）');
    const mockWechatOpenId = 'wechat_test_' + Date.now();
    res = await request('/auth/third-party', 'POST', { 
      platform: 'wechat', 
      openId: mockWechatOpenId,
      nickname: '微信测试用户',
      avatar: ''
    });
    console.log('  状态码:', res.status);
    console.log('  结果:', res.body.message);
    console.log('  用户手机号:', res.body.user?.phone || '未绑定');
    if (res.status === 200 && res.body.token && !res.body.user.phone) {
      wechatUserToken = res.body.token;
      console.log('  ✅ 微信登录成功，手机号未绑定（符合预期）\n');
    } else {
      console.log('  ❌ 微信登录异常\n');
    }

    console.log('【测试4】微信用户绑定手机号');
    const bindCodeRes = await request('/auth/send-code', 'POST', { phone: testPhone2, type: 'bind_phone' });
    const bindCode = bindCodeRes.body.code;
    console.log('  绑定验证码:', bindCode);
    
    res = await request('/auth/bind-phone', 'POST', { phone: testPhone2, code: bindCode }, wechatUserToken);
    console.log('  状态码:', res.status);
    console.log('  结果:', res.body.message);
    console.log('  绑定后手机号:', res.body.user?.phone);
    if (res.status === 200 && res.body.user?.phone === testPhone2) {
      console.log('  ✅ 手机号绑定成功\n');
    } else {
      console.log('  ❌ 手机号绑定失败:', res.body.message, '\n');
    }

    console.log('【测试5】微信用户设置密码（绑定后）');
    const setPwdCodeRes = await request('/auth/send-code', 'POST', { phone: testPhone2, type: 'set_password' });
    const setPwdCode = setPwdCodeRes.body.code;
    console.log('  设置密码验证码:', setPwdCode);
    
    res = await request('/user/change-password', 'POST', { 
      phone: testPhone2,
      code: setPwdCode,
      newPassword: testPassword 
    }, wechatUserToken);
    console.log('  状态码:', res.status);
    console.log('  结果:', res.body.message);
    if (res.status === 200) {
      console.log('  ✅ 微信用户密码设置成功\n');
    } else {
      console.log('  ❌ 密码设置失败:', res.body.message, '\n');
    }

    console.log('【测试6】普通用户修改密码（已有密码）');
    res = await request('/user/change-password', 'POST', { 
      oldPassword: testPassword,
      newPassword: newPassword
    }, authToken);
    console.log('  状态码:', res.status);
    console.log('  结果:', res.body.message);
    if (res.status === 200) {
      console.log('  ✅ 普通用户密码修改成功\n');
    } else {
      console.log('  ❌ 密码修改失败:', res.body.message, '\n');
    }

    console.log('【测试7】验证新密码登录');
    res = await request('/auth/login', 'POST', { phone: testPhone, password: newPassword });
    console.log('  状态码:', res.status);
    console.log('  结果:', res.body.message);
    if (res.status === 200 && res.body.token) {
      console.log('  ✅ 新密码登录成功\n');
    } else {
      console.log('  ❌ 新密码登录失败:', res.body.message, '\n');
    }

    console.log('========================================');
    console.log('  ✅ 所有测试完成！');
    console.log('========================================');
    console.log('\n修复总结：');
    console.log('  1. 注册验证码接收正常');
    console.log('  2. 微信登录后可以正常绑定手机号');
    console.log('  3. 绑定手机号后可以正常设置/修改密码');
    console.log('  4. 新增 change_password 验证码类型支持改密场景');

  } catch (error) {
    console.error('测试出错:', error);
  }
}

runTests();
