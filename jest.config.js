module.exports = {
    moduleNameMapper: {
      "\\.(css|less|scss|sass)$": "identity-obj-proxy",
      "axios": "axios/dist/node/axios.cjs"
    },
    transformIgnorePatterns: [
      "node_modules/(?!(axios|react-toastify)/)"
    ],
    testEnvironment: "jsdom"
  };