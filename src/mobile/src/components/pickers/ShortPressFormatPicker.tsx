import React from 'react';

import { strings } from '../../locales';

import { ReadingFormat } from '~/api';
import {
  ChildlessViewProps,
  SelectOption,
  TablePicker,
} from '~/components';
import { StorageContext } from '~/core';

type Props = ChildlessViewProps;

const OPTIONS: SelectOption<ReadingFormat>[] = [{
  label: strings.summary_shortSummary, 
  value: ReadingFormat.ShortSummary,
}, {
  label: strings.summary_bullets,
  value: ReadingFormat.Bullets,
}];

export function ShortPressFormatPicker({ ...props }: Props = {}) {
  const { preferredShortPressFormat, setStoredValue } = React.useContext(StorageContext);
  return (
    <TablePicker
      { ...props }
      options={ OPTIONS }
      initialValue={ preferredShortPressFormat ?? ReadingFormat.Bullets }
      onValueChange={ (value) => {
        setStoredValue('preferredShortPressFormat', value); 
      } }>
    </TablePicker>
  );
}
