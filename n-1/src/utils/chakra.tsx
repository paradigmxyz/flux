import { useState, useEffect } from "react";
import { Flex, FlexProps } from "@chakra-ui/react";

/* Typings */
export type MainAxisAlignmentStrings =
  | "space-between"
  | "space-around"
  | "flex-start"
  | "center"
  | "flex-end";

export type MainAxisAlignment =
  | MainAxisAlignmentStrings
  | { md: MainAxisAlignmentStrings; base: MainAxisAlignmentStrings };

export type CrossAxisAlignmentStrings = "flex-start" | "center" | "flex-end" | "stretch";

export type CrossAxisAlignment =
  | CrossAxisAlignmentStrings
  | {
      md: CrossAxisAlignmentStrings;
      base: CrossAxisAlignmentStrings;
    };

export class PixelMeasurement {
  size: number;

  constructor(num: number) {
    this.size = num;
  }

  asPxString(): string {
    return this.size + "px";
  }

  toString(): string {
    return this.asPxString();
  }

  asNumber(): number {
    return this.size;
  }
}

export class PercentageSize {
  percent: number;

  constructor(num: number) {
    if (num > 1) {
      throw new Error("Cannot have a percentage higher than 1!");
    }

    this.percent = num;
  }
}

export class PercentOnDesktopPixelOnMobileSize {
  percent: number;
  pixel: number;

  constructor({
    percentageSize,
    pixelSize,
  }: {
    percentageSize: number;
    pixelSize: number;
  }) {
    if (percentageSize > 1) {
      throw new Error("Cannot have a percentage higher than 1!");
    }

    this.percent = percentageSize;
    this.pixel = pixelSize;
  }
}

export class PixelSize {
  pixel: number;

  constructor(num: number) {
    this.pixel = num;
  }
}

export class ResponsivePixelSize {
  desktop: number;
  mobile: number;

  constructor({ desktop, mobile }: { desktop: number; mobile: number }) {
    this.mobile = mobile;
    this.desktop = desktop;
  }
}

/**************************************
 *
 *
 *  Components
 *    - Center.tsx
 *    - Column.tsx
 *    - Row.tsx
 *    - RowOnDesktopColumnOnMobile.tsx
 *    - RowOrColumn.tsx
 *
 ***************************************
 */

/**
 *  Center.tsx
 *
 *  Creates a Flex where `justifyContent === 'center'` and `alignItems === 'center'`
 * If `expand === true` it will set the height and width of the Flex to 100%.
 * Passes all extra props to the Flex.
 */

export type CenterProps = {
  children: React.ReactNode;
  expand?: boolean;
} & FlexProps;

export const Center = ({ children, expand, ...others }: CenterProps) => {
  if (expand) {
    others.height = "100%";
    others.width = "100%";
  }

  return (
    <Flex justifyContent="center" alignItems="center" {...others}>
      {children}
    </Flex>
  );
};

/**
 * Column.tsx
 *
 * Creates a Flex with a column direction
 * and sets the `justifyContent` to the `mainAxisAlignment`
 * and the `alignItems` to the `crossAxisAlignment`.
 * If `expand === true` it will set the height and width of the Flex to 100%.
 * Passes all extra props to the Flex.
 */

export type ColumnProps = {
  mainAxisAlignment: MainAxisAlignment;
  crossAxisAlignment: CrossAxisAlignment;
  children: React.ReactNode;
  expand?: boolean;
} & FlexProps;

export const Column = ({
  mainAxisAlignment,
  crossAxisAlignment,
  children,
  expand,
  ...others
}: ColumnProps) => {
  if (expand) {
    others.height = "100%";
    others.width = "100%";
  }

  return (
    <Flex
      flexDirection="column"
      justifyContent={mainAxisAlignment}
      alignItems={crossAxisAlignment}
      {...others}
    >
      {children}
    </Flex>
  );
};

/**
 * Row.tsx
 *
 * Creates a Flex with a row direction
 * and sets the `justifyContent` to the `mainAxisAlignment`
 * and the `alignItems` to the `crossAxisAlignment`.
 * If `expand === true` it will set the height and width of the Flex to 100%.
 * Passes all extra props to the Flex.
 */

export type RowProps = {
  mainAxisAlignment: MainAxisAlignment;
  crossAxisAlignment: CrossAxisAlignment;
  children: React.ReactNode;
  expand?: boolean;
} & FlexProps;

export const Row = ({
  mainAxisAlignment,
  crossAxisAlignment,
  children,
  expand,
  ...others
}: RowProps) => {
  if (expand) {
    others.height = "100%";
    others.width = "100%";
  }

  return (
    <Flex
      flexDirection="row"
      justifyContent={mainAxisAlignment}
      alignItems={crossAxisAlignment}
      {...others}
    >
      {children}
    </Flex>
  );
};

/**
 *  RowOnDesktopColumnOnMobile.tsx
 *
 * Creates a Flex with a row direction on desktop and a column direction on mobile.
 * and sets the `justifyContent` to the `mainAxisAlignment`
 * and the `alignItems` to the `crossAxisAlignment`.
 * If `expand === true` it will set the height and width of the Flex to 100%.
 * Passes all extra props to the Flex.
 */
