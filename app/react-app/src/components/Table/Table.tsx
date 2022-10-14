import React from 'react';
import errors from '../../errors.json';
import useStyles from './Table.styles';
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
  filterText: string;
}

function Table({ data, filterText }: TableProps) {
  const { classes, cx } = useStyles();

  const query = filterText.toLocaleLowerCase().trim();
  const rows = query.length > 0 
    ? (data
      .filter((item) => item.domain.toLowerCase().includes(query))
      .flatMap((item) => (
        [...item.codes.map((row) => (
          <tr key={row.name}>
            <td>
              <div className={classes.domain}>{item.domain}</div>
              <div className={classes.domainSub}>in {item.module}.framework</div>
            </td>
            <td><pre><span className={classes.pre}>{row.name}</span></pre></td>
            <td>
              <div className={classes.code}>{row.value}</div>
              {row?.unspecified && <div className={classes.codeSub}>{'※ default value'}</div>}
              {row?.sameAs && <div className={classes.codeSub}>same as `{row.sameAs}`</div>}
            </td>
            <td>
              {row.swiftName && <pre><span className={classes.pre}>{row.swiftName}</span></pre>}
            </td>
          </tr>
        ))]
    ))) 
    : [];

  return (
    <ScrollArea>
      <SystemTable
         horizontalSpacing={'md'}
         verticalSpacing={'xs'}
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
              </td>
            </tr>
          )}
        </tbody>
      </SystemTable>
    </ScrollArea>
  )
}

export default Table;
