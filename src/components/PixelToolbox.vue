<template>
    <div class="pixel-toolbox" :class="{ 'fixed': isFixed }">
        <button class="button is-light" title="Pin toolbar" :class="{ 'is-active': isFixed }"
            @click="isFixed = !isFixed">
            <span class="icon">
                <i class="fas" :class="{ 'fa-chevron-left': !isFixed, 'fa-chevron-right': isFixed }"></i>
            </span>
        </button>
        <div class="divider"></div>
        <button class="button is-danger is-light" :class="{ 'is-active': pen.color == 1 }" @click="penProp.color = 1"
            title="Color: black">
            <span class="icon">
                <svg style="height: 16px; width: 16px;">
                    <path d="M0 0 L16 0 L16 16 L0 16 L0 0" style="fill: #000; stroke: #000" />
                </svg>
            </span>
        </button>
        <button class="button is-danger is-light" :class="{ 'is-active': pen.color == 0 }" @click="penProp.color = 0"
            title="Color: white">
            <span class="icon">
                <svg style="height: 16px; width: 16px;">
                    <path d="M0 0 L16 0 L16 16 L0 16 L0 0" style="fill: none; stroke: #000" />
                </svg>
            </span>
        </button>
        <button class="button is-danger is-light" :class="{ 'is-active': pen.color == -1 }" @click="penProp.color = -1"
            title="Color: invert">
            <span class="icon">
                <svg style="height: 16px; width: 16px;">
                    <path d="M0 0 L16 0 L16 16 L0 16 L0 0" style="fill: none; stroke: #000" />
                    <path d="M0 16 L16 0 L16 16 L0 16" style="fill: #000; stroke: #000" />
                </svg>
            </span>
        </button>
        <div class="divider"></div>
        <button class="button is-warning is-light" :class="{ 'is-active': penSize == 0 }" @click="setPenSize(0)"
            title="Pen: Small square">
            <span class="icon is-small">
                <i class="fas fa-square"></i>
            </span>
        </button>
        <button class="button is-warning is-light" :class="{ 'is-active': penSize == 1 }" @click="setPenSize(1)"
            title="Pen: Medium square">
            <span class="icon">
                <i class="fas fa-square"></i>
            </span>
        </button>
        <button class="button is-warning is-light" :class="{ 'is-active': penSize == 2 }" @click="setPenSize(2)"
            title="Pen: Large square">
            <span class="icon is-large">
                <i class="fas fa-square"></i>
            </span>
        </button>
        <button class="button is-warning is-light" :class="{ 'is-active': penSize == 3 }" @click="setPenSize(3)"
            title="Pen: Small circle">
            <span class="icon is-small">
                <i class="fas fa-circle"></i>
            </span>
        </button>
        <button class="button is-warning is-light" :class="{ 'is-active': penSize == 4 }" @click="setPenSize(4)"
            title="Pen: Medium circle">
            <span class="icon">
                <i class="fas fa-circle"></i>
            </span>
        </button>
        <button class="button is-warning is-light" :class="{ 'is-active': penSize == 5 }" @click="setPenSize(5)"
            title="Pen: Large circle">
            <span class="icon is-large">
                <i class="fas fa-circle"></i>
            </span>
        </button>
        <div class="divider"></div>
        <button class="button is-success is-light" :class="{ 'is-active': toolProp == ToolEnum.FILL }"
            title="Tool: Flood fill" @click="toolProp = ToolEnum.FILL">
            <span class="icon">
                <i class="fas fa-fill-drip"></i>
            </span>
        </button>
        <button class="button is-success is-light" :class="{ 'is-active': toolProp == ToolEnum.PEN }" title="Tool: Pen"
            @click="toolProp = ToolEnum.PEN">
            <span class="icon">
                <i class="fas fa-pen"></i>
            </span>
        </button>
        <div class="divider"></div>
        <button class="button is-info is-light" @click="zoomIn(1)" title="Zoom in">
            <span class="icon">
                <i class="fas fa-search-plus"></i>
            </span>
        </button>
        <button class="button is-info is-light" @click="zoomIn(-1)" title="Zoom out">
            <span class="icon">
                <i class="fas fa-search-minus"></i>
            </span>
        </button>
    </div>
</template>

<script lang="ts">
import { Pen, PENS, Tool } from '../bll/Bitmap';


export default {
    data() {


        return {
            penSize: 0,
            zooms: [5, 7, 10, 15, 20],
            ToolEnum: Tool,
            isFixed: false,
        }
    },
    props: {
        pen: { type: Object, required: true },
        tool: { type: Number, required: true },
        zoom: { type: Number, default: 15 }
    },
    methods: {
        setPenSize(n: number) {
            this.penProp.bitmap = PENS[n].bitmap.concat();
            this.penProp.center = PENS[n].center;
            this.penSize = n;
        },
        zoomIn(n: 1 | -1) {
            let idx = this.zooms.findIndex(v => this.zoomProp <= v);
            idx = idx == -1 ? this.zooms.length - 1 : idx;
            if (this.zoomProp == this.zooms[idx]) idx += n;
            else if (n == -1) idx--;

            idx = Math.max(0, Math.min(this.zooms.length - 1, idx));

            this.zoomProp = this.zooms[idx];
        }
    },
    computed: {
        penProp(): Pen { return this.pen as Pen; },
        toolProp: {
            get(): Tool { return this.tool; },
            set(v: Tool) { this.$emit("update:tool", v); }
        },
        zoomProp: {
            get(): number { return this.zoom; },
            set(v: number) { this.$emit("update:zoom", v); }
        }
    }
}

</script>

<style scoped>
@keyframes pxtool {

    0% {
        transform: translate(32px, 0);
    }

    20% {
        transition-timing-function: ease-in-out;
        transform: translate(-52px, -5px);
    }

    10%,
    30% {
        transform: translate(-52px, 5px);
    }

    40%,
    90% {
        transform: translate(-52px, 0);
    }

    100% {
        transform: translate(0px, 0px);
    }
}

.pixel-toolbox {
    position: fixed;
    top: 50px;
    right: -52px;
    border-width: 1px 0 1px 1px;
    border-style: solid;
    border-color: #000;
    display: flex;
    flex-direction: column;
    gap: 1rem;
    padding: 1rem;
    background-color: #FFF;
    border-radius: 1rem 0 0 1rem;
    box-shadow: 0 0 16px rgba(0, 0, 0, .3);
    transition: all .2s ease-in-out;
    max-height: calc(100vh - 100px);
    overflow-y: auto;
    overflow-x: hidden;
    animation: 1s pxtool linear;
}

.pixel-toolbox.fixed {
    right: 0;
}

.pixel-toolbox:hover {
    right: 0;
}

.divider {
    width: 100%;
    border-top: 1px solid #888
}

button {
    height: 36px !important;
    width: 36px !important;
}

.icon {
    height: 24px !important;
    width: 24px !important;
}

.icon.is-small {
    font-size: 8px;
}

.icon.is-large {
    font-size: 24px
}
</style>
