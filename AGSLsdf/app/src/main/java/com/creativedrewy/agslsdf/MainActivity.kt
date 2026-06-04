package com.creativedrewy.agslsdf

import android.graphics.RuntimeShader
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.FilterChip
import androidx.compose.material3.FilledTonalButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Slider
import androidx.compose.material3.SliderDefaults
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.derivedStateOf
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableStateListOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.ShaderBrush
import androidx.compose.ui.unit.dp
import com.creativedrewy.agslsdf.ui.theme.AGSLsdfTheme
import kotlin.math.abs
import kotlin.math.max
import kotlin.math.min

// ─── Data Model ────────────────────────────────────────────────────────────────

data class SdfColor(val r: Float, val g: Float, val b: Float) {
    fun toComposeColor(): Color = Color(r, g, b)

    /** Returns floatArrayOf(h 0..360, s 0..1, v 0..1) */
    fun toHsv(): FloatArray {
        val cMax = max(r, max(g, b))
        val cMin = min(r, min(g, b))
        val delta = cMax - cMin
        val h = when {
            delta == 0f -> 0f
            cMax == r -> 60f * (((g - b) / delta) % 6f)
            cMax == g -> 60f * (((b - r) / delta) + 2f)
            else -> 60f * (((r - g) / delta) + 4f)
        }.let { if (it < 0f) it + 360f else it }
        val s = if (cMax == 0f) 0f else delta / cMax
        return floatArrayOf(h, s, cMax)
    }

    companion object {
        fun fromHsv(h: Float, s: Float, v: Float): SdfColor {
            val c = v * s
            val x = c * (1f - abs((h / 60f) % 2f - 1f))
            val m = v - c
            val (r1, g1, b1) = when {
                h < 60f -> Triple(c, x, 0f)
                h < 120f -> Triple(x, c, 0f)
                h < 180f -> Triple(0f, c, x)
                h < 240f -> Triple(0f, x, c)
                h < 300f -> Triple(x, 0f, c)
                else -> Triple(c, 0f, x)
            }
            return SdfColor(r1 + m, g1 + m, b1 + m)
        }
    }
}

enum class SdfShapeType(val label: String) {
    CAPSULE("Capsule"),
    CUBE("Cube")
}

data class SdfEntity(
    val id: Int,
    val shapeType: SdfShapeType,
    val name: String,
    val length: Float,
    val width: Float,
    val height: Float,
    val rotX: Float = 0f,
    val rotY: Float = 0f,
    val rotZ: Float = 0f,
    val color: SdfColor
)

private val presetColors = listOf(
    SdfColor(0.25f, 0.50f, 0.92f),  // Blue
    SdfColor(0.92f, 0.35f, 0.18f),  // Orange
    SdfColor(0.20f, 0.80f, 0.40f),  // Green
    SdfColor(0.85f, 0.25f, 0.65f),  // Pink
    SdfColor(0.95f, 0.75f, 0.15f),  // Yellow
    SdfColor(0.40f, 0.75f, 0.85f),  // Cyan
    SdfColor(0.60f, 0.30f, 0.90f),  // Purple
    SdfColor(0.95f, 0.95f, 0.95f),  // White
    SdfColor(0.85f, 0.20f, 0.20f),  // Red
    SdfColor(0.15f, 0.15f, 0.15f),  // Dark
)

// ─── Shader Generation ─────────────────────────────────────────────────────────

