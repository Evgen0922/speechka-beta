<template>
<Mfm :text="user.name || user.username" :plain="true" :nowrap="nowrap" :custom-emojis="user.emojis"/>
</template>

<script lang="ts" setup>
import { } from 'vue';
import * as speechka from 'speechka-js';

const props = withDefaults(defineProps<{
	user: speechka.entities.User;
	nowrap?: boolean;
}>(), {
	nowrap: true,
});
</script>
