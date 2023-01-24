import webpack from "webpack"
require("dotenv").config()

module.exports = {
  module: {
    rules: [
      {
        test: /\.s[ac]ss$/i,
        use: [
          "style-loader",
          "css-loader",
          {
            loader: "sass-loader",
            options: {
              implementation: require("sass"),
            },
          },
        ],
      },
    ],
  },
  plugins: [
    new webpack.DefinePlugin({
      "process.env": {
        REACT_APP_API_KEY: JSON.stringify(process.env.REACT_APP_API_KEY),
        REACT_APP_ENDPOINT_URL: JSON.stringify(
          process.env.REACT_APP_ENDPOINT_URL
        ),
        REACT_APP_CORS_ORIGIN: JSON.stringify(
          process.env.REACT_APP_CORS_ORIGIN
        ),
      },
    }),
  ],
}
