module.exports = {
  stories: ["../stories/**/*.tsx"],
  webpackFinal: async config => {
    config.module.rules.push({
      test: /\.(ts|tsx)$/,
      use: [
        {
          loader: require.resolve("ts-loader"),
        },
      ],
    })
    config.resolve.extensions.push(".tsx")
    return config
  },
}
