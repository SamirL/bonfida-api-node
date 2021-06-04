# Bonfida Node.js Library

A simple api wrapper for Bonfida Serum

## Installation

    npm install bonfida-api

## Usage

```javascript
const Bonfida = require("bonfida-api");

const api = new Bonfida();

(async () => {
  console.log(await api.getOrderBook("ETHUSDT"));
})();
```

## Api Documentation

https://docs.bonfida.com/#get-historical-prices
