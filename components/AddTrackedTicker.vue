<script setup lang="ts">
import { ComputedRef, Ref } from "vue";
import { TickerFromApiResponse } from "@/types"

const emits = defineEmits<{
  (e: "create", ticker: TickerFromApiResponse): void
}>()

const { data: responseAllTickers } = await useFetch<{
  Data: { [index: string]: TickerFromApiResponse };
}>("https://min-api.cryptocompare.com/data/all/coinlist", {
  query: { summary: true },
  pick: ["Data"],
});
let allTickers: TickerFromApiResponse[] = [];
if (responseAllTickers.value?.Data) {
  allTickers = Object.values(responseAllTickers.value.Data);
}

const searchQuery: Ref<string> = ref(""); // useDebounce("", 300);
const autocompleteTickers: ComputedRef<TickerFromApiResponse[]> = computed(() => {
  if (!searchQuery.value) {
    return [];
  }

  const MAX_LENGTH = 6;
  let matches = 0;

  return allTickers.filter((ticker) => {
    if (
      (ticker.Symbol.toLocaleLowerCase().includes(
        searchQuery.value.toLocaleLowerCase()
      ) ||
        ticker.FullName.toLocaleLowerCase().includes(
          searchQuery.value.toLocaleLowerCase()
        )) &&
      matches < MAX_LENGTH
    ) {
      matches++
      return ticker;
    }
    return false;
  })
});

function onSelect(ticker: TickerFromApiResponse) {
  emits("create", ticker);
  searchQuery.value = "";
}

function onInput() {
  const fiendTicker: TickerFromApiResponse | undefined = allTickers.find((ticker: TickerFromApiResponse) => {
    if (
      ticker.Symbol.toLocaleLowerCase() === searchQuery.value.toLocaleLowerCase() ||
      ticker.FullName.toLocaleLowerCase() === searchQuery.value.toLocaleLowerCase()
    ) {
      return ticker;
    }
    return false;
  })

  if (fiendTicker) {
    emits("create", fiendTicker);
    searchQuery.value = "";
  }
}
</script>

<template>
  <form class="flex items-end gap-3" @submit.prevent>
    <div class="relative">
      <label>
        <span>Введите название тикета:</span>
        <br>
        <input
          v-model="searchQuery"
          type="text"
          class="h-9 px-3 rounded-md border border-gray-300"
          placeholder="BTC, btc, bitcoin..."
          @keydown.enter="onInput"
        >
      </label>
      <ul
        v-if="searchQuery"
        class="w-full absolute top-full rounded-b-md border-gray-300 border divide-y overflow-hidden z-10"
      >
        <li
          v-for="ticker in autocompleteTickers"
          :key="ticker.Symbol"
          class="flex items-center h-9 px-2 cursor-pointer bg-gray-50 hover:bg-gray-100"
          @click="onSelect(ticker)"
        >
          {{ ticker.FullName }}
        </li>
        <li v-if="!autocompleteTickers.length" class="flex items-center h-9 px-2 bg-gray-50">
          Совпадений нет...
        </li>
      </ul>
    </div>

    <!--<button
      class="h-9 px-3 text-white bg-gray-400 transition-colors duration-75 rounded-md hover:bg-gray-700"
      @click="onEmitCreate"
    >
      Добавить
    </button> -->
  </form>
</template>

<style scoped>

</style>
