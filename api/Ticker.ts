type CallbackFunction = (newPrice: number) => void;

const RESPONSE_INDEX = {
  PRICE_UPDATE: "5",
  INVALID: "500",
};

const tickersHandlers = new Map();
const socket = new WebSocket(
  "wss://streamer.cryptocompare.com/v2?api_key=565d6aa108b50332b6078625ddb33057fb2cf846b6adb310ea17de8b1314e860"
);

socket.addEventListener("message", (e) => {
  const parsedSocketMessage = JSON.parse(e.data);

  const { TYPE: type } = parsedSocketMessage;
  const { PRICE: newPrice, FROMSYMBOL: tickerName } = parsedSocketMessage;

  switch (type) {
    case RESPONSE_INDEX.PRICE_UPDATE:
      /* if (newPrice === undefined) {
        return;
      }
      if (currency === RESERVE_CURSE_NAME) {
        newPrice *= RESERVE_CURSE_FROM_MAIN_CURSE;
      } */
      break;
    default:
      return false;
      break;
  }

  updatedTickerPrice(tickerName, newPrice);
});

function updatedTickerPrice(tickerName: string, newPrice: number) {
  const handlers = tickersHandlers.get(tickerName) ?? [];
  handlers.forEach((fn: CallbackFunction) => fn(newPrice));
}

interface IMessageSentViaWS {
  action: string;
  subs: Array<string>;
}
function sendToWebSocket(message: IMessageSentViaWS) {
  const stringifiedMessage = JSON.stringify(message);

  if (socket.readyState === WebSocket.OPEN) {
    socket.send(stringifiedMessage);
    return;
  }

  socket.addEventListener(
    "open",
    () => {
      socket.send(stringifiedMessage);
    },
    { once: true }
  );
}

function subscribeToTickerOnWs(tickerName: string) {
  sendToWebSocket({
    action: "SubAdd",
    subs: [`5~CCCAGG~${tickerName}~USD`],
  });
}

function unsubscribeFromTickerOnWs(
  tickerName: string,
) {
  sendToWebSocket({
    action: "SubRemove",
    subs: [`5~CCCAGG~${tickerName}~USD`],
  });
}

export const subscribeToTicker = (tickerName: string, cb: CallbackFunction) => {
  const subscribers = tickersHandlers.get(tickerName) || [];
  tickersHandlers.set(tickerName, [...subscribers, cb]);
  subscribeToTickerOnWs(tickerName);
};

export const unsubscribeFromTicker = (tickerName: string) => {
  tickersHandlers.delete(tickerName);
  unsubscribeFromTickerOnWs(tickerName);
};
