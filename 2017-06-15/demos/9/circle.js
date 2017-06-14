registerPaint('circle', class {
  static get inputProperties() {
    return ['--circle-x', '--circle-y', '--circle-size', '--circle-color'];
  }
  paint(ctx, geom, props) {
    const x = parseFloat(props.get('--circle-x'));
    const y = parseFloat(props.get('--circle-y'));
    const size = parseFloat(props.get('--circle-size'));
    const color = props.get('--circle-color').toString();

    ctx.fillStyle = color;
    ctx.arc(x, y, size, 0, 2 * Math.PI);
    ctx.fill();
  }
});
