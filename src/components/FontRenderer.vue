<template>
    <div>
        <canvas width="320" ref="cnv"></canvas>
    </div>
</template>

<script lang="ts">
import { Font } from '@/bll/FontModel';


export default {
    data() {
        return { cursor: { x: 0, y: 0 } }
    },
    mounted() {
        this.render()
    },
    props: {
        font: { type: Font, required: true },
        text: { type: String, required: true }
    },
    methods: {
        render() {
            const cnv = this.$refs['cnv'] as HTMLCanvasElement;
            var h = this.font.height * 3;
            var w = 320;
            cnv.height = h;
            cnv.style.height = (h + 2) + 'px';

            const ctx = cnv.getContext("2d");
            if (ctx == null) return;
            ctx.fillStyle = "#FFF";
            ctx.fillRect(0, 0, w, h);

            this.cursor.x = Math.floor(this.font.height / 2);
            this.cursor.y = Math.floor(this.font.height * 1.5)

            const img = new ImageData(w, h, { colorSpace: 'srgb' });// ctx.createImageData(w, h);
            for (let i = 0; i < this.text.length; i++) {
                this.renderChar(img, this.text.charAt(i));
            }
            ctx.putImageData(img, 0, 0);
        },
        renderChar(ctx: ImageData, char: string) {
            if (char == '\n') {
                this.cursor.x = this.font.height / 2;
                this.cursor.y += this.font.height;
                return;
            }
            const g = this.font.glyphs.find(g => g.char == char);
            if (g == undefined) return;

            const stride = ctx.width * 4;

            for (let y = 0; y < g.rows; y++) {
                for (let x = 0; x < g.cols; x++) {
                    if (g.bitmap[y][x] == 0) continue;

                    const rx = this.cursor.x + x + g.xOffset;
                    const ry = this.cursor.y + y + g.base;

                    if (rx >= ctx.width || ry > ctx.height) continue;

                    let o = ry * stride + rx * 4;
                    ctx.data[o++] = 0x00; //B
                    ctx.data[o++] = 0x00; //G
                    ctx.data[o++] = 0x00; //R
                    ctx.data[o] = 0xFF;   //A
                }
            }
            this.cursor.x += g.xAdvance;
        }
    },
    watch: {
        text() { this.render(); },
        font() { this.render(); }
    }

}
</script>
<style scoped>
canvas {
    width: 322px;
    height: 60px;
    border: 1px solid #000;
    background: #FFF
}
</style>