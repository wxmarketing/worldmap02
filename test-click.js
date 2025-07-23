// 测试脚本 - 移动端测试脚本
console.log('移动端测试启动...');

// 以下代码已注释，防止自动弹窗
/*
setTimeout(() => {
  console.log('开始移动端测试...');
  if (typeof updateCountryDetail === 'function') {
    console.log('直接调用updateCountryDetail显示美国详情...');
    updateCountryDetail('United States', 'US');
    console.log('美国详情应该已显示');
    setTimeout(() => {
      console.log('测试完成，详情页面应已显示');
      const detailPanel = document.getElementById('country-detail');
      if (detailPanel) {
        detailPanel.classList.remove('hidden');
        console.log('确保详情面板可见');
        console.log('当前视口宽度: ' + window.innerWidth + 'px');
      }
    }, 1000);
  } else {
    console.log('updateCountryDetail函数未找到');
  }
}, 1500);
*/