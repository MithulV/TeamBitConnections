// utils/TreeUtils.js
export const generateDefaultAvatar = (name) => {
  return name ? name.charAt(0).toUpperCase() : '?';
};

export const getAvatarUrl = (email) => {
  if (!email) return null;
  if (email.includes('@gmail.com') || email.includes('@googlemail.com')) {
    return `https://lh3.googleusercontent.com/a/default-user=${email.split('@')[0]}`;
  }
  return null;
};

export const getNodeColor = (role) => {
  const colors = {
    'CEO': '#ff6b6b',
    'CTO': '#4ecdc4',
    'Manager': '#45b7d1',
    'Developer': '#96ceb4',
    'Designer': '#feca57',
    'default': '#f8f9fa'
  };
  return colors[role] || colors.default;
};

export const measureTextWidth = (text, fontSize = 14, fontFamily = 'Arial') => {
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  context.font = `${fontSize}px ${fontFamily}`;
  return context.measureText(text).width;
};

export const getNodeDimensions = (node) => {
  const nameWidth = measureTextWidth(node.name, 14, 'bold');
  const roleWidth = measureTextWidth(node.role, 12);
  const maxTextWidth = Math.max(nameWidth, roleWidth);
  
  return {
    width: Math.max(250, maxTextWidth + 120),
    height: 80
  };
};

export const convertToTreeFormat = (networkData, utils) => {
  if (!networkData || !networkData.nodes || !networkData.edges) return null;
  
  const nodeMap = new Map();
  
  // Create nodes with enhanced data
  networkData.nodes.forEach(node => {
    const dimensions = utils.getNodeDimensions(node);
    nodeMap.set(node.id, {
      ...node,
      children: [],
      width: dimensions.width,
      height: dimensions.height,
      color: utils.getNodeColor(node.role),
      avatar: node.avatar || utils.getAvatarUrl(node.email)
    });
  });
  
  // Build parent-child relationships
  networkData.edges.forEach(edge => {
    const parent = nodeMap.get(edge.from);
    const child = nodeMap.get(edge.to);
    if (parent && child) {
      parent.children.push(child);
    }
  });
  
  // Find root node (node with no incoming edges)
  const childIds = new Set(networkData.edges.map(edge => edge.to));
  const rootNode = networkData.nodes.find(node => !childIds.has(node.id));
  
  return rootNode ? nodeMap.get(rootNode.id) : null;
};

export const calculatePositions = (node, x, y, level = 0) => {
  if (!node) return;
  
  node.x = x;
  node.y = y;
  
  if (node.children && node.children.length > 0) {
    const childrenWidth = node.children.length * 300;
    const startX = x - childrenWidth / 2 + 150;
    
    node.children.forEach((child, index) => {
      const childX = startX + index * 300;
      const childY = y + 150;
      calculatePositions(child, childX, childY, level + 1);
    });
  }
};

export const collectImageUrls = (node, urls = []) => {
  if (node.avatar && node.avatar.startsWith('http')) {
    urls.push(node.avatar);
  }
  
  if (node.children) {
    node.children.forEach(child => collectImageUrls(child, urls));
  }
  
  return urls;
};

export const getAllNodeIds = (node, ids = []) => {
  if (node) {
    ids.push(node.id);
    if (node.children) {
      node.children.forEach(child => getAllNodeIds(child, ids));
    }
  }
  return ids;
};

export const generateSmoothPath = (parent, child, getNodePosition) => {
  const parentPos = getNodePosition(parent);
  const childPos = getNodePosition(child);
  
  const startX = parentPos.x;
  const startY = parentPos.y + parent.height / 2;
  const endX = childPos.x;
  const endY = childPos.y - child.height / 2;
  
  const midY = startY + (endY - startY) / 2;
  
  return `M ${startX} ${startY} 
          C ${startX} ${midY} 
            ${endX} ${midY} 
            ${endX} ${endY}`;
};

export const primeImageCache = async (imageUrls, primedImages, setPrimedImages) => {
  const promises = imageUrls.map(url => {
    if (primedImages.has(url)) return Promise.resolve();
    
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        setPrimedImages(prev => new Set([...prev, url]));
        resolve();
      };
      img.onerror = () => resolve();
      img.src = url;
    });
  });
  
  await Promise.all(promises);
};
