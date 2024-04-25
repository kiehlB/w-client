import React, { ReactElement } from 'react';
import Icon, { IconProps } from '../../icon';
import OutlinedIcon from './outlined.svg';
import FilledIcon from './filled.svg';

export const MiniCloseIcon = (props: IconProps): ReactElement => (
  <Icon {...props} IconPrimary={OutlinedIcon} IconSecondary={FilledIcon} />
);
