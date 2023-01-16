module.exports = {
  root: true,
  parserOptions: {
    sourceType: "module",
    requireConfigFile: false, // Не обязательно наличие babel.config.js
  },
  extends: ["@nuxtjs/eslint-config-typescript"],
  rules: {
    quotes: ["error", "double", { avoidEscape: true }], // Кавычки
    "space-before-function-paren": ["error", "never"], // Пробел после названия функции
    "comma-dangle": "off", // Запятые после последнего элемента объекта/массива
    semi: "off", // Точки с запятыми в конце объектов
  },
};
