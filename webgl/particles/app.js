const canvas = document.querySelector('canvas');
const gl = canvas.getContext('webgl');  // 获取webgl上下文

const vertex = `
  attribute vec2 position;
  uniform float u_rotation;
  uniform float u_time;
  uniform float u_duration;
  uniform float u_scale;
  uniform vec2 u_dir;
  varying float vP;
  void main() {
    float p = min(1.0, u_time / u_duration); // p为动画进度，取值区间从 0 到 1
    float rad = u_rotation + 3.14 * 10.0 * p; // rad 是旋转角度，它的值是初始角度 u_rotation 加上 10π，表示在动画过程中它会绕自身旋转 5 周
    float scale = u_scale * p * (2.0 - p); // p * (2.0 - p) 是一个缓动函数，它的作用是让 scale 的变化量随着时间推移逐渐减小
    vec2 offset = 2.0 * u_dir * p * p; // offset 是一个二维向量，它是初始值 u_dir 与 2.0 * p * p 的乘积，因为 u_dir 是个单位向量，这里的 2.0 表示它的最大移动距离为 2，p * p 也是一个缓动函数
    // 偏移矩阵， 注意一下是正常的矩阵转置后的形式
    mat3 translateMatrix = mat3(
      1.0, 0.0, 0.0,
      0.0, 1.0, 0.0,
      offset.x, offset.y, 1.0
    );
    // 旋转矩阵
    mat3 rotateMatrix = mat3(
      cos(rad), sin(rad), 0.0,
      -sin(rad), cos(rad), 0.0,
      0.0, 0.0, 1.0
    );
    // 缩放矩阵
    mat3 scaleMatrix = mat3(
      scale, 0.0, 0.0,
      0.0, scale, 0.0,
      0.0, 0.0, 1.0
    );
    gl_PointSize = 1.0;
    vec3 pos = translateMatrix * rotateMatrix * scaleMatrix * vec3(position, 1.0);
    gl_Position = vec4(pos, 1.0);
    vP = p;
  }
`;

const fragment = `
  precision mediump float;
  
  uniform vec4 u_color;
  varying float vP;
  void main()
  {
    gl_FragColor.xyz = u_color.xyz;
    gl_FragColor.a = (1.0 - vP) * u_color.a;
  }    
`;

// 创建顶点着色器
const vertexShader = gl.createShader(gl.VERTEX_SHADER);
gl.shaderSource(vertexShader, vertex);
gl.compileShader(vertexShader);

// 创建片元着色器
const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
gl.shaderSource(fragmentShader, fragment);
gl.compileShader(fragmentShader);

// 创建webgl program对象，添加两种着色器，并链接到webgl上下文对象
const program = gl.createProgram();
gl.attachShader(program, vertexShader);
gl.attachShader(program, fragmentShader);
gl.linkProgram(program);
gl.useProgram(program);

const position = new Float32Array([
  -1, -1,
  0, 1,
  1, -1,
]);
const bufferId = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, bufferId);
gl.bufferData(gl.ARRAY_BUFFER, position, gl.STATIC_DRAW);

const vPosition = gl.getAttribLocation(program, 'position');
gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);
gl.enableVertexAttribArray(vPosition);

function randomTriangles() {
  const u_color = [Math.random(), Math.random(), Math.random(), 1.0]; // 随机颜色
  const u_rotation = Math.random() * Math.PI; // 初始旋转角度
  const u_scale = Math.random() * 0.05 + 0.03; // 初始大小
  const u_time = 0;
  const u_duration = 3.0; // 持续3秒钟

  const rad = Math.random() * Math.PI * 2;
  const u_dir = [Math.cos(rad), Math.sin(rad)]; // 运动方向
  const startTime = performance.now();

  return {u_color, u_rotation, u_scale, u_time, u_duration, u_dir, startTime};
}

function setUniforms(gl, {u_color, u_rotation, u_scale, u_time, u_duration, u_dir}) {
  let loc = gl.getUniformLocation(program, 'u_color');
  gl.uniform4fv(loc, u_color);

  loc = gl.getUniformLocation(program, 'u_rotation');
  gl.uniform1f(loc, u_rotation);

  loc = gl.getUniformLocation(program, 'u_scale');
  gl.uniform1f(loc, u_scale);

  loc = gl.getUniformLocation(program, 'u_time');
  gl.uniform1f(loc, u_time);

  loc = gl.getUniformLocation(program, 'u_duration');
  gl.uniform1f(loc, u_duration);

  loc = gl.getUniformLocation(program, 'u_dir');
  gl.uniform2fv(loc, u_dir);
}

let triangles = [];
function update(t) {
  for(let i = 0; i < 5 * Math.random(); i++) {
    triangles.push(randomTriangles());
  }
  gl.clear(gl.COLOR_BUFFER_BIT);
  triangles.forEach((triangle) => {
    triangle.u_time = (performance.now() - triangle.startTime) / 1000;
    setUniforms(gl, triangle);
    gl.drawArrays(gl.TRIANGLES, 0, position.length / 2);
  });

  triangles = triangles.filter((triangle) => {
    return triangle.u_time <= triangle.u_duration;
  });
  requestAnimationFrame(update);
}

requestAnimationFrame(update);