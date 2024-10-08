<template>
    <LoadScreen v-model:font="font" v-if="font == undefined" />
    <div class="block" v-if="font !== undefined">
        <FontEditor v-model:font="font" @add="addGlyph" @export="exportFont" @reset="resetFont" />
    </div>
    <div class="block glyphs" v-if="font !== undefined">
        <GlyphEditor
            v-for="g in font.glyphs"
            v-bind:key="`g${g.char}`"
            :model-value="g"
            :font-height="font.height"
            @clone="addGlyph"
            @delete="deleteGlyph"
        />
    </div>
</template>

<script lang="ts">
import { Font, Glyph } from './bll/FontModel';
import GlyphEditor from './components/GlyphEditor.vue';
import FontEditor from './components/FontEditor.vue';
import LoadScreen from './components/LoadScreen.vue';
import GfxFontExporter from './bll/GfxFontExporter';

export default {
    data() {
        return {
            font: undefined as Font | undefined
        };
    },
    methods: {
        addGlyph(src: Glyph | undefined = undefined) {
            const result = new Glyph();
            if (src != undefined) {
                result.base = src.base;
                result.cols = src.cols;
                result.rows = src.rows;
                result.xAdvance = src.xAdvance;
                result.xOffset = src.xOffset;
                result.bitmap = src.bitmap.map((r) => r.map((c) => c));
                result.char = src.char;
            }
            result.char = this.getNewChar(result.char);
            if (result.char.length == 1) {
                result.charCode = result.char.charCodeAt(0);
                this.font?.glyphs.push(result);
            }
        },
        getNewChar(val: string = '') {
            const c = prompt('Please specify the character or hex code', val);
            if (c == null) return '';
            if (c.length == 1) {
                return c;
            } else if (c.length >= 2 && c.length % 2 == 0) {
                return String.fromCharCode(Number.parseInt(c, 16));
            }
            return '';
        },
        deleteGlyph(g: Glyph) {
            if (!confirm('Are you sure you want to delete this glyph?')) return;
            const i = this.font?.glyphs.indexOf(g);
            this.font?.glyphs.splice(i ?? -1, 1);
        },
        exportFont() {
            const ex = new GfxFontExporter();
            const cpp = ex.export(this.font!);

            this.download(this.font!.name!.replace(/[^a-zA-Z0-9_]/g, '_') + '.h', cpp);
        },
        download(filename: string, content: string) {
            var element = document.createElement('a');
            element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(content));
            element.setAttribute('download', filename);

            element.style.display = 'none';
            document.body.appendChild(element);

            element.click();

            document.body.removeChild(element);
        },
        resetFont() {
            if (confirm('Are you sure you want to reset? All unsaved data will be lost!')) this.font = undefined;
        }
    },
    components: { GlyphEditor, FontEditor, LoadScreen }
};
</script>
<style>
.glyphs {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    flex-grow: 1;
}
</style>
