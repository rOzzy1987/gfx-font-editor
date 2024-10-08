<template>
    <div class="glyph-editor message is-success" v-if="modelValueField !== undefined" @mouseup="mouseUp">
        <div class="message-header">
            <p>
                {{ modelValueField.char }} - ({{ modelValueField.charCode }} - 0x{{
                    modelValueField.charCode.toString(16)
                }})
            </p>
        </div>
        <div class="message-body">
            <div class="columns">
                <div class="column">
                    <div class="pixel-editor" :style="pixelEditorStyle">
                        <div class="pixels" :style="pixelsStyle">
                            <div v-for="(r, rk) in modelValueField.bitmap" v-bind:key="r" class="pixel-row">
                                <div
                                    v-for="(c, ck) of r"
                                    v-bind:key="c"
                                    class="pixel"
                                    :class="{ active: c > 0 }"
                                    @mousedown="mouseDn(ck, rk)"
                                    @mousemove="mouseMv(ck, rk)"
                                ></div>
                            </div>
                        </div>
                        <div class="line-marker" :style="lineStyle"></div>
                        <div class="char-marker" :style="charStyle"></div>
                    </div>
                </div>
                <div class="column">
                    <div
                        style="
                            display: flex;
                            flex-direction: column;
                            justify-content: end;
                            align-items: end;
                            flex-grow: 0;
                        "
                    >
                        <NumericEditor
                            v-model="modelValueField.cols"
                            :color="1"
                            :text="'wdth'"
                            title="Bitmap width"
                            class="fe"
                        />
                        <NumericEditor
                            v-model="modelValueField.rows"
                            :color="1"
                            :text="'hght'"
                            title="Bitmap height"
                            class="fe"
                        />
                        <NumericEditor
                            v-model="modelValueField.base"
                            :color="2"
                            :text="'base'"
                            title="Baseline offset"
                            :min="-250"
                            class="fe"
                        />
                        <NumericEditor
                            v-model="modelValueField.xOffset"
                            :color="3"
                            :text="'offs'"
                            title="X offset"
                            class="fe"
                        />
                        <NumericEditor
                            v-model="modelValueField.xAdvance"
                            :color="4"
                            :text="'xAdv'"
                            title="X advance"
                            class="fe"
                        />
                    </div>
                    <p>&nbsp;</p>
                    <div class="field buttons fe">
                        <div class="control">
                            <button class="button is-success is-small" @click="$emit('clone', modelValue)">
                                <span class="icon">
                                    <i class="fas fa-clone"></i>
                                </span>
                                <span>Clone</span>
                            </button>
                        </div>
                        <div class="control">
                            <button class="button is-danger is-small" @click="$emit('delete', modelValue)">
                                <span class="icon">
                                    <i class="fas fa-trash-alt"></i>
                                </span>
                                <span>Delete</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { Glyph } from '@/bll/FontModel';
import NumericEditor from '@/components/NumericEditor.vue';

