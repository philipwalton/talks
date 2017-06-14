registerPaint('circle', class {
  static get inputProperties() {
    return ['--circle-color'];
  }
  paint(ctx, geom, props) {
    const x = geom.width / 2;
    const y = geom.height / 2;
    const radius = Math.min(x, y);
    const color = props.get('--circle-color').toString();

    ctx.fillStyle = color;
    ctx.arc(x, y, radius, 0, 2 * Math.PI, false);
    ctx.fill();
  }
});

