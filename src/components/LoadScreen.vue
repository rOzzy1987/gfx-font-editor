<template>
    <div class="container" style="height: 100%">
        <h1 class="title">Adafruit GFX font editor</h1>
        <div class="message is-warning">
            <div class="message-header">Start project</div>
            <div class="message-body">
                <div class="buttons" style="justify-content: center">
                    <label for="file-upload" class="button is-success">
                        <span class="icon">
                            <i class="fas fa-upload"></i>
                        </span>
                        <span>Open file</span>
                    </label>
                    <button class="button is-info" @click="newFont">
                        <span class="icon">
                            <i class="fas fa-file-alt"></i>
                        </span>
                        <span>New from scratch</span>
                    </button>
                </div>
                <div class="buttons" style="justify-content: center">
                    <div class="field has-addons">
                        <div class="control">
                            <input type="text" class="input" placeholder="or open from URL" v-model="url">
                        </div>
                        <div class="control">
                            <button class="button" @click="openUrl">
                                <span class="icon">
                                    <i class="fas fa-arrow-right"></i>
                                </span>
                            </button>
                        </div>
                    </div>
                </div>
                <div class="buttons" style="justify-content: center">
                    <div class="file-drop-zone" :class="{ active: dragged }" @drop="drop" @dragenter="prevent"
                        @dragleave="dragLeave" @dragover="dragOver">
                        <p>... or drop file here</p>
                    </div>
                </div>

                <input type="file" id="file-upload" multiple hidden @change="fileSelected" />
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { FontLoader } from '@/bll/FontLoader';
import { Font } from '@/bll/FontModel';

export default {
    data() {
        return {
            dragged: false,
            uploads: 0,
            src: '',
            url: ''
        };
    },
    methods: {
        prevent(ev: UIEvent) {
            ev.preventDefault();
            ev.stopPropagation();
        },
        dragOver(ev: UIEvent) {
            this.prevent(ev);
            this.dragged = true;
        },
        dragLeave(ev: UIEvent) {
            this.prevent(ev);
            this.dragged = false;
        },
        appendSrc(filename: string, val: string | ArrayBuffer | null | undefined) {
            if (typeof val != 'string') return;
            this.src += `\n\n//-----------------------------\n// ${filename}\n\n` + val;
            if (this.uploads == 0) {
                this.parseFont();
            }
        },
        drop(ev: DragEvent) {
            this.prevent(ev);
            this.dragged = false;

            const files = [];

            if (ev.dataTransfer?.items) {
                for (const item of ev.dataTransfer.items) {
                    const file = item.getAsFile();
                    if (file == null) continue;
                    files.push(file);
                    console.log(file);
                }
            } else if (ev.dataTransfer?.files) {
                for (const file of ev.dataTransfer.files) {
                    files.push(file);
                    console.log(file);
                }
            }

            this.loadFiles(files);
        },
        fileSelected(ev: InputEvent) {
            const filesArr = [];
            const files = (ev.target as HTMLInputElement)?.files;
            for (let i = 0; i < (files?.length ?? 0); i++) {
                filesArr.push(files?.item(i));
            }
            (ev.target as HTMLInputElement)?.files ?? [];
            this.loadFiles(filesArr.filter((f) => f != null));
        },
        loadFiles(files: File[]) {
            this.src = '';

            for (const file of files) {
                if (
                    (!file.name.endsWith('.h') && !file.name.endsWith('.cpp') && !file.name.endsWith('.c')) ||
                    file.type != 'text/plain'
                )
                    continue;

                const t = this;
                this.uploads++;
                const reader = new FileReader();
                reader.onloadend = (e: ProgressEvent<FileReader>) => {
                    t.uploads--;
                    t.appendSrc(file.name, e.target?.result);
                };
                reader.readAsText(file);
            }
        },
        parseFont() {
            var parser = new FontLoader();
            this.fontProp = parser.loadCpp(this.src);
        },
        newFont() {
            const font = new Font();
            this.fontProp = font;
        },
        async openUrl() {
            this.src = await (await fetch(this.url)).text();
            this.parseFont();
        }
    },
    props: {
        font: { type: Font, required: false }
    },
    computed: {
        fontProp: {
            get(): Font | undefined {
                return this.font;
            },
            set(v: Font | undefined) {
                this.$emit('update:font', v);
            }
        }
    }
};
</script>

<style scoped>
.file-drop-zone {
    border: 5px dashed #000;
    border-radius: 32px;
    height: 240px;
    width: 320px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 24px;
    font-weight: bold;
    color: #000;
    opacity: 0.33;
    padding: 48px;
}

.file-drop-zone p {
    text-align: center;
}

.file-drop-zone.active {
    opacity: 1;
}
</style>
