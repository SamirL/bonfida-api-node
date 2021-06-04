const axios = require("axios");
const crypto = require("crypto");
const querystring = require("querystring");
const assert = require("assert");
const _ = require("lodash");

const ERROR_ENUM = {
  429: "Too many requests",
};

class Bonfida {
  constructor() {
    this.endPoint = "https://serum-api.bonfida.com";
  }

  /**
   * Assert if the arguments are set and if the first one is an object
   * @param {array} params The arguments array passed to a funciton
   */
  assertParams(params) {
    assert(params.length > 0, "Missing parameter");
    assert(typeof params[0] === "object", "The parameter must be an object");
  }

  /**
   * Create a Query Object for querystring.stringify
   * @param {object} object
   */
  createQueryObject(object) {
    const queryObject = {};

    for (const [key, value] of Object.entries(object)) {
      if (!_.isUndefined(value) && !_.isNull(value)) {
        queryObject[key] = value;
      }
    }

    return queryObject;
  }

  /**
   * Make the HTTP request
   * @param {string} method
   * @param {string} path
   * @param {object} body
   */
  async makeRequest(method, path, body = {}) {
    try {
      const normalizedPath = this.endPoint + path;
      console.log(normalizedPath);
      const response = await axios({
        method,
        url: normalizedPath,
        body,
      });

      if (Number(response.status) === 429) {
        throw new Error(ERROR_ENUM[Number(response.status)]);
      }

      return response.data;
    } catch (error) {
      throw new Error(error.message);
    }
  }

  /**
   * Sign the request
   * NOTE: currently unused
   * @param {string} method
   * @param {string} path
   * @param {object} body
   */
  signRequest(method, path, body = null) {
    return true;
  }

  /**
   * List all supported pairs
   */
  getPairs() {
    return this.makeRequest("GET", "/pairs");
  }

  /**
   * Provides a list of all market fills from the last 24 hours on the Serum DEX.
   * @param {string} marketName - The name of the market you want to retrieve data from
   */
  getRecentTradesByMarketName(marketName) {
    return this.makeRequest("GET", "/trades/" + marketName);
  }

  /**
   * Provides a list of all market fills from the last 24 hours on the Serum DEX.
   * @param {string} marketAddress - The market address you want to retrieve data from
   */
  getRecentTradesByMarketAddress(marketAddress) {
    return this.makeRequest("GET", "/trades/" + marketAddress);
  }

  /**
   * Provides a list of all market fills from the last 24 hours on the Serum DEX.
   */
  getAllRecentTrades() {
    return this.makeRequest("GET", "/trades/all/recent");
  }

  /**
   * Provides a view of rolling 24 hour volume on the Serum DEX -
   * use ‘all’ as the market for an aggregate of traded volume across all markets.
   * @param {string} [marketName = all] - The name of the market you want to retrieve data from
   */
  getVolume(marketName = "all") {
    return this.makeRequest("GET", "/volumes/" + marketName);
  }

  /**
   * Provides the current orderbook of the market.
   * @param {string} marketName - The name of the market you want to retrieve data from
   */
  getOrderBook(marketName) {
    return this.makeRequest("GET", "/orderbooks/" + marketName);
  }

  /**
   * Get Get historical prices
   * @param {object} object
   * @param {string} object.market_name - The name of the market you want to retrieve data from
   * @param {number} object.resolution - Window length in seconds. options: 60, 3600, 14400, 86400
   * @param {number} [object.limit = 1000] - optional
   * @param {number} [object.startTime] - optional
   * @param {number} [object.endTime] - optional
   */
  getHistoricalPrices({
    market_name,
    resolution,
    limit = 1000,
    start_time,
    end_time,
  }) {
    this.assertParams(arguments);
    assert(_.isString(market_name), "Market name must be a string");
    assert(_.isNumber(resolution), "Resolution must be a number");
    assert(_.isNumber(limit), "Limit must be a number");

    if (start_time) {
      assert(_.isNumber(start_time), "Start time must be a number");
    }

    if (end_time) {
      assert(_.isNumber(end_time), "End time must be a number");
    }

    let path = `/candles/${market_name}`;

    const queryObject = this.createQueryObject({
      resolution,
      limit,
      startTime: start_time,
      endTime: end_time,
    });

    path += `?${querystring.stringify(queryObject)}`;

    return this.makeRequest("GET", path);
  }
}

module.exports = Bonfida;
