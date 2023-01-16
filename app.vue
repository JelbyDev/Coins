<script setup lang="ts">
import { Ref } from "vue";

// IMG LINK
// https://www.cryptocompare.com/media/34836095/433.png?width=25

interface Ticker {
  Id: number;
  ImageUrl: string;
  Symbol: string;
  FullName: string;
}

const { data: responseAllTickers } = await useFetch<{
  Data: { [index: string]: Ticker };
}>("https://min-api.cryptocompare.com/data/all/coinlist", {
  query: { summary: true },
  pick: ["Data"],
});
let allTickers: Ticker[] = [];
if (responseAllTickers.value?.Data) {
  allTickers = Object.values(responseAllTickers.value.Data);
}

const searchQuery = useDebounce("");
const autocompleteTickers: Ref<Ticker[]> = ref([]);

function updateAutocompleteTickers(searchName: string) {
  autocompleteTickers.value = [];

  if (searchName) {
    const maxLength = 6;
    let currentLength = 0;

    for (const ticker of allTickers) {
      if (
        ticker.Symbol.toLocaleLowerCase().includes(
          searchName.toLocaleLowerCase()
        ) ||
        ticker.FullName.toLocaleLowerCase().includes(
          searchName.toLocaleLowerCase()
        )
      ) {
        currentLength += 1;
        autocompleteTickers.value.push(ticker);
      }
      if (currentLength >= maxLength) {
        break;
      }
    }
  }
}

watch(searchQuery, () => {
  updateAutocompleteTickers(searchQuery.value);
});
</script>
<template>
  <div class="container max-w-5xl px-3 mx-auto">
    <form class="flex items-end gap-3">
      <div class="relative">
        <label>
          <span>Введите название тикета:</span>
          <br />
          <input
            v-model="searchQuery"
            type="text"
            class="h-9 px-3 rounded-md border border-solid border-gray-300"
            placeholder="BTC"
          />
        </label>
        <ul
          v-if="autocompleteTickers.length"
          class="w-full absolute top-full rounded-b-md border-solid border-gray-300 border divide-y overflow-hidden"
        >
          <li
            v-for="ticker in autocompleteTickers"
            :key="ticker.Symbol"
            class="flex items-center h-9 px-2 cursor-pointer bg-gray-50 hover:bg-gray-100"
          >
            {{ ticker.FullName }}
          </li>
        </ul>
      </div>

      <button
        class="h-9 px-3 text-white bg-gray-400 transition-colors duration-75 rounded-md hover:bg-gray-700"
      >
        Добавить
      </button>
    </form>
  </div>
</template>

<style scoped></style>
