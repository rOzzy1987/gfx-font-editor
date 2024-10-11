<template>
    <div class="root" :class="{ 'active': shownProp }">
        <div class="container">
            <div class="notification" :class="{ 'is-danger': isError, 'is-info': !isError }">
                <span class="icon" v-if="!isError"><i class="fas fa-info-circle"></i></span>
                <span class="icon" v-if="isError"><i class="fas fa-times-circle"></i></span>
                {{ msg }}
                <button class="delete" @click="shownProp = false"></button>
            </div>
        </div>
    </div>
</template>

<script lang="ts">

export default {
    props: {
        shown: { type: Boolean, required: true },
        msg: { type: String, required: true },
        isError: { type: Boolean, reuired: false, default: false }
    },
    methods: {
        startTimer() {
            setTimeout(() => {
                this.shownProp = false;
            }, 10000);
        }
    },
    computed: {
        shownProp: {
            get(): boolean { return this.shown; },
            set(v: boolean) { this.$emit("update:shown", v); }
        },
    },
    watch: {
        shown(v: boolean) {
            if (v)
                this.startTimer();
        }
    }
}
</script>
<style scoped>
.root {
    width: 100vw;
    position: fixed;
    bottom: 48px;
    left: 0;
    display: none;
    z-index: 100;
}

.root.active {
    display: block;
}

.root.active .notification {
    animation: display 10s linear forwards;
}

@keyframes display {
    0% {
        opacity: 0;
        transform: translateY(30px);
    }

    3% {
        opacity: 1;
        transform: translateY(0px);
    }

    97% {
        opacity: 1;
        transform: translateY(0px);
    }

    100% {
        opacity: 0;
        transform: translateY(30px);
    }
}
</style>