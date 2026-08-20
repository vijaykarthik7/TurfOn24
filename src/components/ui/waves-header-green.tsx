import { useEffect, useRef } from "react"

const VERTEX_SHADER = `
attribute vec2 a_position;
void main() {
  gl_Position = vec4(a_position, 0.0, 1.0);
}
`

const FRAGMENT_SHADER = `
#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform float u_time;

float hash21(vec2 p) {
  p = fract(p * vec2(234.34, 435.345));
  p += dot(p, p + 34.23);
  return fract(p.x * p.y);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(hash21(i), hash21(i + vec2(1.0, 0.0)), u.x),
    mix(hash21(i + vec2(0.0, 1.0)), hash21(i + vec2(1.0, 1.0)), u.x),
    u.y
  );
}

void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution.xy;
  vec2 p = ((gl_FragCoord.xy - 0.5 * u_resolution.xy) / min(u_resolution.x, u_resolution.y)) * 1.45;
  float time = u_time * 0.12;
  float warped = p.x * 1.65 + sin(p.y * 1.8 + time) * 0.8;
  warped += (noise(p * 1.7 + time * 0.35) - 0.5) * 1.2;
  float bands = 0.5 + 0.5 * sin(warped * 6.0 - p.y * 2.4 - time * 2.0);
  float fineBands = 0.5 + 0.5 * sin(warped * 15.0 + p.y * 3.5 - time * 1.2);
  float cloud = noise(p * 1.3 - vec2(time * 0.3, time * 0.12));
  float glow = smoothstep(0.18, 0.92, bands * 0.7 + fineBands * 0.3 + cloud * 0.2);
  float grain = (noise(p * 5.0 + time) - 0.5) * 0.035;
  vec3 deepGreen = vec3(0.0, 0.24, 0.07);
  vec3 turfGreen = vec3(0.0, 0.68, 0.2);
  vec3 neon = vec3(0.0, 1.0, 0.4);
  vec3 color = mix(deepGreen, turfGreen, cloud * 0.65 + 0.2);
  color = mix(color, neon, glow * 0.48 + grain);
  float vignette = smoothstep(1.5, 0.25, length(p));
  gl_FragColor = vec4(color * (0.7 + vignette * 0.3), 1.0);
}
`

export function ShaderBackground({ className }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const gl = canvas.getContext("webgl", { antialias: false })
    if (!gl) return

    const compileShader = (type: number, source: string) => {
      const shader = gl.createShader(type)
      if (!shader) return null
      gl.shaderSource(shader, source)
      gl.compileShader(shader)
      return shader
    }

    const vertexShader = compileShader(gl.VERTEX_SHADER, VERTEX_SHADER)
    const fragmentShader = compileShader(gl.FRAGMENT_SHADER, FRAGMENT_SHADER)
    if (!vertexShader || !fragmentShader) return

    const program = gl.createProgram()
    const buffer = gl.createBuffer()
    if (!program || !buffer) return

    gl.attachShader(program, vertexShader)
    gl.attachShader(program, fragmentShader)
    gl.linkProgram(program)
    gl.useProgram(program)

    gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW)
    const position = gl.getAttribLocation(program, "a_position")
    gl.enableVertexAttribArray(position)
    gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0)

    const resolution = gl.getUniformLocation(program, "u_resolution")
    const time = gl.getUniformLocation(program, "u_time")
    let frame = 0
    let start = performance.now()

    const resize = () => {
      const rect = canvas.getBoundingClientRect()
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = Math.max(1, Math.round(rect.width * dpr))
      canvas.height = Math.max(1, Math.round(rect.height * dpr))
      gl.viewport(0, 0, canvas.width, canvas.height)
    }

    const render = (now: number) => {
      gl.uniform2f(resolution, canvas.width, canvas.height)
      gl.uniform1f(time, (now - start) / 1000)
      gl.drawArrays(gl.TRIANGLES, 0, 3)
      frame = requestAnimationFrame(render)
    }

    resize()
    window.addEventListener("resize", resize)
    frame = requestAnimationFrame(render)

    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener("resize", resize)
      gl.deleteBuffer(buffer)
      gl.deleteProgram(program)
      gl.deleteShader(vertexShader)
      gl.deleteShader(fragmentShader)
    }
  }, [])

  return <canvas ref={canvasRef} className={className} aria-hidden="true" />
}
