<template>
    <div class="message is-info">
        <div class="message-header">{{ fontProp.name }}</div>
        <div class="message-body">
            <div class="columns">
                <div class="column">
                    <div class="field">
                        <label for="fontName" class="label">Font name</label>
                        <div class="control">
                            <input type="text" class="input" v-model="fontProp.name" />
                        </div>
                    </div>
                </div>
                <div class="column">
                    <div class="field">
                        <label for="fontName" class="label">Font height</label>
                        <NumericEditor v-model="fontProp.height" :is-small="false" />
                    </div>
                </div>
            </div>
            <div>
                <div class="columns">
                    <div class="column">
                        <div class="buttons">
                            <button class="button is-info" @click="$emit('export')">
                                <span class="icon">
                                    <i class="fas fa-download"></i>
                                </span>
                                <span>Export</span>
                            </button>
                            <button class="button is-danger" @click="$emit('reset')">
                                <span class="icon">
                                    <i class="fas fa-rotate"></i>
                                </span>
                                <span>Reset</span>
                            </button>
                        </div>
                    </div>
                    <div class="column has-text-right">
                        <button class="button is-success" @click="$emit('add')">
                            <span class="icon">
                                <i class="fas fa-plus-square"></i>
                            </span>
                            <span>Add glyph</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { Font } from '@/bll/FontModel';
import NumericEditor from '@/components/NumericEditor.vue';

export default {
    props: {
        font: { type: Font, required: true }
    },
    computed: {
        fontProp: {
            get(): Font {
                return this.font;
            },
            set(v: Font) {
                this.$emit('update:font', v);
            }
        }
    },
    emits: ['update:font', 'add', 'export', 'reset'],
    components: { NumericEditor }
};
</script>
