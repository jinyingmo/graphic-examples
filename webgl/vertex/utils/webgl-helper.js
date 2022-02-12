export const createShaderFromScript = (gl, glShader, shaderId) => {
  var shaderSource = document.querySelector(`#${shaderId}`).innerHTML;
  // 创建片元着色器程序
  var shader = gl.createShader(glShader);
  // 将源码分配给片元着色器对象
  gl.shaderSource(shader, shaderSource);
  // 编译片元着色器
  gl.compileShader(shader);

  return shader
}

export const randomColor = () => {
  return {
    r: 255 * Math.random(),
    g: 255 * Math.random(),
    b: 255 * Math.random(),
    a: 1 * Math.random(),
  }
}