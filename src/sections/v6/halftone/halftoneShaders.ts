/**
 * GLSL ES 3.0 ports of the two Figma shader effects on the V6 CTA background
 * (Figma 260:56525): "Gradient map" followed by "Halftone". The math is a
 * line-for-line translation of the WGSL Figma exports, including its colour
 * handling, so the defaults reproduce the design exactly.
 *
 * Coordinate notes: every pass samples in GL texture space (y up); the halftone
 * pass converts to design space (CSS px, y down) for its dot grid so the 15° /
 * 75° channel screens and the cursor position match the browser's orientation.
 *
 * The only addition is the cursor term in the halftone pass (u_pointer /
 * u_pointerStrength); with strength 0 the output is the Figma result.
 */

export const QUAD_VERT = /* glsl */ `#version 300 es
in vec2 a_pos;
out vec2 v_uv;
void main() {
  v_uv = a_pos * 0.5 + 0.5;
  gl_Position = vec4(a_pos, 0.0, 1.0);
}`;

/* Gradient map — luma of the input mapped through the gradient stops.
   Figma params: mixSpace sRGB, repeatType none, scatter 0, offset 0. */
export const GRADIENT_MAP_FRAG = /* glsl */ `#version 300 es
precision highp float;
in vec2 v_uv;
out vec4 outColor;
uniform sampler2D u_input;
uniform vec4 u_colors[8];
uniform float u_positions[8];
uniform int u_count;

float linearToSrgbChannel(float c) {
  if (c <= 0.0031308) return c * 12.92;
  return 1.055 * pow(c, 1.0 / 2.4) - 0.055;
}
vec3 linearToSrgb(vec3 c) {
  return vec3(linearToSrgbChannel(c.x), linearToSrgbChannel(c.y), linearToSrgbChannel(c.z));
}
float lumaSrgb(vec3 c) { return dot(c, vec3(0.2126, 0.7152, 0.0722)); }

vec4 gradientRamp(float t) {
  if (u_count == 0) return vec4(0.0);
  if (u_count == 1 || t <= u_positions[0]) return u_colors[0];
  int last = u_count - 1;
  if (t >= u_positions[last]) return u_colors[last];
  for (int i = 0; i < 7; i++) {
    if (i >= last) break;
    float p1 = u_positions[i + 1];
    if (t <= p1) {
      float p0 = u_positions[i];
      float f = (t - p0) / max(p1 - p0, 1e-5);
      return mix(u_colors[i], u_colors[i + 1], f);
    }
  }
  return u_colors[last];
}

void main() {
  vec4 inputColor = texture(u_input, v_uv);
  vec3 linearRgb = inputColor.rgb;
  if (inputColor.a > 0.0) linearRgb = inputColor.rgb / inputColor.a;
  vec3 srgbColor = linearToSrgb(clamp(linearRgb, 0.0, 1.0));
  float t = clamp(lumaSrgb(srgbColor), 0.0, 1.0);
  vec4 mapped = gradientRamp(t);
  outColor = vec4(mapped.rgb * mapped.a * inputColor.a, mapped.a * inputColor.a);
}`;

/* Separable Gaussian blur (the halftone's pre-pass): 65 taps spread over
   u_radius texels, accumulated in linear light. */
export const BLUR_FRAG = /* glsl */ `#version 300 es
precision highp float;
in vec2 v_uv;
out vec4 outColor;
uniform sampler2D u_input;
uniform vec2 u_dir;
uniform float u_radius;

vec4 unmultiplyAlpha(vec4 c) {
  if (c.a == 0.0) return vec4(0.0);
  return vec4(clamp(c.rgb / c.a, 0.0, 1.0), c.a);
}
float srgbToLinearMono(float v) {
  return v > 0.04045 ? pow((v + 0.055) / 1.055, 2.4) : v / 12.92;
}
vec3 srgbToLinear(vec3 c) { return vec3(srgbToLinearMono(c.r), srgbToLinearMono(c.g), srgbToLinearMono(c.b)); }
float linearToSrgbMono(float v) {
  return v > 0.0031308 ? 1.055 * pow(v, 0.41666) - 0.055 : v * 12.92;
}
vec3 linearToSrgb(vec3 c) { return vec3(linearToSrgbMono(c.r), linearToSrgbMono(c.g), linearToSrgbMono(c.b)); }

void main() {
  vec2 texel = 1.0 / vec2(textureSize(u_input, 0));
  vec3 sum = vec3(0.0);
  float weightSum = 0.0;
  float alpha = 0.0;
  float sigma = max(u_radius / 2.0, 0.5);
  float twoSigmaSq = 2.0 * sigma * sigma;
  for (int i = -32; i <= 32; i++) {
    float fi = float(i);
    float w = exp(-(fi * fi) / twoSigmaSq);
    vec2 offset = u_dir * texel * fi * (u_radius / 32.0);
    vec4 premult = texture(u_input, clamp(v_uv + offset, 0.0, 1.0));
    vec4 straight = unmultiplyAlpha(premult);
    sum += srgbToLinear(straight.rgb) * premult.a * w;
    alpha += premult.a * w;
    weightSum += w;
  }
  sum /= max(weightSum, 0.0001);
  alpha /= max(weightSum, 0.0001);
  vec4 col = unmultiplyAlpha(vec4(sum, alpha));
  col = vec4(linearToSrgb(col.rgb), col.a);
  outColor = vec4(col.rgb * col.a, col.a);
}`;

