<template>
    <div class="root" :class="{ 'active': notifications.length > 0 }">
        <div class="container" v-for="n of notifications" v-bind:key="n.type + c">
            <div class="notification"
                :class="{ 'is-danger': n.type == 'err', 'is-info': n.type == 'info', 'is-warning': n.type == 'warn' }">
                <span class="icon" v-if="n.type == 'info'"><i class="fas fa-info-circle"></i></span>
                <span class="icon" v-if="n.type == 'err'"><i class="fas fa-times-circle"></i></span>
                <span class="icon" v-if="n.type == 'warn'"><i class="fas fa-exclamation-triangle"></i></span>
                {{ n.message }}
                <button class="delete" @click="close(n)"></button>
            </div>
        </div>
    </div>
</template>

<script lang="ts">

import { type Notification, NotificationBus } from '../bll/NorificationBus';

export default {
    data() {
        return {
            c: 0,
            notifications: [] as Notification[]
        }
    },
    mounted() {
        NotificationBus.register(this.handleNotification);
    },
    methods: {
        handleNotification(n: Notification) {
            this.notifications.push(n);
            setTimeout(() => {
                this.close(n);
            }, 10000);
        },
        close(n: Notification) {
            const i = this.notifications.indexOf(n);
            this.notifications.splice(i, 1);
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
    display: flex;
    flex-direction: column-reverse;
}

.root.active .notification {
    animation: display 10s linear forwards;
}

.notification {
    margin: 1rem 0;
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