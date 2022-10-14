import React from 'react';
import errors from '../errors.json';
import { Table as SystemTable, Text, TextInput, ScrollArea } from '@mantine/core';

type ErrorItem = {
  domain: string;
  module: string;
  codes: {
    name: string;
    value: number | string;
    swiftName: string | undefined;
    sameAs?: string | undefined;
    unspecified?: true | undefined;
  }[];
};

type RowData = {
  domain: string;
  module: string;
} | ErrorItem['codes'][number];

interface TableProps {
  data: ErrorItem[];
}

function Table({ data }: TableProps) {
  const rows = data.flatMap((item) => (
    [...item.codes.map((row) => (
      <tr key={row.name}>
        <td>
          <p>{item.domain}</p>
          <p>in {item.module}.framework</p>
        </td>
        <td><pre>{row.name}</pre></td>
        <td>
          <p>{row.value}</p>
          {row?.unspecified && <p>{'※ default value'}</p>}
          {row?.sameAs && <p>same as `{row.sameAs}`</p>}
        </td>
        <td>
          {row.swiftName && <p><pre>{row.swiftName}</pre></p>}
        </td>
      </tr>
    ))]
  ))

  return (
    <ScrollArea>
      <SystemTable
         horizontalSpacing={'md'}
         verticalSpacing={'xs'}
         sx={{ tableLayout: 'fixed' }}
      >
        <thead>
          <tr>
            <th>domain</th>
            <th>
              name
            </th>
            <th>code</th>
            <th>swift maybe?</th>
          </tr>
        </thead>
        <tbody>
          {rows.length > 0 ? (
            rows
          ) : (
            <tr>
              <td colSpan={4}>
                <Text weight={500} align='center'>
                  Empty
                </Text>
              </td>
            </tr>
          )}
        </tbody>
      </SystemTable>
    </ScrollArea>
  )
}

export default Table;
