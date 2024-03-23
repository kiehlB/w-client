import {forwardRef} from "@w/system";

import { UseButtonProps, useButton } from "./use-button";

export interface ButtonProps extends UseButtonProps {}

const Button = forwardRef<"div", ButtonProps>((props, ref) => {
  const {Component, domRef, children, styles, ...otherProps} =  useButton({...props, ref});

  return (
    <Component ref={domRef} className={styles} {...otherProps}>
      {children}
    </Component>
  );
});

Button.displayName = "NextUI.Button";

export default Button;