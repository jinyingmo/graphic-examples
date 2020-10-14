export const draw = (context, array) => {
  // 根据向量数组绘制图形
  // array为向量数组
  if(!Array.isArray(array) || array.length === 0) return;
  context.lineWidth = 1;
  context.beginPath();
  context.moveTo(...array[0]);
  for(let i = 1; i < array.length; i ++) {
    context.lineTo(...array[i]);
  }
  context.stroke();
}

export function parametric(xFunc, yFunc) {
  // 一个输入参数方程，返回功能函数的高阶函数
  // seg为分片大小，默认为100
  return function (start, end, seg = 100, ...args) {
    const points = [];
    for(let i = 0; i <= seg; i++) {
      const p = i / seg;
      const t = start * (1 - p) + end * p;
      const x = xFunc(t, ...args); // 计算参数方程组的x
      const y = yFunc(t, ...args);  // 计算参数方程组的y
      points.push([x, y]);
    }
    return {
      draw: (ctx) => draw(ctx, points),
      points,
    };
  };
}