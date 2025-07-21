export function createNameLabelCanvas(text = '', bgColor = 'rgba(0,0,0,0.7)') {
    const fontSize = 12;
    const scale = 2;
    const padding = 2;
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    ctx.font = `${fontSize * scale}px sans-serif`;
    const textWidth = ctx.measureText(text).width;
    canvas.width = textWidth + padding * 2 * scale;
    canvas.height = fontSize * scale + padding * 2 * scale;
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#ffffff';
    ctx.textBaseline = 'top';
    ctx.font = `${fontSize * scale}px sans-serif`;
    ctx.fillText(text, padding * scale, padding * scale);
    canvas.style.width = canvas.width / scale + 'px';
    canvas.style.height = canvas.height / scale + 'px';
    canvas.style.pointerEvents = 'none';
    canvas.className = 'battle-name-tag';
    return canvas;
}
