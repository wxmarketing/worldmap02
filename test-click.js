// 测试脚本 - 移动端测试脚本
console.log('移动端测试启动...');

// 确保页面加载完成后执行测试
setTimeout(() => {
  console.log('开始移动端测试...');
  
  // 直接调用更新函数显示详情，不依赖于地图点击
  if (typeof updateCountryDetail === 'function') {
    console.log('直接调用updateCountryDetail显示美国详情...');
    updateCountryDetail('United States', 'US');
    console.log('美国详情应该已显示');
    
    // 增加一个延时，以便可以看到移动端布局效果
    setTimeout(() => {
      console.log('测试完成，详情页面应已显示');
      
      // 让详情面板始终可见，用于测试
      const detailPanel = document.getElementById('country-detail');
      if (detailPanel) {
        detailPanel.classList.remove('hidden');
        console.log('确保详情面板可见');
        
        // 检查页面宽度
        console.log('当前视口宽度: ' + window.innerWidth + 'px');
      }
    }, 1000);
  } else {
    console.log('updateCountryDetail函数未找到');
  }
}, 1500);