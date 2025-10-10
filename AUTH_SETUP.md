# 用户认证系统设置指南

## 概述
本项目已集成 Supabase Auth 用户认证系统，只有登录用户才能访问管理面板和报告列表功能。

## Supabase 配置步骤

### 1. 启用认证功能
1. 登录 [Supabase Dashboard](https://supabase.com/dashboard)
2. 选择你的项目
3. 进入 `Authentication` → `Settings`
4. 确认 `Enable email confirmations` 设置（推荐开启）

### 2. 配置认证提供商
1. 在 `Authentication` → `Providers` 中
2. 确保 `Email` 提供商已启用
3. 可选：配置其他提供商（Google、GitHub 等）

### 3. 设置邮箱模板（可选）
1. 在 `Authentication` → `Email Templates` 中
2. 自定义注册确认邮件模板
3. 自定义密码重置邮件模板

### 4. 配置行级安全策略（RLS）
为了保护数据安全，建议为相关表启用 RLS：

```sql
-- 为 country_cards 表启用 RLS
ALTER TABLE country_cards ENABLE ROW LEVEL SECURITY;

-- 允许认证用户读取所有数据
CREATE POLICY "Allow authenticated read" ON country_cards
FOR SELECT USING (auth.role() = 'authenticated');

-- 允许认证用户插入/更新/删除数据
CREATE POLICY "Allow authenticated write" ON country_cards
FOR ALL USING (auth.role() = 'authenticated');

-- 为 country_card_details 表启用 RLS
ALTER TABLE country_card_details ENABLE ROW LEVEL SECURITY;

-- 允许认证用户读取所有数据
CREATE POLICY "Allow authenticated read details" ON country_card_details
FOR SELECT USING (auth.role() = 'authenticated');

-- 允许认证用户插入/更新/删除数据
CREATE POLICY "Allow authenticated write details" ON country_card_details
FOR ALL USING (auth.role() = 'authenticated');
```

### 5. 配置 Storage 权限
为 PDF 和图片存储配置适当的权限：

```sql
-- 为 country-pdfs bucket 设置策略
CREATE POLICY "Allow authenticated access" ON storage.objects
FOR ALL USING (bucket_id = 'country-pdfs' AND auth.role() = 'authenticated');

-- 为 card-images bucket 设置策略
CREATE POLICY "Allow authenticated access" ON storage.objects
FOR ALL USING (bucket_id = 'card-images' AND auth.role() = 'authenticated');
```

## 功能说明

### 认证流程
1. **账号创建**：管理员在 Supabase Dashboard 中手动创建用户账号
2. **登录**：使用管理员提供的邮箱和密码登录
3. **权限控制**：只有登录用户才能访问管理面板和报告列表

**注意**：注册功能已关闭，用户无法自行注册账号。

### 权限控制范围
- ✅ **需要登录**：管理面板、报告列表、PDF 上传、图片上传
- ✅ **无需登录**：地图浏览、国家详情查看、搜索功能

### 安全特性
- 密码最小长度：6位
- 邮箱格式验证
- 自动登出（会话过期）
- 安全的 JWT 令牌管理

## 用户账号管理

### 创建用户账号
管理员需要在 Supabase Dashboard 中手动创建用户账号：

1. 登录 [Supabase Dashboard](https://supabase.com/dashboard)
2. 进入 `Authentication` → `Users`
3. 点击 `Add user` 按钮
4. 输入邮箱和密码
5. 点击 `Create user`

### 测试步骤

1. **登录测试**：
   - 使用管理员创建的邮箱和密码登录
   - 确认登录后可以看到"管理面板"和"报告列表"按钮

2. **权限测试**：
   - 登出后尝试访问管理面板，应该提示需要登录
   - 登出后尝试访问报告列表，应该提示需要登录

3. **注册功能测试**：
   - 确认登录页面不再显示注册选项
   - 尝试直接访问注册接口，应该返回"注册功能已关闭"错误

## 故障排除

### 常见问题
1. **无法登录**：确认账号是否由管理员在 Supabase Dashboard 中创建
2. **权限错误**：检查 RLS 策略是否正确配置
3. **存储上传失败**：检查 Storage 权限策略

### 调试方法
1. 打开浏览器开发者工具
2. 查看 Console 中的认证状态日志
3. 检查 Network 标签页中的 API 请求

## 高级配置

### 自定义认证流程
如需自定义认证流程，可以修改 `auth.js` 文件中的相关函数。

### 添加更多用户信息
可以在 Supabase 中创建 `profiles` 表来存储用户的额外信息：

```sql
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  username TEXT,
  full_name TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 启用 RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 创建策略
CREATE POLICY "Users can view own profile" ON profiles
FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
FOR UPDATE USING (auth.uid() = id);
```

这样就完成了完整的用户认证系统集成！