private fun generateShaderSource(entities: List<SdfEntity>): String = buildString {
    // Uniforms
    appendLine("uniform float2 iResolution;")
    for (i in entities.indices) {
        appendLine("uniform float e${i}_length;")
        appendLine("uniform float e${i}_width;")
        appendLine("uniform float e${i}_height;")
        appendLine("uniform float e${i}_rotX;")
        appendLine("uniform float e${i}_rotY;")
        appendLine("uniform float e${i}_rotZ;")
        appendLine("uniform float e${i}_colorR;")
        appendLine("uniform float e${i}_colorG;")
        appendLine("uniform float e${i}_colorB;")
    }

    // Helper functions (always present)
    appendLine(
        """
float3 rotateX(float3 p, float a) {
    float c = cos(a); float s = sin(a);
    return float3(p.x, c * p.y - s * p.z, s * p.y + c * p.z);
}
float3 rotateY(float3 p, float a) {
    float c = cos(a); float s = sin(a);
    return float3(c * p.x + s * p.z, p.y, -s * p.x + c * p.z);
}
float3 rotateZ(float3 p, float a) {
    float c = cos(a); float s = sin(a);
    return float3(c * p.x - s * p.y, s * p.x + c * p.y, p.z);
}
float sdCapsule(float3 p, float h, float r) {
    p.y -= clamp(p.y, -h * 0.5, h * 0.5);
    return length(p) - r;
}
float sdRoundBox(float3 p, float3 b, float r) {
    float3 q = abs(p) - b;
    return length(max(q, 0.0)) + min(max(q.x, max(q.y, q.z)), 0.0) - r;
}
        """.trimIndent()
    )

    // map() — union of all entities, returns float2(distance, materialId)
    appendLine("float2 map(float3 p) {")
    appendLine("    float d = 1e10;")
    appendLine("    float matId = -1.0;")
    for ((i, entity) in entities.withIndex()) {
        appendLine("    {")
        appendLine("        float3 rp = rotateZ(rotateY(rotateX(p, e${i}_rotX), e${i}_rotY), e${i}_rotZ);")
        when (entity.shapeType) {
            SdfShapeType.CAPSULE ->
                appendLine("        float ed = sdCapsule(rp, e${i}_length, e${i}_width);")
            SdfShapeType.CUBE ->
                appendLine("        float ed = sdRoundBox(rp, float3(e${i}_width * 0.5, e${i}_height * 0.5, e${i}_length * 0.5), 0.05);")
        }
        appendLine("        if (ed < d) { d = ed; matId = ${i}.0; }")
        appendLine("    }")
    }
    appendLine("    return float2(d, matId);")
    appendLine("}")

    // Utilities
    appendLine(
        """
float mapDist(float3 p) { return map(p).x; }
float3 calcNormal(float3 p) {
    float e = 0.001;
    return normalize(float3(
        mapDist(float3(p.x + e, p.y, p.z)) - mapDist(float3(p.x - e, p.y, p.z)),
        mapDist(float3(p.x, p.y + e, p.z)) - mapDist(float3(p.x, p.y - e, p.z)),
        mapDist(float3(p.x, p.y, p.z + e)) - mapDist(float3(p.x, p.y, p.z - e))
    ));
}
float softShadow(float3 ro, float3 rd, float tmin, float tmax, float k) {
    float res = 1.0;
    float t = tmin;
    for (int i = 0; i < 32; i++) {
        float h = mapDist(ro + rd * t);
        res = min(res, k * h / t);
        t += clamp(h, 0.02, 0.2);
        if (res < 0.001 || t > tmax) break;
    }
    return clamp(res, 0.0, 1.0);
}
        """.trimIndent()
    )

    // main()
    appendLine("half4 main(float2 fragCoord) {")
    appendLine(
        """
    float2 uv = (fragCoord * 2.0 - iResolution) / min(iResolution.x, iResolution.y);
    uv.y = -uv.y;
    float3 ro = float3(0.0, 1.5, 4.5);
    float3 ta = float3(0.0, 0.0, 0.0);
    float3 ww = normalize(ta - ro);
    float3 uu = normalize(cross(ww, float3(0.0, 1.0, 0.0)));
    float3 vv = normalize(cross(uu, ww));
    float3 rd = normalize(uv.x * uu + uv.y * vv + 1.8 * ww);
    half3 bgTop = half3(0.12, 0.11, 0.18);
    half3 bgBot = half3(0.04, 0.04, 0.06);
    half3 col = mix(bgBot, bgTop, half(uv.y * 0.5 + 0.5));
    float t = 0.0;
    bool hit = false;
    float matId = -1.0;
    for (int i = 0; i < 100; i++) {
        float3 p = ro + rd * t;
        float2 res = map(p);
        if (res.x < 0.0005) { hit = true; matId = res.y; break; }
        if (t > 25.0) break;
        t += res.x;
    }
    if (hit) {
        float3 p = ro + rd * t;
        float3 n = calcNormal(p);
        half3 baseColor = half3(0.5, 0.5, 0.5);
        """.trimIndent()
    )

    // Per-entity color assignment
    for (i in entities.indices) {
        val keyword = if (i == 0) "if" else "} else if"
        appendLine("        $keyword (abs(matId - ${i}.0) < 0.1) {")
        appendLine("            baseColor = half3(e${i}_colorR, e${i}_colorG, e${i}_colorB);")
    }
    if (entities.isNotEmpty()) appendLine("        }")

    // Lighting
    appendLine(
        """
        float3 l1 = normalize(float3(2.0, 3.0, 2.0));
        float3 l2 = normalize(float3(-1.5, 1.0, -2.0));
        float diff1 = max(dot(n, l1), 0.0);
        float diff2 = max(dot(n, l2), 0.0);
        float amb = 0.12;
        float3 h1 = normalize(l1 - rd);
        float spec1 = pow(max(dot(n, h1), 0.0), 80.0);
        float3 h2 = normalize(l2 - rd);
        float spec2 = pow(max(dot(n, h2), 0.0), 40.0);
        float fresnel = pow(1.0 - max(dot(n, -rd), 0.0), 4.0);
        float sha = softShadow(p + n * 0.01, l1, 0.02, 10.0, 16.0);
        half3 keyLight = half3(1.0, 0.96, 0.90);
        half3 fillLight = half3(0.30, 0.40, 0.70);
        half3 rimColor = baseColor * half(0.8) + half3(0.2);
        col = baseColor * half(amb);
        col += baseColor * keyLight * half(diff1 * 0.75 * sha);
        col += baseColor * fillLight * half(diff2 * 0.35);
        col += keyLight * half(spec1 * 0.8 * sha);
        col += fillLight * half(spec2 * 0.3);
        col += rimColor * half(fresnel * 0.45);
    }
    col = pow(col, half3(1.0 / 2.2));
    return half4(col, 1.0);
        """.trimIndent()
    )
    appendLine("}")
}

