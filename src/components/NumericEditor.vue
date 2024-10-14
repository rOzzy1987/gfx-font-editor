<template>
    <div class="numfield field has-addons" style="flex-grow: 0" @wheel="handleWheel">
        <p class="control">
            <button class="button" :class="cssClass" @click="
                sanitize();
            focus();
            value--;
            ">
                <span class="icon">
                    <i class="fas fa-minus-square"></i>
                </span>
            </button>
        </p>
        <p class="control" v-if="text != undefined">
            <span class="button dummy is-small" :class="cssClass">
                {{ text }}
            </span>
        </p>
        <p class="control">
            <input class="input has-text-right" :class="cssClass" v-model="value" @keypress="sanitize()" :min="min"
                :max="max" @change="sanitize()" @blur="sanitize()" @focus="focus()" type="number" inputmode="numeric"
                pattern="\d*" />
        </p>
        <p class="control">
            <button class="button" :class="cssClass" @click="
                sanitize();
            focus();
            value++;
            ">
                <span class="icon">
                    <i class="fas fa-plus-square"></i>
                </span>
            </button>
        </p>
        <TipBubble v-if="showTip">
            Try <u>Ctrl</u>+<u>Mouse scroll</u> while hovering over this area to adjust values quickly!
        </TipBubble>
    </div>
</template>

<script lang="ts">
import TipBubble from './TipBubble.vue';


let __numFieldCounter = JSON.parse(localStorage.getItem('numFieldCounter') ?? '0');

export default {
    data() {
        return {
            showTip: false
        };
    },
    props: {
        modelValue: { type: Number, required: true, default: 0 },
        text: { type: String, required: false },
        color: { type: Number, required: false, default: 0 },
        isSmall: { type: Boolean, required: false, default: true },
        min: { type: Number, required: false, default: 0 },
        max: { type: Number, required: false, default: 250 }
    },
    methods: {
        sanitize() {
            this.value = Number(this.value);
            if (Number.isNaN(this.value)) this.value = 0;
            this.value = Math.max(this.min, Math.min(this.max, this.value));
            this.value = Math.round(this.value);
        },
        handleWheel(e: WheelEvent) {
            if (!e.ctrlKey) return true;
            this.sanitize();
            this.value += e.deltaY == 0 ? 0 : e.deltaY / -Math.abs(e.deltaY);
            e.preventDefault();
            return false;
        },
        focus() {
            __numFieldCounter++;
            if (__numFieldCounter == 5) {
                this.showTip = true;
                setTimeout(() => this.showTip = false, 5000);
            }
            if (__numFieldCounter == 500) {
                __numFieldCounter = 0;
            }
            localStorage.setItem('numFieldCounter', JSON.stringify(__numFieldCounter));
        }
    },
    computed: {
        value: {
            get(): number {
                return this.modelValue;
            },
            set(v: number) {
                this.$emit('update:modelValue', v);
            }
        },
        cssClass() {
            let css = this.isSmall ? 'is-small ' : '';
            switch (this.color) {
                case 1:
                    return css + 'is-danger';
                case 2:
                    return css + 'is-warning';
                case 3:
                    return css + 'is-info';
                case 4:
                    return css + 'is-success';
                case 5:
                    return css + 'is-dark';
                default:
                    return css + '';
            }
        }
    },
    components: {
        TipBubble
    }
};
</script>

<style scoped>
.numfield {
    position: relative;
}

input {
    width: 60px;
}

.button.dummy {
    font-family: monospace;
}

/* Chrome, Safari, Edge, Opera */
input::-webkit-outer-spin-button,
input::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
}

/* Firefox */
input[type='number'] {
    -moz-appearance: textfield;
}
</style>
