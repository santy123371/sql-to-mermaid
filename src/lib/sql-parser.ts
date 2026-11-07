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

/**
 * Infers contextual, domain-specific UML methods based on the table's archetype,
 * column names, constraints, and relationships instead of static CRUD for every class.
 */
export function generateSmartMethods(table: TableInfo): string[] {
  const raw = table.name.toLowerCase().replace(/^(tbl_|cs_|cat_|t_)/, '');
  const cols = table.columns.map((c) => c.name.toLowerCase());

  const hasCol = (...names: string[]) => cols.some((c) => names.some((n) => c.includes(n)));

  // 1. Logs, History, and Audit (Append-only / Immutable tracking)
  if (
    raw.includes('audit') ||
    raw.includes('log') ||
    raw.includes('historial') ||
    raw.includes('history') ||
    raw.includes('evento') ||
    raw.includes('track')
  ) {
    return [
      '+registrarEvento()',
      '+consultarLogs()',
      '+filtrarPorFecha()',
      '+exportar()'
    ];
  }

  // 2. Pivot / Junction Tables (Roles-Permisos, Usuario-Rol, etc.)
  const pkCount = table.columns.filter((c) => c.isPk).length;
  const isJunctionTable =
    pkCount > 1 ||
    (table.foreignKeys.length >= 2 && table.columns.length <= 5) ||
    raw.includes('_has_') ||
    (raw.includes('_') && table.foreignKeys.length >= 2);

  if (isJunctionTable) {
    return [
      '+asignar()',
      '+revocar()',
      '+verificarAcceso()',
      '+listar()'
    ];
  }

  // 3. User, Auth, Accounts, Profiles, Persons, Clients, Employees
  if (
    raw.includes('usu') ||
    raw.includes('user') ||
    raw.includes('cliente') ||
    raw.includes('empleado') ||
    raw.includes('account') ||
    raw.includes('perfil') ||
    raw.includes('profile') ||
    raw.includes('persona') ||
    raw.includes('staff') ||
    raw.includes('member')
  ) {
    const hasPassword = hasCol('pass', 'con_usu', 'pwd', 'password', 'clave', 'hash');
    const methods = ['+autenticar()', '+actualizarPerfil()'];
    if (hasPassword) {
      methods.push('+cambiarClave()');
    }
    methods.push('+deshabilitar()');
    return methods;
  }

  // 4. Invoicing, Payments, Orders, Sales, Checkout, Bookings, Appointments
  if (
    raw.includes('fac') ||
    raw.includes('invoice') ||
    raw.includes('pago') ||
    raw.includes('payment') ||
    raw.includes('orden') ||
    raw.includes('order') ||
    raw.includes('venta') ||
    raw.includes('sale') ||
    raw.includes('transac') ||
    raw.includes('cobro') ||
    raw.includes('reserva') ||
    raw.includes('booking') ||
    raw.includes('cita')
  ) {
    if (raw.includes('cita') || raw.includes('reserva') || raw.includes('booking')) {
      return ['+agendar()', '+confirmar()', '+reprogramar()', '+cancelar()'];
    }
    const isParkingFactura = hasCol('hor_ent', 'hor_sal', 'veh', 'entrada', 'salida');
    if (isParkingFactura) {
      return [
        '+registrarEntrada()',
        '+registrarSalida()',
        '+calcularTotal()',
        '+emitirComprobante()'
      ];
    }
    return [
      '+generarFactura()',
      '+calcularTotal()',
      '+procesarPago()',
      '+anular()'
    ];
  }

  // 5. Products, Items, Articles, Services, Inventory, Menu
  if (
    raw.includes('prod') ||
    raw.includes('articulo') ||
    raw.includes('item') ||
    raw.includes('servicio') ||
    raw.includes('service') ||
    raw.includes('inventario') ||
    raw.includes('stock') ||
    raw.includes('menu')
  ) {
    const hasStock = hasCol('stock', 'cant', 'quantity', 'existencia');
    const hasPrice = hasCol('precio', 'price', 'costo', 'valor');
    const methods = ['+crear()'];
    if (hasStock) methods.push('+actualizarStock()');
    if (hasPrice) methods.push('+ajustarPrecio()');
    methods.push('+consultar()');
    methods.push('+deshabilitar()');
    return methods;
  }

  // 6. Physical spaces, parking bays, rooms, slots, assets
  if (
    raw.includes('espacio') ||
    raw.includes('bahia') ||
    raw.includes('slot') ||
    raw.includes('room') ||
    raw.includes('habitacion') ||
    raw.includes('cancha') ||
    raw.includes('mesa') ||
    raw.includes('zona') ||
    raw.includes('sede')
  ) {
    return [
      '+ocupar()',
      '+liberar()',
      '+verificarDisponibilidad()',
      '+cambiarEstado()'
    ];
  }

  // 7. Vehicles, Transport
  if (
    raw.includes('veh') ||
    raw.includes('car') ||
    raw.includes('auto') ||
    raw.includes('moto') ||
    raw.includes('camion')
  ) {
    if (raw.includes('tipo')) {
      return ['+listarTipos()', '+obtenerTarifa()', '+actualizar()'];
    }
    return [
      '+registrarVehiculo()',
      '+validarPlaca()',
      '+consultarPropietario()',
      '+obtenerHistorial()'
    ];
  }

  // 8. Rates, Tariffs, Pricing, Plans, Subscriptions
  if (
    raw.includes('tar') ||
    raw.includes('precio') ||
    raw.includes('price') ||
    raw.includes('plan') ||
    raw.includes('suscrip')
  ) {
    return [
      '+calcularValor()',
      '+ajustarTarifa()',
      '+consultarVigente()'
    ];
  }

  // 9. Expenses, Costs, Finance, Budgets
  if (
    raw.includes('gas') ||
    raw.includes('expense') ||
    raw.includes('costo') ||
    raw.includes('presupuesto') ||
    raw.includes('finanz')
  ) {
    return [
      '+registrarGasto()',
      '+calcularTotal()',
      '+filtrarPorFecha()',
      '+exportarReporte()'
    ];
  }

  // 10. Permissions, Roles, Catalogs, Taxonomies, Categories, Departments
  if (
    raw.includes('perm') ||
    raw.includes('rol') ||
    raw.includes('cat') ||
    raw.includes('tipo') ||
    raw.includes('estado') ||
    raw.includes('depto') ||
    raw.includes('area')
  ) {
    if (raw.includes('perm')) {
      return ['+listarPermisos()', '+verificarAcceso()', '+cambiarEstado()'];
    }
    if (raw.includes('rol')) {
      return ['+crearRol()', '+asignarPermisos()', '+consultarUsuarios()'];
    }
    return ['+listar()', '+agregar()', '+actualizar()', '+desactivar()'];
  }

  // 11. General entity fallback with intelligent hints from columns
  const methods = ['+registrar()', '+actualizar()', '+consultar()'];

  if (hasCol('precio', 'total', 'monto', 'val_', 'subtotal', 'saldo')) {
    methods.push('+calcularTotal()');
  } else if (hasCol('estado', 'status', 'est_')) {
    methods.push('+cambiarEstado()');
  } else if (hasCol('activo', 'act_', 'is_active', 'enabled', 'visible')) {
    methods.push('+deshabilitar()');
  } else {
    methods.push('+eliminar()');
  }

  return methods;
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

  // 2. Intelligent DML Filter: Ignore standalone data insertions, updates, drops, etc.
  // Must only match standalone statements (anchored to start of line or semicolon),
  // NEVER clauses like "ON UPDATE CASCADE" or "ON DELETE SET NULL" inside CREATE TABLE!
  cleaned = cleaned
    .replace(/(?:^|;)\s*INSERT\s+(?:IGNORE\s+|OR\s+IGNORE\s+)?INTO\s+[\s\S]*?;/gi, ';')
    .replace(/(?:^|;)\s*REPLACE\s+INTO\s+[\s\S]*?;/gi, ';')
    .replace(/(?:^|;)\s*UPDATE\s+(?:LOW_PRIORITY\s+|IGNORE\s+)?[\s\S]*?;/gi, ';')
    .replace(/(?:^|;)\s*DELETE\s+FROM\s+[\s\S]*?;/gi, ';')
    .replace(/(?:^|;)\s*DROP\s+(?:DATABASE|TABLE|VIEW|PROCEDURE|FUNCTION|TRIGGER)\s+[^;]*;/gi, ';')
    .replace(/(?:^|;)\s*CREATE\s+DATABASE\s+[^;]*;/gi, ';')
    .replace(/(?:^|;)\s*SELECT\s+[\s\S]*?;/gi, ';')
    .replace(/(?:^|;)\s*LOCK\s+TABLES\s+[\s\S]*?;/gi, ';')
    .replace(/(?:^|;)\s*UNLOCK\s+TABLES\s*;?/gi, ';')
    .replace(/(?:^|;)\s*SET\s+[^;]+;/gi, ';')
    .replace(/(?:^|;)\s*USE\s+[^;]+;/gi, ';');

  // 3. Extract CREATE TABLE statements with balanced parenthesis parsing
  // Regular expressions cannot balance nested parentheses like VARCHAR(120), DECIMAL(10,2), or DATETIME(6).
  // We locate "CREATE TABLE name (" and scan character-by-character to find the true closing ")".
  const createTableKeywordRegex = /\bCREATE\s+(?:TEMPORARY\s+)?TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?(?:[`"\[]?(\w+)[`"\]]?\.)?[`"\[]?(\w+)[`"\]]?\s*\(/gi;

  let match: RegExpExecArray | null;
  while ((match = createTableKeywordRegex.exec(cleaned)) !== null) {
    const rawTableName = sanitizeIdentifier(match[2] || match[1]);
    const startIndex = createTableKeywordRegex.lastIndex; // right after the first '('

    let depth = 1;
    let i = startIndex;
    let inSingleQuote = false;
    let inDoubleQuote = false;
    let inBacktick = false;

    while (i < cleaned.length && depth > 0) {
      const char = cleaned[i];
      const prevChar = i > 0 ? cleaned[i - 1] : '';

      if (char === "'" && prevChar !== '\\' && !inDoubleQuote && !inBacktick) {
        inSingleQuote = !inSingleQuote;
      } else if (char === '"' && prevChar !== '\\' && !inSingleQuote && !inBacktick) {
        inDoubleQuote = !inDoubleQuote;
      } else if (char === '`' && !inSingleQuote && !inDoubleQuote) {
        inBacktick = !inBacktick;
      } else if (!inSingleQuote && !inDoubleQuote && !inBacktick) {
        if (char === '(') {
          depth++;
        } else if (char === ')') {
          depth--;
          if (depth === 0) {
            break;
          }
        }
      }
      i++;
    }

    if (depth === 0) {
      const body = cleaned.substring(startIndex, i);
      const semicolonIndex = cleaned.indexOf(';', i);
      if (semicolonIndex !== -1) {
        createTableKeywordRegex.lastIndex = semicolonIndex + 1;
      } else {
        createTableKeywordRegex.lastIndex = i + 1;
      }

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
      // If the FK column in this child table is marked UNIQUE or is a single-column PRIMARY KEY, it's a 1:1 relation
      const pkCount = table.columns.filter((c) => c.isPk).length;
      const isSingleColPk = pkCount === 1 && Boolean(col?.isPk);
      const isOneToOne = col ? Boolean(isSingleColPk || col.isUnique) : false;
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
        const smartMethods = generateSmartMethods(table);
        for (const m of smartMethods) {
          mermaidCode += `        ${m}\n`;
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