// ─── Activity ──────────────────────────────────────────────────────────────────

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContent {
            AGSLsdfTheme {
                SDFScene()
            }
        }
    }
}

// ─── Main Screen ───────────────────────────────────────────────────────────────

@Composable
fun SDFScene() {
    val entities = remember { mutableStateListOf<SdfEntity>() }
    var selectedIndex by remember { mutableStateOf<Int?>(null) }
    var nextId by remember { mutableIntStateOf(0) }
    var capsuleCount by remember { mutableIntStateOf(0) }
    var cubeCount by remember { mutableIntStateOf(0) }

    // Regenerate shader only when entity structure (count / types) changes
    val structureKey by remember {
        derivedStateOf { entities.map { it.id to it.shapeType } }
    }

    val shader = remember(structureKey) {
        RuntimeShader(generateShaderSource(entities.toList()))
    }

    fun addEntity(type: SdfShapeType) {
        val color = presetColors[entities.size % presetColors.size]
        val (name, defaults) = when (type) {
            SdfShapeType.CAPSULE -> {
                capsuleCount++
                "Capsule $capsuleCount" to Triple(1.5f, 0.4f, 0.4f)
            }
            SdfShapeType.CUBE -> {
                cubeCount++
                "Cube $cubeCount" to Triple(1.0f, 1.0f, 1.0f)
            }
        }
        entities.add(
            SdfEntity(
                id = nextId++,
                shapeType = type,
                name = name,
                length = defaults.first,
                width = defaults.second,
                height = defaults.third,
                color = color
            )
        )
        selectedIndex = entities.lastIndex
    }

    fun removeEntity(index: Int) {
        entities.removeAt(index)
        selectedIndex = when {
            entities.isEmpty() -> null
            index >= entities.size -> entities.lastIndex
            else -> index
        }
    }

    fun updateEntity(index: Int, transform: (SdfEntity) -> SdfEntity) {
        entities[index] = transform(entities[index])
    }

    Scaffold(modifier = Modifier.fillMaxSize()) { innerPadding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(innerPadding)
        ) {
            // Shader canvas
            Canvas(
                modifier = Modifier
                    .fillMaxWidth()
                    .weight(1f)
            ) {
                shader.setFloatUniform("iResolution", size.width, size.height)
                for ((i, entity) in entities.withIndex()) {
                    shader.setFloatUniform("e${i}_length", entity.length)
                    shader.setFloatUniform("e${i}_width", entity.width)
                    shader.setFloatUniform("e${i}_height", entity.height)
                    shader.setFloatUniform("e${i}_rotX", entity.rotX)
                    shader.setFloatUniform("e${i}_rotY", entity.rotY)
                    shader.setFloatUniform("e${i}_rotZ", entity.rotZ)
                    shader.setFloatUniform("e${i}_colorR", entity.color.r)
                    shader.setFloatUniform("e${i}_colorG", entity.color.g)
                    shader.setFloatUniform("e${i}_colorB", entity.color.b)
                }
                drawRect(brush = ShaderBrush(shader))
            }

            // Controls panel
            Surface(
                modifier = Modifier
                    .fillMaxWidth()
                    .height(380.dp),
                tonalElevation = 3.dp,
                color = MaterialTheme.colorScheme.surfaceContainer
            ) {
                Column(
                    modifier = Modifier
                        .fillMaxSize()
                        .padding(horizontal = 16.dp, vertical = 12.dp)
                        .verticalScroll(rememberScrollState())
                ) {
                    // Add buttons
                    Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                        FilledTonalButton(onClick = { addEntity(SdfShapeType.CAPSULE) }) {
                            Text("+ Capsule")
                        }
                        FilledTonalButton(onClick = { addEntity(SdfShapeType.CUBE) }) {
                            Text("+ Cube")
                        }
                    }

                    // Entity chips
                    if (entities.isNotEmpty()) {
                        Spacer(Modifier.height(8.dp))
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .horizontalScroll(rememberScrollState()),
                            horizontalArrangement = Arrangement.spacedBy(8.dp)
                        ) {
                            for ((i, entity) in entities.withIndex()) {
                                FilterChip(
                                    selected = selectedIndex == i,
                                    onClick = {
                                        selectedIndex = if (selectedIndex == i) null else i
                                    },
                                    label = { Text(entity.name) }
                                )
                            }
                        }
                    }

                    // Property editor for selected entity
                    val selIdx = selectedIndex
                    if (selIdx != null && selIdx in entities.indices) {
                        val entity = entities[selIdx]

                        Spacer(Modifier.height(8.dp))
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Text(entity.name, style = MaterialTheme.typography.titleSmall)
                            TextButton(onClick = { removeEntity(selIdx) }) {
                                Text("Remove", color = MaterialTheme.colorScheme.error)
                            }
                        }

                        // Size
                        SectionLabel("Size")
                        SliderControl(
                            label = "Length",
                            value = entity.length,
                            onValueChange = { v -> updateEntity(selIdx) { it.copy(length = v) } },
                            valueRange = 0.1f..5.0f
                        )
                        SliderControl(
                            label = "Width",
                            value = entity.width,
                            onValueChange = { v -> updateEntity(selIdx) { it.copy(width = v) } },
                            valueRange = 0.1f..3.0f
                        )
                        SliderControl(
                            label = "Height",
                            value = entity.height,
                            onValueChange = { v -> updateEntity(selIdx) { it.copy(height = v) } },
                            valueRange = 0.1f..3.0f
                        )

                        // Rotation
                        SectionLabel("Rotation")
                        val pi = Math.PI.toFloat()
                        SliderControl(
                            label = "X",
                            value = entity.rotX,
                            onValueChange = { v -> updateEntity(selIdx) { it.copy(rotX = v) } },
                            valueRange = -pi..pi,
                            displayValue = "%.0f\u00B0".format(Math.toDegrees(entity.rotX.toDouble()))
                        )
                        SliderControl(
                            label = "Y",
                            value = entity.rotY,
                            onValueChange = { v -> updateEntity(selIdx) { it.copy(rotY = v) } },
                            valueRange = -pi..pi,
                            displayValue = "%.0f\u00B0".format(Math.toDegrees(entity.rotY.toDouble()))
                        )
                        SliderControl(
                            label = "Z",
                            value = entity.rotZ,
                            onValueChange = { v -> updateEntity(selIdx) { it.copy(rotZ = v) } },
                            valueRange = -pi..pi,
                            displayValue = "%.0f\u00B0".format(Math.toDegrees(entity.rotZ.toDouble()))
                        )

                        // Color
                        SectionLabel("Color")
                        ColorPicker(
                            color = entity.color,
                            onColorChange = { c ->
                                updateEntity(selIdx) { it.copy(color = c) }
                            }
                        )

                        Spacer(Modifier.height(8.dp))
                    } else if (entities.isNotEmpty()) {
                        Spacer(Modifier.height(16.dp))
                        Text(
                            "Select an entity to edit its properties",
                            style = MaterialTheme.typography.bodyMedium,
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                    }
                }
            }
        }
    }
}

