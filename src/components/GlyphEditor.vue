<template>
    <div class="glyph-editor message is-success" v-if="modelValueField !== undefined">
        <div class="message-header">
            <p>
                <a :name="'glyph' + modelValueField.charCode"></a>
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
                            <PixelEditor ref="pxed" :width="modelValue.cols" :height="modelValue.rows"
                                :pen="app.config.globalProperties.pen" :zoom="app.config.globalProperties.zoom"
                                v-model:bitmap="bitmapProp" :tool="app.config.globalProperties.tool" />
                        </div>
                        <div class="line-marker" :style="lineStyle"></div>
                        <div class="char-marker" :style="charStyle"></div>
                    </div>
                </div>
                <div class="column">
                    <div class="block">
                        <div style="
                            display: flex;
                            flex-direction: column;
                            justify-content: end;
                            align-items: end;
                            flex-grow: 0;
                        ">
                            <NumericEditor v-model="modelValueField.cols" :color="1" :text="'wdth'" title="Bitmap width"
                                class="fe" />
                            <NumericEditor v-model="modelValueField.rows" :color="1" :text="'hght'"
                                title="Bitmap height" class="fe" />
                            <NumericEditor v-model="modelValueField.xOffset" :color="2" :text="'xOff'" title="X offset"
                                class="fe" />
                            <NumericEditor v-model="modelValueField.base" :color="2" :text="'yOff'"
                                title="Baseline offset" :min="-250" class="fe" />
                            <NumericEditor v-model="modelValueField.xAdvance" :color="4" :text="'xAdv'"
                                title="X advance" class="fe" />
                        </div>
                    </div>
                    <div class="block" style="display: flex; flex-direction:column; gap: 1rem; align-items: end;">
                        <div class="fe" style="display: flex; gap: 1rem;">
                            <div class="field has-addons fe">
                                <p class="control">
                                    <button class="button is-light is-link is-small" @click="moveL">
                                        <span class="icon">
                                            <i class="fas fa-left-long"></i>
                                        </span>
                                    </button>
                                </p>
                                <p class="control">
                                    <button class="button is-light is-link is-small" @click="moveR">
                                        <span class="icon">
                                            <i class="fas fa-right-long"></i>
                                        </span>
                                    </button>
                                </p>
                            </div>
                            <div class="field has-addons fe">
                                <p class="control">
                                    <button class="button is-light is-link is-small" @click="moveU">
                                        <span class="icon">
                                            <i class="fas fa-up-long"></i>
                                        </span>
                                    </button>
                                </p>
                                <p class="control">
                                    <button class="button is-light is-link is-small" @click="moveD">
                                        <span class="icon">
                                            <i class="fas fa-down-long"></i>
                                        </span>
                                    </button>
                                </p>
                            </div>
                        </div>
                        <div class="field has-addons">
                            <p class="control">
                                <button class="button is-light is-danger is-small" @click="flipV">
                                    <span class="icon">
                                        <i class="fas fa-arrows-up-down"></i>
                                    </span>
                                </button>
                            </p>
                            <p class="control">
                                <button class="button is-light is-danger is-small" @click="flipH">
                                    <span class="icon">
                                        <i class="fas fa-arrows-left-right"></i>
                                    </span>
                                </button>
                            </p>
                        </div>
                    </div>
                    <div class="block">
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
    </div>
</template>

<script lang="ts">
import { Glyph } from '@/bll/FontModel';
import NumericEditor from '@/components/NumericEditor.vue';
import PixelEditor from './PixelEditor.vue';
import { type Bitmap } from '../bll/Bitmap';
import { getCurrentInstance } from 'vue';

export default {
    data(props) {
        const app = getCurrentInstance()?.appContext.app!;
        return {
            modelValueField: props.modelValue,
            app,
        };
    },
    props: {
        modelValue: { type: Glyph, required: true },
        fontHeight: { type: Number, required: true },
    },
    methods: {
        moveL() {
            this.editorObj.shiftH(-1);
        },
        moveR() {
            this.editorObj.shiftH(1);
        },
        moveU() {
            this.editorObj.shiftV(-1);
        },
        moveD() {
            this.editorObj.shiftV(1);
        },
        flipH() {
            this.editorObj.flipH();
        },
        flipV() {
            this.editorObj.flipV();
        },
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
        bitmapProp: {
            get(): Bitmap { return this.modelValueField.bitmap; },
            set(v: Bitmap) {
                this.modelValueField.bitmap = v;
                this.$emit('update:modelValue', this.modelValueField);
            }
        },
        editorObj() { return (this.$refs.pxed) as any; },

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
            const zoom = this.app.config.globalProperties.zoom;

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
                offsetY,
                zoom
            };
        },
        pixelEditorStyle() {
            const s = this.sizing;
            return {
                height: (s.maxY - s.minY + 4) * s.zoom + 'px',
                width: (s.maxX - s.minX + 4) * s.zoom + 'px'
            };
        },
        pixelsStyle() {
            const s = this.sizing;

            return {
                top: (s.charTop + 2 + s.offsetY) * s.zoom + 'px',
                left: (s.charLeft + 2 + s.offsetX) * s.zoom + 'px'
            };
        },
        lineStyle() {
            const s = this.sizing;
            return {
                top: (s.lineTop + 2 + s.offsetY) * s.zoom - 1 + 'px',
                height: (s.lineBottom - s.lineTop) * s.zoom + 2 + 'px'
            };
        },
        charStyle() {
            const s = this.sizing;
            return {
                left: (s.fieldLeft + 2 + s.offsetX) * s.zoom - 1 + 'px',
                width: (s.fieldRight - s.fieldLeft) * s.zoom + 2 + 'px'
            };
        },
    },
    watch: {
        modelValue(v) {
            this.modelValueField = v;
        },
    },
    emits: ['update:modelValue', 'clone', 'delete'],
    components: { NumericEditor, PixelEditor }
};
</script>
<style scoped>
.fe {
    justify-content: end;
}

.glyph-editor {
    margin: 16px;
    min-width: 480px;
}

.pixel-editor {
    background: #ccc;
    position: relative;
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
