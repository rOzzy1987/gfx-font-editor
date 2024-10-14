<template>
    <div class="tip">
        <div class="bubble">
            <div class="icon"><i class="fas fa-info-circle"></i></div>
            <slot></slot>
        </div>
        <div class="tail"></div>
    </div>
</template>

<style>
.tip {
    display: inline-block;
    position: absolute;
    bottom: calc(100% + 12px);
    left: 3rem;
    width: 200px;
    color: #000;
}

.tip .bubble,
.tip .tail {
    background-color: hsl(var(--bulma-info-h), var(--bulma-info-s), var(--bulma-info-l));
}

.tip .bubble {
    border-radius: 10px;
    padding: 8px;
}

.tip .tail {
    height: 15px;
    width: 15px;
    position: absolute;
    bottom: -7px;
    left: 40px;
    transform: rotate(45deg);
}

.tip .bubble u {
    font-family: monospace;
    text-decoration: none;
    background-color: rgba(0, 0, 0, .15);
    border-radius: 4px;
    padding: 2px;
}
</style>