export default {
    data(props) {
        return {
            modelValueField: props.modelValue,
            isMouseDn: false,
            pen: 0
        };
    },
    props: {
        modelValue: { type: Glyph, required: true },
        fontHeight: { type: Number, required: true }
    },
    methods: {
        mouseDn(x: number, y: number) {
            this.isMouseDn = true;
            this.pen = (this.modelValueField?.bitmap[y][x] ?? 0) ? 0 : 1;
            this.paint(x, y);
        },
        mouseMv(x: number, y: number) {
            if (this.isMouseDn) this.paint(x, y);
        },
        mouseUp() {
            this.isMouseDn = false;
        },
        paint(x: number, y: number) {
            if (this.modelValueField?.bitmap == undefined) return;
            this.modelValueField.bitmap[y][x] = this.pen;
        }
    },
    computed: {
        modelValueProp: {
            get(): Glyph {
                return this.modelValueField;
            },
            set(v: Glyph) {
                this.modelValueField = v;
                this.$emit('update:modelValue', v);
            }
        },
        sizing() {
            const lineTop = 0;
            const lineBottom = this.fontHeight;
            const charTop = lineBottom + this.modelValue.base;
            const charBottom = charTop + this.modelValue.rows;
            const minY = Math.min(lineTop, charTop);
            const maxY = Math.max(lineBottom, charBottom);
            const charLeft = this.modelValue.xOffset;
            const charRight = this.modelValue.cols + charLeft;
            const fieldLeft = 0;
            const fieldRight = this.modelValue.xAdvance;
            const minX = Math.min(charLeft, fieldLeft);
            const maxX = Math.max(charRight, fieldRight);
            const offsetY = -Math.min(lineTop, charTop);
            const offsetX = -Math.min(fieldLeft, charLeft);

            return {
                lineTop,
                lineBottom,
                fieldLeft,
                fieldRight,
                charTop,
                charBottom,
                charLeft,
                charRight,
                minX,
                maxX,
                minY,
                maxY,
                offsetX,
                offsetY
            };
        },
        pixelEditorStyle() {
            const s = this.sizing;
            return {
                height: (s.maxY - s.minY + 4) * 12 + 'px',
                width: (s.maxX - s.minX + 4) * 12 + 'px'
            };
        },
        pixelsStyle() {
            const s = this.sizing;

            return {
                top: (s.charTop + 2 + s.offsetY) * 12 + 'px',
                left: (s.charLeft + 2 + s.offsetX) * 12 + 'px'
            };
        },
        lineStyle() {
            const s = this.sizing;
            return {
                top: (s.lineTop + 2 + s.offsetY) * 12 - 1 + 'px',
                height: (s.lineBottom - s.lineTop) * 12 + 2 + 'px'
            };
        },
        charStyle() {
            const s = this.sizing;
            return {
                left: (s.fieldLeft + 2 + s.offsetX) * 12 - 1 + 'px',
                width: (s.fieldRight - s.fieldLeft) * 12 + 2 + 'px'
            };
        }
    },
    watch: {
        modelValue(v) {
            this.modelValueField = v;
        },
        'modelValueField.rows'(v) {
            v = v < 0 ? 0 : v;
            while (this.modelValueField.bitmap.length < v) {
                this.modelValueField.bitmap.push(Array(this.modelValueField.cols).map(() => 0));
            }
            while (this.modelValueField.bitmap.length > v) {
                this.modelValueField.bitmap.pop();
            }
        },
        'modelValueField.cols'(v) {
            v = v < 0 ? 0 : v;
            if (this.modelValueField.bitmap.length == 0) return;
            for (let r in this.modelValueField.bitmap) {
                while (this.modelValueField.bitmap[r].length < v) this.modelValueField.bitmap[r].push(0);
            }
            for (let r in this.modelValueField.bitmap) {
                while (this.modelValueField.bitmap[r].length > v) this.modelValueField.bitmap[r].pop();
            }
        }
    },
    emits: ['update:modelValue', 'clone', 'delete'],
    components: { NumericEditor }
};
</script>
<style scoped>
.fe {
    justify-content: end;
}

.glyph-editor {
    margin: 16px;
    flex-grow: 1;
}

.pixel-editor {
    background: #ccc;
    position: relative;
    overflow: hidden;
}

.line-marker {
    z-index: 2;
    position: absolute;
    top: 59px;
    left: 0px;
    height: 122px;
    width: 100%;
    border-top: 2px solid #f88;
    border-bottom: 2px solid #8f8;
}

.char-marker {
    z-index: 1;
    position: absolute;
    top: 0px;
    left: 59px;
    width: 98px;
    height: 100%;
    border-left: 2px solid #88f;
    border-right: 2px solid #88f;
}

.pixels {
    z-index: 3;
    position: absolute;
}

.pixel-row {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
}

.pixel {
    width: 10px;
    height: 10px;
    margin: 1px;
    background-color: #fff;
    color: #000;
    font-size: 10px;
    line-height: 10px;
    text-align: center;
    font-family: monospace;
    cursor: pointer;
    user-select: none;
}

.pixel:hover {
    background-color: #666;
}

.pixel.active {
    background-color: #000;
    color: #fff;
}

.pixel.active:hover {
    background-color: #aaa;
}
</style>
