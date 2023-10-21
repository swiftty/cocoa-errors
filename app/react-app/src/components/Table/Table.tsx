import React from 'react';
import { Table as SystemTable, Text, TextInput, ScrollArea } from '@mantine/core';
import classes from './Table.module.css';

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
  const query = filterText.toLocaleLowerCase().trim();
  const rows = query.length > 0
    ? (data
      .filter((item) => item.domain.toLowerCase().includes(query))
      .flatMap((item) => (
        [...item.codes.map((row) => (
          <SystemTable.Tr key={row.name}>
            <SystemTable.Td>
              <div className={classes.domain}>{item.domain}</div>
              <div className={classes.domainSub}>in {item.module}.framework</div>
            </SystemTable.Td>
            <SystemTable.Td>
              <pre><span className={classes.pre}>{row.name}</span></pre>
            </SystemTable.Td>
            <SystemTable.Td>
              <div className={classes.code}>{row.value}</div>
              {row?.unspecified && <div className={classes.codeSub}>{'※ default value'}</div>}
              {row?.sameAs && <div className={classes.codeSub}>same as `{row.sameAs}`</div>}
            </SystemTable.Td>
            <SystemTable.Td>
              {row.swiftName && <pre><span className={classes.pre}>{row.swiftName}</span></pre>}
            </SystemTable.Td>
          </SystemTable.Tr>
        ))]
    )))
    : [];

  return (
    <ScrollArea>
      <SystemTable
         horizontalSpacing={'md'}
         verticalSpacing={'xs'}
         miw={700}
      >
        <SystemTable.Thead>
          <SystemTable.Tr>
            <SystemTable.Th>domain</SystemTable.Th>
            <SystemTable.Th>name</SystemTable.Th>
            <SystemTable.Th>code</SystemTable.Th>
            <SystemTable.Th>swift maybe?</SystemTable.Th>
          </SystemTable.Tr>
        </SystemTable.Thead>

        <SystemTable.Tbody>
          {rows.length > 0 ? (
            rows
          ) : (
            <SystemTable.Tr>
              <SystemTable.Td colSpan={4}></SystemTable.Td>
            </SystemTable.Tr>
          )}
        </SystemTable.Tbody>
      </SystemTable>
    </ScrollArea>
  )
}

export default Table;