export const RowOnDesktopColumnOnMobile = ({
  mainAxisAlignment,
  crossAxisAlignment,
  children,
  expand,
  ...others
}: RowProps) => {
  if (expand) {
    others.height = "100%";
    others.width = "100%";
  }

  return (
    <Flex
      flexDirection={{ md: "row", base: "column" }}
      justifyContent={mainAxisAlignment}
      alignItems={crossAxisAlignment}
      {...others}
    >
      {children}
    </Flex>
  );
};

/**
 * RowOrColumn.tsx
 *
 * Creates a Flex which will be a row if `isRow` is true
 * and sets the `justifyContent` to the `mainAxisAlignment`
 * and the `alignItems` to the `crossAxisAlignment`.
 * If `expand === true` it will set the height and width of the Flex to 100%.
 * Passes all extra props to the Flex.
 */
export const RowOrColumn = ({
  mainAxisAlignment,
  crossAxisAlignment,
  children,
  expand,
  isRow,
  ...others
}: RowProps & { isRow: boolean }) => {
  if (expand) {
    others.height = "100%";
    others.width = "100%";
  }

  return (
    <Flex
      flexDirection={isRow ? "row" : "column"}
      justifyContent={mainAxisAlignment}
      alignItems={crossAxisAlignment}
      {...others}
    >
      {children}
    </Flex>
  );
};

/**************************************
 *
 *
 *  Hooks
 *    - useWindowSize.ts
 *    - useLockedViewHeight.ts
 *    - useIsMobile.ts
 *    - useSpacedLayout.ts
 *
 ***************************************
 */

/**
 * useWindowSize.ts
 *
 * Gets the height and width of the current window.
 */
export const useWindowSize = () => {
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  useEffect(() => {
    // Handler to call on window resize
    function handleResize() {
      // Set window width/height to state
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    }

    // Add event listener
    window.addEventListener("resize", handleResize);

    // Call handler right away so state gets updated with initial window size
    handleResize();

    // Remove event listener on cleanup
    return () => window.removeEventListener("resize", handleResize);
  }, []); // Empty array ensures that effect is only run on mount

  return windowSize;
};

/**
 * useLockedViewHeight.ts
 *
 * Returns the pixel count of the height of the window,
 * but will not return a value lower or higher than the minimum/maximum passed.
 */
export function useLockedViewHeight({
  min = -1,
  max = Number.MAX_SAFE_INTEGER,
}: {
  min?: number;
  max?: number;
}) {
  const { height } = useWindowSize();

  if (height <= min) {
    return {
      windowHeight: new PixelMeasurement(min),
      isLocked: true,
    };
  } else if (height >= max) {
    return {
      windowHeight: new PixelMeasurement(max),
      isLocked: true,
    };
  } else {
    return {
      windowHeight: new PixelMeasurement(height),
      isLocked: false,
    };
  }
}

/**
 * useIsMobile.ts
 *
 * Returns whether the width of the window makes it likely a mobile device.
 * */
export function useIsMobile() {
  const { width } = useWindowSize();

  return width < 768;
}

/**
 * useSpacedLayout.ts
 *
 * Takes the height of the parent, the desired spacing between children,
 * and the desired percentage sizes of the children (relative to their parent minus the spacing desired and the size of fixed sized children)
 * or the size of the child in pixels
 * and returns the pixel size of each child
 * that makes that child conform to the desired percentage.
 */
export function useSpacedLayout({
  parentHeight,
  spacing,
  childSizes,
}: {
  parentHeight: number;
  spacing: number;
  childSizes: (
    | PercentageSize
    | PercentOnDesktopPixelOnMobileSize
    | PixelSize
    | ResponsivePixelSize
  )[];
}) {
  const isMobile = useIsMobile();

  let parentMinusSpacingAndFixedChildSizes =
    parentHeight -
    spacing * (childSizes.length - 1) -
    childSizes.reduce((past, value) => {
      if (
        value instanceof PixelSize ||
        (value instanceof PercentOnDesktopPixelOnMobileSize && isMobile)
      ) {
        return past + value.pixel;
      } else if (value instanceof ResponsivePixelSize) {
        return past + (isMobile ? value.mobile : value.desktop);
      } else {
        return past;
      }
    }, 0);

  let spacedChildren: PixelMeasurement[] = [];

  for (const size of childSizes) {
    if (
      size instanceof PercentageSize ||
      (size instanceof PercentOnDesktopPixelOnMobileSize && !isMobile)
    ) {
      spacedChildren.push(
        new PixelMeasurement(size.percent * parentMinusSpacingAndFixedChildSizes)
      );
    } else if (size instanceof PercentOnDesktopPixelOnMobileSize && isMobile) {
      spacedChildren.push(new PixelMeasurement(size.pixel));
    } else if (size instanceof ResponsivePixelSize) {
      spacedChildren.push(new PixelMeasurement(isMobile ? size.mobile : size.desktop));
    } else {
      spacedChildren.push(new PixelMeasurement(size.pixel));
    }
  }

  return {
    parentHeight: new PixelMeasurement(parentHeight),
    spacing: new PixelMeasurement(spacing),
    childSizes: spacedChildren,
  };
}
