export interface TickerFromApiResponse {
  Id: number;
  ImageUrl: string;
  Symbol: string;
  FullName: string;
}

export interface TickerTracked extends TickerFromApiResponse {
  price: number;
}
