import { CodegenConfig } from "@graphql-codegen/cli";
import dotenv from "dotenv";

dotenv.config();

const config: CodegenConfig = {
  schema: process.env.NEXT_PUBLIC_URQL_ENDPOINT_ROOTSTOCK || "https://api.studio.thegraph.com/query/46125/access-control-rootstock/version/latest",
  documents: ["src/**/*.ts?(x)"],
  ignoreNoDocuments: true, // for better experience with the watcher
  generates: {
    "./src/gql/": {
      preset: "client",
      plugins: [],
    },
  },
};

export default config;
