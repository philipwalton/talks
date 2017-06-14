registerPaint('ripple', class {
  static get inputProperties() {
    return ['--ripple-x', '--ripple-y', '--ripple-size', '--ripple-color'];
  }
  paint(ctx, geom, styleMap) {
    const x = parseFloat(styleMap.get('--ripple-x'));
    const y = parseFloat(styleMap.get('--ripple-y'));
    const size = parseFloat(styleMap.get('--ripple-size'));
    const color = styleMap.get('--ripple-color').toString();

    ctx.fillStyle = color;
    ctx.arc(x, y, size, 0, 2 * Math.PI);
    ctx.fill();
  }
});
