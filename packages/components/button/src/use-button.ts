import type { ButtonVariantProps } from "@w/theme";

import {HTMLNextUIProps,mapPropsVariants} from "@w/system";
import { button } from "@w/theme";
import {ReactRef, useDOMRef} from "@w/react-utils";
import {useMemo} from "react";

interface Props extends HTMLNextUIProps<"div"> {
  /**
   * Ref to the DOM node.
   */
  ref?: ReactRef<HTMLElement | null>;
}

export type UseButtonProps = Props & ButtonVariantProps;

export function useButton(originalProps: UseButtonProps) {
  const [props, variantProps] = mapPropsVariants(originalProps, button.variantKeys);

  const {ref, as, className, ...otherProps} = props;

  const Component = as || "div";

  const domRef = useDOMRef(ref);

  const styles = useMemo(
  () =>
    button({
      ...variantProps,
      className,
    }),
  [...Object.values(variantProps), className],
);

  return {Component, styles, domRef, ...otherProps};
}

export type UseButtonReturn = ReturnType<typeof useButton>;