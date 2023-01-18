<script setup lang="ts">
import { Ref } from "vue";
import { TickerFromApiResponse, TickerTracked } from "@/types";
import { subscribeToTicker, unsubscribeFromTicker } from "@/api/Ticker";

// IMG LINK
// https://www.cryptocompare.com/media/34836095/433.png?width=25
// https://min-api.cryptocompare.com/documentation?key=Toplists&cat=TopTotalVolumeEndpointFull
// https://www.cryptocompare.com

const trackedTickers: Ref<TickerTracked[]> = ref([]);

function createTrackedTicker(ticker: TickerFromApiResponse): void {
  const newTicker = {
    ...ticker,
    price: -1
  }
  trackedTickers.value = [...trackedTickers.value, newTicker];
  subscribeToTicker(newTicker.Symbol, (newPrice: number) => updateTrackedTickerPrice(newTicker.Symbol, newPrice));
}

function updateTrackedTickerPrice(tickerSymbol: string, price: number) {
  const foundTicker = trackedTickers.value.find(ticker => tickerSymbol === ticker.Symbol);
  if (foundTicker) {
    foundTicker.price = price;
  }
}

function deleteTrackedTicker(tickerSymbol: string): void {
  unsubscribeFromTicker(tickerSymbol);
  trackedTickers.value = trackedTickers.value.filter(ticker =>
    ticker.Symbol !== tickerSymbol
  );
}
</script>

<template>
  <div class="container max-w-5xl px-3 mx-auto">
    <AddTrackedTicker @create="createTrackedTicker" />
    <div class="mt-3 flex flex-col-reverse gap-3">
      <div v-for="ticker in trackedTickers" :key="ticker.Symbol" class="w-full p-4 flex gap-3 items-center border border-gray-300">
        <img :src="`https://www.cryptocompare.com${ticker.ImageUrl}?width=25`" :alt="ticker.FullName">
        <div class="flex-1">
          <div>{{ ticker.FullName }}</div>
          <div v-if="ticker.price === -1">
            Загрузка данных о цене...
          </div>
          <div v-else-if="!ticker.price">
            Нет данных о цене...
          </div>
          <div v-else>
            {{ ticker.price }}
          </div>
        </div>
        <button @click="deleteTrackedTicker(ticker.Symbol)">
          Удалить
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
