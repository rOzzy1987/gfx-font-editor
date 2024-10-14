<template>
    <canvas ref="cnv" :width="width * zoom" :height="height * zoom" @mouseenter="mouseEnter" @mouseleave="mouseLeave"
        @mousedown="mouseDown" @mousemove="mouseMove" @mouseup="mouseUp"></canvas>
    <TipBubble v-if="showTip1">Try drawing a line with <u>Shift</u> + <u>Click</u>!</TipBubble>
    <TipBubble v-if="showTip2">You can force a <i>pen</i> or <i>fill</i> color with <u>Ctrl</u> (white) and
        <u>Alt</u>(Black!)
    </TipBubble>
</template>

<script lang="ts">
import { type Point, BitmapEditor, BitmapRenderer, Pen, Tool, type Bitmap, type PenColor } from '../bll/Bitmap';
import TipBubble from '@/components/TipBubble.vue';

let __paintCounter = Number(localStorage.getItem('paintCounter') ?? 0);

export default {
    data() {
        const p: Point = { x: -1000, y: -1000 }
        return {
            cursorPos: p,
            penValue: 0 as PenColor,
            isMouseDown: false,
            lastPoint: { x: 0, y: 0 } as Point,
            showTip1: false,
            showTip2: false,
        }
    },
    mounted() {
        this.render();
    },
    props: {
        width: { type: Number, required: true },
        height: { type: Number, required: true },
        zoom: { type: Number, required: true },
        pen: { type: Pen, required: true },
        bitmap: { type: Array, required: true },
        tool: { type: Number, required: true }
    },
    methods: {
        mouseEnter(ev: MouseEvent) {
            this.getCanvasCoords(ev);
        },
        mouseMove(ev: MouseEvent) {
            this.getCanvasCoords(ev);
            if (ev.buttons == 0)
                this.isMouseDown = false;
            if (this.isMouseDown)
                this.paint();
            else
                this.render()
        },
        mouseDown(ev: MouseEvent) {
            this.tips();
            this.getCanvasCoords(ev);
            this.penValue = ev.ctrlKey ? 0
                : ev.altKey ? 1
                    : this.pen.color == -1 ? ((this.bitmapProp[this.bitmapCursorPos.y][this.bitmapCursorPos.x] > 0) ? 0 : 1)
                        : this.pen.color;
            if ((ev.shiftKey && this.tool == Tool.PEN) || this.tool == Tool.LINE) {
                this.line();
            } else if (this.tool == Tool.FILL) {
                this.fill();
            } else {
                this.isMouseDown = true;
                this.paint();
            }
        },
        mouseUp() {
            this.isMouseDown = false
        },
        mouseLeave() {
            this.cursorPos = { x: -1000, y: -1000 };
            this.render()
        },
        getCanvasCoords(ev: MouseEvent) {
            this.cursorPos = { x: ev.offsetX, y: ev.offsetY };
        },

        tips() {
            localStorage.setItem('paintCounter', (++__paintCounter).toFixed(0));
            if (__paintCounter == 5) {
                this.showTip1 = true;
                setTimeout(() => this.showTip1 = false, 5000);
            }
            if (__paintCounter == 15) {
                this.showTip2 = true;
                setTimeout(() => this.showTip2 = false, 8000);
            }

            if (__paintCounter == 500) __paintCounter = 0;
        },


        resize() {
            this.bitmapProp = BitmapEditor.resize(this.bitmapProp, this.width, this.height);
            this.render();
        },
        shiftH(px: number) {
            this.bitmapProp = BitmapEditor.shiftH(this.bitmapProp, px);
            this.render();
        },
        shiftV(px: number) {
            this.bitmapProp = BitmapEditor.shiftV(this.bitmapProp, px);
            this.render();
        },
        flipH() {
            this.bitmapProp = BitmapEditor.flipH(this.bitmapProp);
            this.render();
        },
        flipV() {
            this.bitmapProp = BitmapEditor.flipV(this.bitmapProp);
            this.render();
        },

        paint() {
            const pen = this.penWithExplicitValue();
            this.bitmapProp = BitmapEditor.paint(this.bitmapProp, { pen: pen, loc: this.bitmapCursorPos });
            this.lastPoint = { x: this.bitmapCursorPos.x, y: this.bitmapCursorPos.y }
            this.render();
        },
        fill() {
            const pen = this.penWithExplicitValue();
            this.bitmapProp = BitmapEditor.floodFill(this.bitmapProp, { pen: pen, loc: this.bitmapCursorPos });
            this.lastPoint = { x: this.bitmapCursorPos.x, y: this.bitmapCursorPos.y }
            this.render();
        },
        line() {
            const pen = this.penWithExplicitValue();
            this.bitmapProp = BitmapEditor.line(this.bitmapProp, { pen: pen, p1: this.bitmapCursorPos, p2: this.lastPoint });
            this.lastPoint = { x: this.bitmapCursorPos.x, y: this.bitmapCursorPos.y }
            this.render();
        },
        penWithExplicitValue() {
            const pen = new Pen();
            pen.bitmap = this.pen.bitmap;
            pen.center = this.pen.center;
            pen.color = this.penValue;
            return pen;
        },

        render() {
            setTimeout(this.doRender);
        },
        async doRender() {
            const cnv = this.$refs['cnv'] as HTMLCanvasElement;

            const ctx = cnv.getContext("2d");
            if (ctx == null) return;

            ctx.fillStyle = "#FFF";
            ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);

            const actx = ctx as any;
            actx.webkitImageSmoothingEnabled = false;
            actx.mozImageSmoothingEnabled = false;
            ctx.imageSmoothingEnabled = false;

            const data = BitmapRenderer.RenderBitmap(this.bitmapProp, { pen: this.pen as Pen, loc: this.bitmapCursorPos });
            if (data != null) {
                const img = await window.createImageBitmap(data);
                ctx.drawImage(img, 0, 0, this.canvasWidth, this.canvasHeight);
            }

            if (this.zoom >= 8) {
                for (let y = 0; y <= this.height; y++) {
                    ctx.clearRect(0, y * this.zoom - 1, this.canvasWidth, 2);
                }
                for (let x = 0; x <= this.width; x++) {
                    ctx.clearRect(x * this.zoom - 1, 0, 2, this.canvasHeight);
                }
            } else if (this.zoom >= 4) {
                for (let y = 0; y <= this.height; y++) {
                    ctx.clearRect(0, y * this.zoom, this.canvasWidth, 1);
                }
                for (let x = 0; x <= this.width; x++) {
                    ctx.clearRect(x * this.zoom, 0, 1, this.canvasHeight);
                }
            }
        },
    },
    computed: {
        canvasHeight(): number { return this.height * this.zoom; },
        canvasWidth(): number { return this.width * this.zoom; },
        bitmapCursorPos(): Point { return { x: Math.floor(this.cursorPos.x / this.zoom), y: Math.floor(this.cursorPos.y / this.zoom) }; },
        bitmapProp: {
            get(): Bitmap { return this.bitmap as Bitmap; },
            set(v: Bitmap) { this.$emit('update:bitmap', v); }
        },
    },
    watch: {
        width() { this.resize(); this.render(); },
        height() { this.resize(); this.render(); },
        zoom() { this.render(); },
    },
    components: { TipBubble }
}
</script>
<style scoped>
canvas {
    display: block;
}
</style>