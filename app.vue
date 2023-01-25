<script setup lang="ts">
import { Ref } from "vue";
import { TickerFromApiResponse, TickerTracked } from "@/types";
import { subscribeToTicker, unsubscribeFromTicker } from "@/api/Ticker";

// IMG LINK
// https://www.cryptocompare.com/media/34836095/433.png?width=25
// https://min-api.cryptocompare.com/documentation?key=Toplists&cat=TopTotalVolumeEndpointFull
// https://www.cryptocompare.com

let allTickers: TickerFromApiResponse[] | null = null;
const isLoadingTickersFromApi = ref(true);
const trackedTickers: Ref<TickerTracked[]> = ref([]);

async function loadAllTickers() {
  const { data: responseAllTickers } = await useFetch<{
    Data: { [index: string]: TickerFromApiResponse };
  }>("https://min-api.cryptocompare.com/data/all/coinlist", {
    query: { summary: true },
    pick: ["Data"],
  });
  if (responseAllTickers.value?.Data) {
    allTickers = Object.values(responseAllTickers.value.Data);
  }
  isLoadingTickersFromApi.value = false;
}

function setTrackedTickerFromStorage() {
  const storageTrackedTicker = getItemFromStorage("trackedTickers");
  if (storageTrackedTicker) {
    for (const ticker of JSON.parse(storageTrackedTicker)) {
      ticker.price = -1;
      trackedTickers.value.push(ticker);
      subscribeToTicker(ticker.Symbol, (newPrice: number) =>
        updateTrackedTickerPrice(ticker.Symbol, newPrice)
      );
    }
  }
}

watch(
  () => trackedTickers.value.length,
  () => {
    setItemInStorage("trackedTickers", JSON.stringify(trackedTickers.value));
  }
);

function createTrackedTicker(ticker: TickerFromApiResponse): void {
  const newTicker = {
    ...ticker,
    price: -1,
  };
  trackedTickers.value = [...trackedTickers.value, newTicker];
  subscribeToTicker(newTicker.Symbol, (newPrice: number) =>
    updateTrackedTickerPrice(newTicker.Symbol, newPrice)
  );
}

function updateTrackedTickerPrice(tickerSymbol: string, price: number) {
  const foundTicker = trackedTickers.value.find(
    (ticker: TickerTracked) => tickerSymbol === ticker.Symbol
  );
  if (foundTicker) {
    foundTicker.price = price;
  }
}

function deleteTrackedTicker(tickerSymbol: string): void {
  unsubscribeFromTicker(tickerSymbol);
  trackedTickers.value = trackedTickers.value.filter(
    (ticker: TickerTracked) => ticker.Symbol !== tickerSymbol
  );
}

onMounted(() => {
  loadAllTickers();
  setTrackedTickerFromStorage();
});
</script>

<template>
  <TickersLoading v-if="isLoadingTickersFromApi" />
  <TickersLoadingError v-else-if="allTickers === null" />

  <div v-else class="container max-w-2xl px-3 mx-auto">
    <AddTrackedTicker :all-tickers="allTickers" @create="createTrackedTicker" />

    <div class="mt-3 flex flex-col-reverse gap-3">
      <div
        v-for="ticker in trackedTickers"
        :key="ticker.Symbol"
        class="w-full p-4 relative flex gap-3 items-center border rounded-md transition-colors hover:bg-gray-50"
        :class="!ticker.price ? 'border-red-400 bg-red-50' : 'border-gray-300'"
      >
        <img
          :src="`https://www.cryptocompare.com${ticker.ImageUrl}?width=25`"
          :alt="ticker.FullName"
        />

        <div class="flex flex-wrap gap-3 flex-1 items-center">
          <div class="w-1/3">
            <div class="text-xl font-bold">
              {{ ticker.FullName }}
            </div>
          </div>

          <div class="flex-1 pr-14 font-bold text-lg">
            <div v-if="ticker.price === -1">Загрузка данных о цене...</div>
            <div v-else-if="!ticker.price" class="text-center">
              Нет данных о цене...
            </div>
            <div
              v-else
              class="py-1 flex items-center justify-center gap-1 bg-white rounded-md border-gray-200 border"
            >
              <svg
                class="h-5 w-5 text-black"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                stroke-width="2"
                stroke="currentColor"
                fill="none"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <path stroke="none" d="M0 0h24v24H0z" />
                <path
                  d="M16.7 8a3 3 0 0 0 -2.7 -2h-4a3 3 0 0 0 0 6h4a3 3 0 0 1 0 6h-4a3 3 0 0 1 -2.7 -2"
                />
                <path d="M12 3v3m0 12v3" />
              </svg>
              {{ ticker.price }}
            </div>
          </div>

          <!--<div class="pr-14 pl-4">
            <div class="mb-3 font-bold text-sm text-center">
              График за 7 дней:
            </div>
            <img
              :src="`https://images.cryptocompare.com/sparkchart/${ticker.Symbol}/USD/latest.png?ts=1674663600`"
              :alt="`График цены за 7 дней по тикуру ${ticker.Symbol}`"
            />
          </div>-->

          <button
            class="absolute right-0 top-0 h-full w-14 flex justify-center items-center transition-colors bg-red-400 hover:bg-red-600"
            @click="deleteTrackedTicker(ticker.Symbol)"
          >
            <svg
              class="h-8 w-8 text-white"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <polyline points="3 6 5 6 21 6" />
              <path
                d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"
              />
              <line x1="10" y1="11" x2="10" y2="17" />
              <line x1="14" y1="11" x2="14" y2="17" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
