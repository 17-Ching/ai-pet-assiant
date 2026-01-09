# Tailwind CSS 使用指南

## ✅ 已完成安裝

Tailwind CSS v4 已成功安裝並配置！

## 📦 安裝的套件

- `tailwindcss` v4.1.18
- `@tailwindcss/postcss` (v4 專用)
- `postcss` v8.5.6
- `autoprefixer` v10.4.23

## 🎨 配置的自定義顏色

在 `tailwind.config.js` 中已配置以下自定義顏色：

```javascript
colors: {
  "success": "var(--success)",
  "success-100": "var(--success-100)",
  "info": "var(--info)",
  "warning": "var(--warning)",
  "danger": "var(--danger)",
  "text-primary": "var(--text-primary)",
  "text-secondary": "var(--text-secondary)",
  "text-100": "var(--text-100)",
  "text-80": "var(--text-80)",
  "text-60": "var(--text-60)",
  "text-40": "var(--text-40)",
  "text-20": "var(--text-20)",
  "text-10": "var(--text-10)",
  "bg-color": "var(--bg-color)",
}
```

## 🎯 配置的自定義漸變背景

```javascript
backgroundImage: {
  'primary': 'linear-gradient(212deg, var(--primary), var(--primary-dark))',
  'CTA': 'linear-gradient(210deg, var(--CTA-linear1) 7.08%, var(--CTA-linear2) 49.27%, var(--CTA-linear3) 91.47%)',
}
```

## 💡 使用範例

### 文字顏色

```html
<p class="text-text-primary">主要文字</p>
<p class="text-text-secondary">次要文字</p>
<p class="text-success">成功訊息</p>
<p class="text-danger">錯誤訊息</p>
```

### 背景顏色

```html
<div class="bg-bg-color">背景色</div>
<div class="bg-success-100">成功背景</div>
```

### 漸變背景

```html
<button class="bg-primary">主要按鈕</button>
<button class="bg-CTA">CTA 按鈕</button>
```

### 常用 Tailwind 類別

```html
<!-- 佈局 -->
<div class="flex items-center justify-between">...</div>
<div class="grid grid-cols-3 gap-4">...</div>

<!-- 間距 -->
<div class="p-4 m-2">...</div>
<div class="px-6 py-3">...</div>

<!-- 邊框 -->
<div class="border-2 border-text-20 rounded-xl">...</div>

<!-- 陰影 -->
<div class="shadow-sm hover:shadow-md">...</div>

<!-- 響應式 -->
<div class="w-full md:w-1/2 lg:w-1/3">...</div>
```

## 🚀 現在可以開始使用

在 Vue 組件中直接使用 Tailwind 類別：

```vue
<template>
  <div class="flex flex-col gap-4 p-6 bg-bg-color">
    <h1 class="text-2xl font-bold text-text-primary">標題</h1>
    <p class="text-text-secondary">內容文字</p>
    <button class="px-4 py-2 bg-CTA text-white rounded-lg hover:opacity-90">
      按鈕
    </button>
  </div>
</template>
```

## 📝 配置文件

- `tailwind.config.js` - Tailwind 主配置
- `postcss.config.js` - PostCSS 配置
- `src/style.css` - 包含 `@tailwind` 指令

開發伺服器已啟動在 http://localhost:5173/
