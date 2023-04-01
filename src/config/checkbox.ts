import { checkboxAnatomy } from "@chakra-ui/anatomy";
import { createMultiStyleConfigHelpers } from "@chakra-ui/react";

const { definePartsStyle, defineMultiStyleConfig } = createMultiStyleConfigHelpers(
  checkboxAnatomy.keys
);

const baseStyle = definePartsStyle({
  control: {
    borderWidth: "1px",
    _checked: {
      bg: "green",
      borderColor: "green",
      _hover: {
        bg: "green",
        borderColor: "green",
      },
    },
  },
});

export const checkboxTheme = defineMultiStyleConfig({ baseStyle });
