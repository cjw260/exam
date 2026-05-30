const CACHE_NAME = 'pyodide-cache-v1';

// 安装阶段：跳过等待，立即接管
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
});

// 拦截请求：只有请求第三方 CDN 或 PyPI 镜像时才进行缓存处理
self.addEventListener('fetch', (event) => {
  const url = event.request.url;
  
  // 仅拦截 Pyodide 核心文件 和 Python 镜像源包的请求
  if (url.includes('cdn.jsdelivr.net/pyodide') || 
      url.includes('pypi.tuna.tsinghua.edu.cn') || 
      url.includes('files.pythonhosted.org')) {
      
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }
        return fetch(event.request).then((response) => {
          // 确保请求成功才写入缓存
          if (response.status === 200) {
            const responseToCache = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseToCache);
            });
          }
          return response;
        });
      })
    );
  }
});