/* Halftone — "Dot" pattern, RGB colour mode (Figma colorMode 1, halftoneType 0).
   Each channel is its own dot screen (15° / 75° / 0°); a dot's radius follows
   the blurred colour under its centre, and the 3×3 neighbourhood is summed so
   large dots overlap cells cleanly. */
export const HALFTONE_FRAG = /* glsl */ `#version 300 es
precision highp float;
in vec2 v_uv;
out vec4 outColor;
uniform sampler2D u_blurred;
uniform vec2 u_dims;        // canvas size in CSS px (design units)
uniform vec2 u_center;      // grid origin in CSS px
uniform float u_dotSize;
uniform float u_dotScale;
uniform float u_softness;
uniform float u_rotation;   // radians
uniform vec2 u_pointer;     // cursor in CSS px (y down)
uniform float u_pointerStrength; // 0 = Figma spec, 1 = full cursor effect
uniform float u_pointerRadius;   // CSS px
uniform float u_pointerBoost;    // extra dot scale at the cursor

const float INV_PI = 0.3183098862;

mat2 rot(float t) {
  float c = cos(t);
  float s = sin(t);
  return mat2(c, -s, s, c);
}
vec2 localPosToGrid(vec2 p, float theta) {
  return (rot(theta) * (p - u_center)) * (1.0 / u_dotSize);
}
vec2 gridToLocalPos(vec2 p, float theta) {
  return rot(-theta) * (p * u_dotSize) + u_center;
}
float srgbToLinearMono(float v) {
  return v > 0.04045 ? pow((v + 0.055) / 1.055, 2.4) : v / 12.92;
}
// Design space (y down) -> GL texture space (y up).
vec2 toTex(vec2 p) {
  vec2 uv = clamp(p / u_dims, 0.0, 1.0);
  return vec2(uv.x, 1.0 - uv.y);
}
float dotRadiusForLuma(float luma) {
  if (luma <= 0.0) return 0.0;
  float rad = sqrt(luma * INV_PI);
  if (rad >= 0.5) {
    rad = (1.414 - pow(max(0.001, 1.0 - luma) / 1.673, 1.0 / 2.33)) * 0.5;
  }
  return rad;
}
float pointerScale(vec2 p) {
  if (u_pointerStrength <= 0.0) return 1.0;
  float d = length(p - u_pointer) / u_pointerRadius;
  float falloff = 1.0 - smoothstep(0.0, 1.0, d);
  return 1.0 + u_pointerBoost * u_pointerStrength * falloff;
}
vec3 dotRGB(vec2 gridPos, vec2 dotCenter, float theta, vec2 offset) {
  vec2 p = gridToLocalPos(dotCenter + offset, theta);
  vec4 c = texture(u_blurred, toTex(p));
  vec3 rgb = vec3(srgbToLinearMono(c.r), srgbToLinearMono(c.g), srgbToLinearMono(c.b));
  vec3 rad = vec3(dotRadiusForLuma(rgb.r), dotRadiusForLuma(rgb.g), dotRadiusForLuma(rgb.b))
    * u_dotScale * pointerScale(p);
  float d = length(gridPos - (dotCenter + offset));
  return vec3(
    smoothstep(rad.x * (1.0 + u_softness), rad.x * (1.0 - u_softness) - 0.001, d),
    smoothstep(rad.y * (1.0 + u_softness), rad.y * (1.0 - u_softness) - 0.001, d),
    smoothstep(rad.z * (1.0 + u_softness), rad.z * (1.0 - u_softness) - 0.001, d)
  );
}
vec3 halftoneRGB(vec2 localPos, float theta) {
  vec2 gridPos = localPosToGrid(localPos, theta);
  vec2 c = floor(gridPos + 0.5);
  vec3 d = dotRGB(gridPos, c, theta, vec2(0.0, 0.0));
  d += dotRGB(gridPos, c, theta, vec2(1.0, 0.0));
  d += dotRGB(gridPos, c, theta, vec2(-1.0, 0.0));
  d += dotRGB(gridPos, c, theta, vec2(0.0, 1.0));
  d += dotRGB(gridPos, c, theta, vec2(0.0, -1.0));
  d += dotRGB(gridPos, c, theta, vec2(1.0, 1.0));
  d += dotRGB(gridPos, c, theta, vec2(-1.0, 1.0));
  d += dotRGB(gridPos, c, theta, vec2(-1.0, -1.0));
  d += dotRGB(gridPos, c, theta, vec2(1.0, -1.0));
  return min(vec3(1.0), d);
}

void main() {
  vec2 localPos = vec2(v_uv.x, 1.0 - v_uv.y) * u_dims;
  vec3 color;
  color.x = halftoneRGB(localPos, u_rotation + radians(15.0)).x;
  color.y = halftoneRGB(localPos, u_rotation + radians(75.0)).y;
  color.z = halftoneRGB(localPos, u_rotation + radians(0.0)).z;
  // clipToAlpha is off in the design, so the output is fully opaque.
  outColor = vec4(color, 1.0);
}`;
