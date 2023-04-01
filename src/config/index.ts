import { extendTheme } from "@chakra-ui/react";

import { checkboxTheme } from "./checkbox";

const theme = extendTheme({
  components: {
    Checkbox: checkboxTheme,
  },
});

export default theme;
