<template>
    <LoadScreen v-model:font="font" v-if="font == undefined" />
    <div class="block" v-if="font !== undefined">
        <FontEditor v-model:font="font" @add="addGlyph" @export="exportFont" @reset="resetFont" @save="saveToStorage" />
    </div>
    <div class="block glyphs" v-if="font !== undefined">
        <GlyphEditor v-for="g in font.glyphs" v-bind:key="`g${g.char}`" :model-value="g" :font-height="font.height"
            @clone="addGlyph" @delete="deleteGlyph" />
    </div>
    <NotificationProvider v-model:shown="msgShown" :msg="msg" :is-error="msgIsError" />
    <footer class="footer">
        <p class="has-text-centered">
            <b>Adafruit GFX font editor</b> by <a href="https://github.com/rOzzy1987" target="_blank">@rOzzy1987</a>
            <br>2024
        </p>
        <p class="has-text-centered">
            Source code available at <a href="https://github.com/rOzzy1987/gfx-font-editor" target="_blank">GitHub</a>
        </p>
        <SupportMe />
    </footer>
</template>

<script lang="ts">
import { Font, Glyph, type ISavedFont } from './bll/FontModel';
import GlyphEditor from './components/GlyphEditor.vue';
import FontEditor from './components/FontEditor.vue';
import LoadScreen from './components/LoadScreen.vue';
import GfxFontExporter from './bll/GfxFontExporter';
import NotificationProvider from './components/NotificationProvider.vue';
import SupportMe from './components/SupportMe.vue';

export default {
    data() {
        return {
            font: undefined as Font | undefined,
            msg: '',
            msgIsError: false,
            msgShown: false,
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
                this.font!.glyphs = [result].concat(this.font!.glyphs);
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

            this.msg = 'Download finished: ' + filename;
            this.msgIsError = false;
            this.msgShown = true;
        },
        resetFont() {
            if (confirm('Are you sure you want to reset? All unsaved data will be lost!')) this.font = undefined;
        },
        saveToStorage() {
            let strFonts = localStorage.getItem("fonts");
            const fonts = strFonts == null ? [] : JSON.parse(strFonts) as ISavedFont[];
            const font = {
                name: this.font?.name ?? "Font",
                date: new Date().valueOf(),
                font: this.font!
            }
            fonts.push(font)
            localStorage.setItem("fonts", JSON.stringify(fonts));

            this.msg = 'Font saved: ' + font.name;
            this.msgIsError = false;
            this.msgShown = true;
        }
    },
    components: { GlyphEditor, FontEditor, LoadScreen, NotificationProvider, SupportMe }
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
