<template>
    <div class="field">
        <label class="label">
            Jump to glyph:
        </label>
        <div class="control">
            <a class="tags has-addons" :href="'#glyph' + g.charCode" v-for="(g, gk) in font.glyphs" :key="gk">
                <span class="tag" :class="tagClass(g.charCode)"
                    :title="`${g.charCode} | 0x${g.charCode.toString(16).toUpperCase()}`">{{ g.char }}</span>
                <span class="tag is-black" v-if="isHex">{{ g.charCode.toString(16).toUpperCase() }}</span>
            </a>
        </div>
    </div>
</template>

<script lang="ts">
import { Font } from '@/bll/FontModel';

export default {
    data() {
        return {
            isHex: false
        }
    },
    props: {
        font: { type: Font, required: true }
    },
    methods: {
        tagClass(charCode: number) {
            if (charCode < 0x30) return "is-med";
            if (charCode < 0x3A) return "is-warning";
            if (charCode < 0x41) return "is-info";
            if (charCode < 0x5B) return "is-link";
            if (charCode < 0x61) return "is-info";
            if (charCode < 0x7B) return "is-success";
            if (charCode < 0x7F) return "is-info";
            return "is-danger";
        },
    },
}
</script>
<style scoped>
a.tags {
    text-decoration: none !important;
}

.tag.is-med {
    color: #FFF;
    background-color: #888;
}

.control {
    display: flex;
    flex-wrap: wrap;
    gap: 2px;
}

.tags {
    margin: 0;
}

.tags:hover {
    opacity: .6;
}
</style>