// ─── Shared Composables ────────────────────────────────────────────────────────

@Composable
private fun SectionLabel(text: String) {
    Spacer(Modifier.height(4.dp))
    Text(
        text = text,
        style = MaterialTheme.typography.labelMedium,
        color = MaterialTheme.colorScheme.primary
    )
}

@Composable
private fun ColorPicker(
    color: SdfColor,
    onColorChange: (SdfColor) -> Unit
) {
    val hsv = remember(color) { color.toHsv() }
    val hue = hsv[0]
    val sat = hsv[1]
    val value = hsv[2]

    // Preview swatch + preset palette
    Row(
        modifier = Modifier.fillMaxWidth(),
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.spacedBy(8.dp)
    ) {
        // Current color preview
        Box(
            modifier = Modifier
                .size(36.dp)
                .clip(RoundedCornerShape(8.dp))
                .background(color.toComposeColor())
                .border(1.dp, MaterialTheme.colorScheme.outline, RoundedCornerShape(8.dp))
        )

        // Preset swatches
        Row(
            modifier = Modifier
                .weight(1f)
                .horizontalScroll(rememberScrollState()),
            horizontalArrangement = Arrangement.spacedBy(6.dp)
        ) {
            for (preset in presetColors) {
                Box(
                    modifier = Modifier
                        .size(28.dp)
                        .clip(CircleShape)
                        .background(preset.toComposeColor())
                        .then(
                            if (preset == color) Modifier.border(
                                2.dp,
                                MaterialTheme.colorScheme.primary,
                                CircleShape
                            )
                            else Modifier.border(
                                1.dp,
                                MaterialTheme.colorScheme.outlineVariant,
                                CircleShape
                            )
                        )
                        .clickable { onColorChange(preset) }
                )
            }
        }
    }

    Spacer(Modifier.height(4.dp))

    // Hue slider (rainbow)
    val hueGradient = Brush.horizontalGradient(
        colors = (0..6).map { i ->
            val h = i * 60f
            val c = SdfColor.fromHsv(h.coerceAtMost(359f), 1f, 1f)
            c.toComposeColor()
        }
    )
    Text("Hue", style = MaterialTheme.typography.labelSmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
    Box(modifier = Modifier.fillMaxWidth()) {
        // Rainbow track behind the slider
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 8.dp)
                .height(8.dp)
                .align(Alignment.Center)
                .clip(RoundedCornerShape(4.dp))
                .background(hueGradient)
        )
        Slider(
            value = hue,
            onValueChange = { h -> onColorChange(SdfColor.fromHsv(h, sat, value)) },
            valueRange = 0f..360f,
            modifier = Modifier.fillMaxWidth(),
            colors = SliderDefaults.colors(
                thumbColor = SdfColor.fromHsv(hue, 1f, 1f).toComposeColor(),
                activeTrackColor = Color.Transparent,
                inactiveTrackColor = Color.Transparent
            )
        )
    }

    // Saturation slider
    val satGradient = Brush.horizontalGradient(
        colors = listOf(
            SdfColor.fromHsv(hue, 0f, value).toComposeColor(),
            SdfColor.fromHsv(hue, 1f, value).toComposeColor()
        )
    )
    Text("Saturation", style = MaterialTheme.typography.labelSmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
    Box(modifier = Modifier.fillMaxWidth()) {
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 8.dp)
                .height(8.dp)
                .align(Alignment.Center)
                .clip(RoundedCornerShape(4.dp))
                .background(satGradient)
        )
        Slider(
            value = sat,
            onValueChange = { s -> onColorChange(SdfColor.fromHsv(hue, s, value)) },
            valueRange = 0f..1f,
            modifier = Modifier.fillMaxWidth(),
            colors = SliderDefaults.colors(
                thumbColor = color.toComposeColor(),
                activeTrackColor = Color.Transparent,
                inactiveTrackColor = Color.Transparent
            )
        )
    }

    // Brightness slider
    val valGradient = Brush.horizontalGradient(
        colors = listOf(
            Color.Black,
            SdfColor.fromHsv(hue, sat, 1f).toComposeColor()
        )
    )
    Text("Brightness", style = MaterialTheme.typography.labelSmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
    Box(modifier = Modifier.fillMaxWidth()) {
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 8.dp)
                .height(8.dp)
                .align(Alignment.Center)
                .clip(RoundedCornerShape(4.dp))
                .background(valGradient)
        )
        Slider(
            value = value,
            onValueChange = { v -> onColorChange(SdfColor.fromHsv(hue, sat, v)) },
            valueRange = 0f..1f,
            modifier = Modifier.fillMaxWidth(),
            colors = SliderDefaults.colors(
                thumbColor = color.toComposeColor(),
                activeTrackColor = Color.Transparent,
                inactiveTrackColor = Color.Transparent
            )
        )
    }
}

@Composable
private fun SliderControl(
    label: String,
    value: Float,
    onValueChange: (Float) -> Unit,
    valueRange: ClosedFloatingPointRange<Float>,
    displayValue: String = "%.2f".format(value)
) {
    Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.SpaceBetween
    ) {
        Text(
            text = label,
            style = MaterialTheme.typography.labelLarge,
            color = MaterialTheme.colorScheme.onSurface
        )
        Text(
            text = displayValue,
            style = MaterialTheme.typography.labelLarge,
            color = MaterialTheme.colorScheme.onSurfaceVariant
        )
    }
    Slider(
        value = value,
        onValueChange = onValueChange,
        valueRange = valueRange,
        modifier = Modifier.fillMaxWidth()
    )
}
