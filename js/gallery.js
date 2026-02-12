// Gallery - Masonry Layout with Lightbox
// File: js/gallery.js

class Gallery {
  constructor() {
    this.gallery = document.getElementById('gallery');
    this.lightbox = document.getElementById('lightbox');
    this.lightboxImg = this.lightbox.querySelector('img');
    this.currentIndex = 0;
    this.images = [];
    this.columns = 2;
    
    this.init();
  }
  
  init() {
    this.loadImages();
    this.setupEventListeners();
    this.updateColumns();
    window.addEventListener('resize', () => this.updateColumns());
  }
  
  async loadImages() {
    try {
      const response = await fetch('gallery-data.json');
      this.images = await response.json();
      this.render();
    } catch (error) {
      console.error('Failed to load images:', error);
      this.showPlaceholder();
    }
  }
  
  showPlaceholder() {
    this.gallery.innerHTML = `
      <div class="placeholder" style="text-align: center; padding: 60px 20px; color: rgba(255,255,255,0.6);">
        <p style="font-size: 18px; margin-bottom: 10px;">📷 相册暂无图片</p>
        <p style="font-size: 14px;">请将图片添加到 images/gallery/ 文件夹，<br>并在 gallery-data.json 中配置</p>
      </div>
    `;
  }
  
  updateColumns() {
    const width = window.innerWidth;
    if (width >= 1024) {
      this.columns = 4;
    } else if (width >= 768) {
      this.columns = 3;
    } else {
      this.columns = 2;
    }
    this.render();
  }
  
  render() {
    if (this.images.length === 0) return;
    
    this.gallery.innerHTML = '';
    
    // Create columns
    const columnHeights = new Array(this.columns).fill(0);
    const columnElements = [];
    
    for (let i = 0; i < this.columns; i++) {
      const col = document.createElement('div');
      col.className = 'gallery-column';
      col.style.cssText = `
        display: flex;
        flex-direction: column;
        gap: 16px;
        flex: 1;
      `;
      this.gallery.appendChild(col);
      columnElements.push(col);
    }
    
    // Distribute images to shortest column
    this.images.forEach((img, index) => {
      const shortestCol = columnHeights.indexOf(Math.min(...columnHeights));
      const card = this.createCard(img, index);
      columnElements[shortestCol].appendChild(card);
      
      // Estimate height (will be adjusted after image loads)
      const aspectRatio = img.aspectRatio || 1;
      columnHeights[shortestCol] += (300 / aspectRatio) + 16;
    });
    
    // Setup lazy loading
    this.setupLazyLoading();
  }
  
  createCard(img, index) {
    const card = document.createElement('div');
    card.className = 'gallery-card';
    card.style.cssText = `
      background: rgba(255, 255, 255, 0.1);
      border-radius: 16px;
      overflow: hidden;
      cursor: pointer;
      transition: transform 0.3s ease, box-shadow 0.3s ease;
      position: relative;
    `;
    
    card.innerHTML = `
      <div style="position: relative; overflow: hidden;">
        <img 
          data-src="${img.src}" 
          alt="${img.desc || ''}"
          style="width: 100%; height: auto; display: block; opacity: 0; transition: opacity 0.5s ease;"
          loading="lazy"
        >
        <div class="loading-placeholder" style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: rgba(255,255,255,0.05);"></div>
      </div>
      <div style="padding: 12px 16px;">
        ${img.desc ? `<p style="margin: 0 0 4px 0; font-size: 14px; color: #fff; line-height: 1.4;">${img.desc}</p>` : ''}
        ${img.date ? `<p style="margin: 0; font-size: 12px; color: rgba(255,255,255,0.6);">${img.date}</p>` : ''}
      </div>
    `;
    
    // Hover effect
    card.addEventListener('mouseenter', () => {
      card.style.transform = 'translateY(-4px)';
      card.style.boxShadow = '0 12px 24px rgba(0,0,0,0.3)';
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = 'translateY(0)';
      card.style.boxShadow = 'none';
    });
    
    // Click to open lightbox
    card.addEventListener('click', () => this.openLightbox(index));
    
    return card;
  }
  
  setupLazyLoading() {
    const images = this.gallery.querySelectorAll('img[data-src]');
    const imageObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          img.src = img.dataset.src;
          img.onload = () => {
            img.style.opacity = '1';
            const placeholder = img.parentElement.querySelector('.loading-placeholder');
            if (placeholder) placeholder.remove();
          };
          imageObserver.unobserve(img);
        }
      });
    }, { rootMargin: '50px' });
    
    images.forEach(img => imageObserver.observe(img));
  }
  
  openLightbox(index) {
    this.currentIndex = index;
    this.updateLightboxImage();
    this.lightbox.style.display = 'flex';
    document.body.style.overflow = 'hidden';
  }
  
  closeLightbox() {
    this.lightbox.style.display = 'none';
    document.body.style.overflow = '';
  }
  
  updateLightboxImage() {
    const img = this.images[this.currentIndex];
    this.lightboxImg.src = img.src;
    this.lightboxImg.alt = img.desc || '';
  }
  
  nextImage() {
    this.currentIndex = (this.currentIndex + 1) % this.images.length;
    this.updateLightboxImage();
  }
  
  prevImage() {
    this.currentIndex = (this.currentIndex - 1 + this.images.length) % this.images.length;
    this.updateLightboxImage();
  }
  
  setupEventListeners() {
    // Close button
    this.lightbox.querySelector('.close').addEventListener('click', () => this.closeLightbox());
    
    // Next/Prev buttons
    this.lightbox.querySelector('.next').addEventListener('click', (e) => {
      e.stopPropagation();
      this.nextImage();
    });
    this.lightbox.querySelector('.prev').addEventListener('click', (e) => {
      e.stopPropagation();
      this.prevImage();
    });
    
    // Click outside to close
    this.lightbox.addEventListener('click', (e) => {
      if (e.target === this.lightbox) this.closeLightbox();
    });
    
    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
      if (this.lightbox.style.display === 'none') return;
      
      switch(e.key) {
        case 'Escape':
          this.closeLightbox();
          break;
        case 'ArrowRight':
          this.nextImage();
          break;
        case 'ArrowLeft':
          this.prevImage();
          break;
      }
    });
  }
}

// Initialize gallery when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  new Gallery();
});
