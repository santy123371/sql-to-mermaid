export interface ColumnInfo {
  name: string;
  type: string;
  isPk?: boolean;
  isFk?: boolean;
  isNullable?: boolean;
  isUnique?: boolean;
}

export interface ForeignKeyInfo {
  column: string;
  referencedTable: string;
  referencedColumn: string;
  cardinality?: '1:1' | '1:*';
}

export interface TableInfo {
  name: string;
  className: string;
  columns: ColumnInfo[];
  foreignKeys: ForeignKeyInfo[];
}

export interface ParserOptions {
  includeMethods?: boolean;
  direction?: 'TB' | 'LR' | 'RL' | 'BT';
  pascalCase?: boolean;
  diagramType?: 'classDiagram' | 'erDiagram';
}

export interface ParserStats {
  tablesCount: number;
  columnsCount: number;
  relationsCount: number;
}

// Security: Sanitize identifiers to prevent Mermaid injection / XSS
function sanitizeIdentifier(str: string): string {
  return str
    .replace(/[<>'"`;\\{}()]/g, '')
    .trim();
}

function toPascalCase(str: string): string {
  const clean = sanitizeIdentifier(str);
  return clean
    .replace(/[_-]+/g, ' ')
    .replace(/(?:^\w|[A-Z]|\b\w)/g, (letter) => letter.toUpperCase())
    .replace(/\s+/g, '');
}

function mapSqlType(sqlType: string): string {
  const t = sqlType.toLowerCase();
  if (t.includes('int') || t.includes('serial')) return 'int';
  if (t.includes('char') || t.includes('text') || t.includes('enum') || t.includes('uuid')) return 'string';
  if (t.includes('dec') || t.includes('float') || t.includes('double') || t.includes('numeric')) return 'decimal';
  if (t.includes('bool') || t.includes('tinyint(1)')) return 'bool';
  if (t.includes('date') || t.includes('time') || t.includes('year')) return 'datetime';
  if (t.includes('json') || t.includes('blob') || t.includes('binary')) return 'json';
  return 'string';
}

export function parseSqlSchema(sqlContent: string, options: ParserOptions = {}): {
  tables: TableInfo[];
  mermaidCode: string;
  stats: ParserStats;
} {
  const {
    includeMethods = true,
    direction = 'TB',
    pascalCase = true,
    diagramType = 'classDiagram'
  } = options;

  const tables: TableInfo[] = [];

  // 1. Basic sanitization (comments, null bytes, script tags)
  let cleaned = sqlContent
    .replace(/\0/g, '')
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/--.*$/gm, '')
    .replace(/#.*$/gm, '');

  // 2. Intelligent DML Filter: Ignore data insertions, updates, drops and session variables
  // This allows processing full database dumps (.sql) without choking on data rows
  cleaned = cleaned
    .replace(/INSERT\s+(?:IGNORE\s+|OR\s+IGNORE\s+)?INTO[\s\S]*?;/gi, '')
    .replace(/REPLACE\s+INTO[\s\S]*?;/gi, '')
    .replace(/UPDATE\s+[\s\S]*?;/gi, '')
    .replace(/DELETE\s+FROM[\s\S]*?;/gi, '')
    .replace(/DROP\s+TABLE[\s\S]*?;/gi, '')
    .replace(/LOCK\s+TABLES[\s\S]*?;/gi, '')
    .replace(/UNLOCK\s+TABLES;?/gi, '')
    .replace(/SET\s+[^;]+;/gi, '')
    .replace(/USE\s+[^;]+;/gi, '');

  // 3. Regex to match CREATE TABLE statements
  const createTableRegex = /CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?(?:[`"\[]?(\w+)[`"\]]?\.)?[`"\[]?(\w+)[`"\]]?\s*\(([\s\S]*?)\)(?:\s*ENGINE\s*=\s*\w+)?(?:\s*DEFAULT\s+CHARSET\s*=\s*\w+)?(?:\s*COLLATE\s*=\s*\w+)?\s*;/gi;

  let match: RegExpExecArray | null;
  while ((match = createTableRegex.exec(cleaned)) !== null) {
    const rawTableName = sanitizeIdentifier(match[2] || match[1]);
    const body = match[3];

    if (!rawTableName) continue;

    const className = pascalCase ? toPascalCase(rawTableName) : rawTableName;
    const columns: ColumnInfo[] = [];
    const foreignKeys: ForeignKeyInfo[] = [];
    const pkColumns = new Set<string>();
    const uniqueColumns = new Set<string>();

    const lines = body.split('\n');

    for (let line of lines) {
      line = line.trim();
      if (!line) continue;

      // Check for standalone PRIMARY KEY (col1, col2)
      const pkMatch = line.match(/^PRIMARY\s+KEY\s*\(([^)]+)\)/i);
      if (pkMatch) {
        const pks = pkMatch[1].split(',').map((c) => sanitizeIdentifier(c.trim().replace(/[`"\[\]]/g, '')));
        pks.forEach((p) => pkColumns.add(p));
        continue;
      }

      // Check for standalone UNIQUE constraints: UNIQUE (col), UNIQUE KEY [name] (col), CONSTRAINT [name] UNIQUE (col)
      const uqMatch = line.match(/^(?:CONSTRAINT\s+[`"\[]?\w+[`"\]]?\s+)?UNIQUE(?:\s+(?:KEY|INDEX)(?:\s+[`"\[]?\w+[`"\]]?)?)?\s*\(([^)]+)\)/i);
      if (uqMatch) {
        const uqs = uqMatch[1].split(',').map((c) => sanitizeIdentifier(c.trim().replace(/[`"\[\]]/g, '')));
        if (uqs.length === 1) {
          uniqueColumns.add(uqs[0]);
        }
        continue;
      }

      // Check for FOREIGN KEY constraints
      const fkMatch = line.match(/(?:CONSTRAINT\s+[`"\[]?\w+[`"\]]?\s+)?FOREIGN\s+KEY\s*\([`"\[]?(\w+)[`"\]]?\)\s*REFERENCES\s*(?:[`"\[]?\w+[`"\]]?\.)?[`"\[]?(\w+)[`"\]]?\s*\([`"\[]?(\w+)[`"\]]?\)/i);
      if (fkMatch) {
        foreignKeys.push({
          column: sanitizeIdentifier(fkMatch[1]),
          referencedTable: sanitizeIdentifier(fkMatch[2]),
          referencedColumn: sanitizeIdentifier(fkMatch[3])
        });
        continue;
      }

      // Ignore generic indexes/keys
      if (/^(?:CONSTRAINT\s+[`"\[]?\w+[`"\]]?\s+)?(?:KEY|INDEX)\s+/i.test(line)) {
        continue;
      }

      // Parse column definition
      const colMatch = line.match(/^[`"\[]?(\w+)[`"\]]?\s+([A-Za-z]+(?:\([^\)]+\))?)/);
      if (colMatch) {
        const colName = sanitizeIdentifier(colMatch[1]);
        const rawType = colMatch[2];
        const isPk = /PRIMARY\s+KEY/i.test(line) || pkColumns.has(colName);
        const isUnique = /\bUNIQUE\b/i.test(line) || uniqueColumns.has(colName);

        // Check for inline REFERENCES
        const inlineFkMatch = line.match(/REFERENCES\s*(?:[`"\[]?\w+[`"\]]?\.)?[`"\[]?(\w+)[`"\]]?\s*\([`"\[]?(\w+)[`"\]]?\)/i);
        if (inlineFkMatch && !/FOREIGN\s+KEY/i.test(line)) {
          foreignKeys.push({
            column: colName,
            referencedTable: sanitizeIdentifier(inlineFkMatch[1]),
            referencedColumn: sanitizeIdentifier(inlineFkMatch[2]),
          });
        }

        if (colName) {
          columns.push({
            name: colName,
            type: mapSqlType(rawType),
            isPk,
            isUnique,
            isNullable: !/NOT\s+NULL/i.test(line)
          });
        }
      }
    }

    columns.forEach((col) => {
      if (pkColumns.has(col.name)) {
        col.isPk = true;
      }
      if (uniqueColumns.has(col.name)) {
        col.isUnique = true;
      }
    });

    tables.push({
      name: rawTableName,
      className,
      columns,
      foreignKeys
    });
  }

  // Also check for standalone ALTER TABLE ... ADD CONSTRAINT ... FOREIGN KEY
  const alterFkRegex = /ALTER\s+TABLE\s+(?:[`"\[]?\w+[`"\]]?\.)?[`"\[]?(\w+)[`"\]]?\s+ADD\s+(?:CONSTRAINT\s+[`"\[]?\w+[`"\]]?\s+)?FOREIGN\s+KEY\s*\([`"\[]?(\w+)[`"\]]?\)\s*REFERENCES\s*(?:[`"\[]?\w+[`"\]]?\.)?[`"\[]?(\w+)[`"\]]?\s*\([`"\[]?(\w+)[`"\]]?\)/gi;
  let alterMatch: RegExpExecArray | null;
  while ((alterMatch = alterFkRegex.exec(cleaned)) !== null) {
    const fromTable = sanitizeIdentifier(alterMatch[1]);
    const fromCol = sanitizeIdentifier(alterMatch[2]);
    const toTable = sanitizeIdentifier(alterMatch[3]);
    const toCol = sanitizeIdentifier(alterMatch[4]);

    const targetTable = tables.find((t) => t.name.toLowerCase() === fromTable.toLowerCase());
    if (targetTable) {
      targetTable.foreignKeys.push({
        column: fromCol,
        referencedTable: toTable,
        referencedColumn: toCol
      });
    }
  }

  // Finalize column isFk and foreign key cardinalities (1:1 vs 1:*)
  for (const table of tables) {
    for (const fk of table.foreignKeys) {
      const col = table.columns.find((c) => c.name.toLowerCase() === fk.column.toLowerCase());
      if (col) {
        col.isFk = true;
      }
      // If the FK column in this child table is marked UNIQUE or is the PRIMARY KEY, it's a 1:1 relation
      const isOneToOne = col ? Boolean(col.isPk || col.isUnique) : false;
      fk.cardinality = isOneToOne ? '1:1' : '1:*';
    }
  }

  // Calculate Statistics
  let totalColumns = 0;
  let totalRelations = 0;

  // Generate Mermaid Code
  let mermaidCode = '';

  if (diagramType === 'classDiagram') {
    mermaidCode += `classDiagram\n    direction ${direction}\n\n`;

    for (const table of tables) {
      mermaidCode += `    class ${table.className} {\n`;
      for (const col of table.columns) {
        totalColumns++;
        const pkPrefix = col.isPk ? '*' : '';
        mermaidCode += `        +${col.type} ${col.name}${pkPrefix}\n`;
      }
      if (includeMethods) {
        mermaidCode += `        +registrar()\n`;
        mermaidCode += `        +actualizar()\n`;
        mermaidCode += `        +consultar()\n`;
        const hasActive = table.columns.some((c) => c.name.startsWith('act_') || c.name.includes('activo'));
        if (hasActive || table.name.includes('usu') || table.name.includes('org')) {
          mermaidCode += `        +deshabilitar()\n`;
        } else {
          mermaidCode += `        +eliminar()\n`;
        }
      }
      mermaidCode += `    }\n\n`;
    }

    const seenRels = new Set<string>();
    for (const table of tables) {
      for (const fk of table.foreignKeys) {
        const parentTable = tables.find((t) => t.name.toLowerCase() === fk.referencedTable.toLowerCase());
        const parentName = parentTable ? parentTable.className : (pascalCase ? toPascalCase(fk.referencedTable) : fk.referencedTable);
        const relKey = `${parentName}_${table.className}_${fk.column}`;

        if (!seenRels.has(relKey)) {
          seenRels.add(relKey);
          totalRelations++;
          const isOneToOne = fk.cardinality === '1:1';
          const childCardinality = isOneToOne ? '1' : '*';
          mermaidCode += `    ${parentName} "1" --> "${childCardinality}" ${table.className} : tiene\n`;
        }
      }
    }
  } else {
    mermaidCode += `erDiagram\n    direction ${direction}\n\n`;

    for (const table of tables) {
      mermaidCode += `    ${table.className} {\n`;
      for (const col of table.columns) {
        totalColumns++;
        const pkLabel = col.isPk ? 'PK' : (col.isFk ? 'FK' : '');
        mermaidCode += `        ${col.type} ${col.name} ${pkLabel}\n`;
      }
      mermaidCode += `    }\n\n`;
    }

    const seenRels = new Set<string>();
    for (const table of tables) {
      for (const fk of table.foreignKeys) {
        const parentTable = tables.find((t) => t.name.toLowerCase() === fk.referencedTable.toLowerCase());
        const parentName = parentTable ? parentTable.className : (pascalCase ? toPascalCase(fk.referencedTable) : fk.referencedTable);
        const relKey = `${parentName}_${table.className}_${fk.column}`;

        if (!seenRels.has(relKey)) {
          seenRels.add(relKey);
          totalRelations++;
          const colInfo = table.columns.find((c) => c.name.toLowerCase() === fk.column.toLowerCase());
          const isOneToOne = fk.cardinality === '1:1';

          if (isOneToOne) {
            const relSymbol = colInfo?.isNullable ? '||--o|' : '||--||';
            mermaidCode += `    ${parentName} ${relSymbol} ${table.className} : "relaciona"\n`;
          } else {
            const relSymbol = colInfo?.isNullable ? '||--o{' : '||--|{';
            mermaidCode += `    ${parentName} ${relSymbol} ${table.className} : "relaciona"\n`;
          }
        }
      }
    }
  }

  return {
    tables,
    mermaidCode,
    stats: {
      tablesCount: tables.length,
      columnsCount: totalColumns,
      relationsCount: totalRelations,
    }
  };
}
