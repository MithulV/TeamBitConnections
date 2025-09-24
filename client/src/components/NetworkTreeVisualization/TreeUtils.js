export const TreeUtils = {
  // Generate default avatar
  generateDefaultAvatar: (name, email) => {
    const initials = name 
      ? name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
      : email ? email[0].toUpperCase() : '?';

    const colors = [
      '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FECA57',
      '#FF9FF3', '#54A0FF', '#5F27CD', '#00D2D3', '#FF9F43'
    ];
    const colorIndex = (name || email || '').length % colors.length;
    const backgroundColor = colors[colorIndex];

    return `data:image/svg+xml,${encodeURIComponent(`
      <svg width="100" height="100" xmlns="http://www.w3.org/2000/svg">
        <circle cx="50" cy="50" r="50" fill="${backgroundColor}"/>
        <text x="50" y="60" text-anchor="middle" fill="white" font-size="32" font-family="Arial, sans-serif" font-weight="bold">
          ${initials}
        </text>
      </svg>
    `)}`;
  },

  // Get avatar URL
  getAvatarUrl: (node) => {
    console.log('Getting avatar for node:', node.name, 'Profile picture:', node.profile_picture || node.nodeData?.profile_picture);

    if (node.type === 'user') {
      let profilePicture = node.profile_picture;

      if (!profilePicture && node.nodeData) {
        profilePicture = node.nodeData.profile_picture;
      }

      if (profilePicture && typeof profilePicture === 'string' && profilePicture.trim() !== '') {
        const cleanUrl = profilePicture.trim().replace(/^\[|\]$/g, '');

        if (cleanUrl.startsWith('http://') || cleanUrl.startsWith('https://')) {
          console.log('Using profile picture:', cleanUrl);
          return cleanUrl;
        }
      }
    }

    console.log('Using default avatar for:', node.name);
    return TreeUtils.generateDefaultAvatar(node.name, node.email);
  },

  // Color palette
  getNodeColor: (node, index) => {
    const colors = [
      "#cdb4db", "#ffafcc", "#f8ad9d", "#c9cba3", "#00afb9",
      "#84a59d", "#0081a7", "#ffc9b9", "#d0f4de", "#fcf6bd"
    ];
    return colors[index % colors.length];
  },

  // Text measurement
  measureTextWidth: (text, fontSize = 14, fontFamily = "Arial, sans-serif", fontWeight = "bold", canvasRef) => {
    if (!text) return 0;

    if (!canvasRef.current) {
      canvasRef.current = document.createElement('canvas');
    }

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    ctx.font = `${fontWeight} ${fontSize}px ${fontFamily}`;
    const metrics = ctx.measureText(text);
    return metrics.width;
  },

  // Calculate node dimensions
  getNodeDimensions: (node, canvasRef) => {
    const minWidth = 200;
    const avatarSpace = 85;
    const rightPadding = 30;

    const nameWidth = TreeUtils.measureTextWidth(node.name || "Unknown", 14, "Arial, sans-serif", "bold", canvasRef);
    const titleWidth = TreeUtils.measureTextWidth(node.title || "user", 11, "Arial, sans-serif", "normal", canvasRef);

    const maxTextWidth = Math.max(nameWidth, titleWidth);
    const requiredWidth = avatarSpace + maxTextWidth + rightPadding;
    const finalWidth = Math.max(requiredWidth, minWidth);

    return {
      width: finalWidth,
      height: 100
    };
  },

  // Format field names for display
  formatFieldName: (key) => {
    return key
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase())
      .replace(/_/g, ' ')
      .trim();
  },

  // Collect all image URLs from tree
  collectImageUrls: (node, urls = []) => {
    if (!node) return urls;

    if (node.imageURL && node.imageURL.startsWith('http')) {
      urls.push(node.imageURL);
    }

    if (node.children) {
      node.children.forEach(child => TreeUtils.collectImageUrls(child, urls));
    }

    return urls;
  },

  // Get all node IDs
  getAllNodeIds: (node, ids = []) => {
    if (!node) return ids;
    ids.push(node.id);
    if (node.children) {
      node.children.forEach(child => TreeUtils.getAllNodeIds(child, ids));
    }
    return ids;
  },

  // Generate smooth path between nodes
  generateSmoothPath: (parent, child, getNodePosition) => {
    const NODE_HEIGHT = 100;
    const parentPos = getNodePosition(parent);
    const childPos = getNodePosition(child);

    const startX = parentPos.x;
    const startY = parentPos.y + NODE_HEIGHT / 2;
    const endX = childPos.x;
    const endY = childPos.y - NODE_HEIGHT / 2;

    const midY = startY + (endY - startY) / 2;
    const cornerRadius = 20;

    if (Math.abs(endX - startX) < 10) {
      return `M ${startX} ${startY} L ${endX} ${endY}`;
    } else {
      const direction = endX > startX ? 1 : -1;

      return `M ${startX} ${startY} 
              L ${startX} ${midY - cornerRadius}
              Q ${startX} ${midY} ${startX + (cornerRadius * direction)} ${midY}
              L ${endX - (cornerRadius * direction)} ${midY}
              Q ${endX} ${midY} ${endX} ${midY + cornerRadius}
              L ${endX} ${endY}`;
    }
  }
};
