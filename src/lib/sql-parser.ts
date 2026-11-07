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
 *
 * It dynamically analyzes:
 * 1. The structural & semantic archetype of the table (Junction, Line Item, Aggregate Root,
 *    Append-Only Ledger/Log, Security Token, Master Catalog, Living Entity, etc.)
 * 2. Which lifecycle methods MUST be included (e.g. specialized domain verbs)
 * 3. Which methods MUST BE EXCLUDED (e.g. NEVER put `eliminar()` when soft-delete or state
 *    machine is present; NEVER put `actualizar()` on immutable logs; NO generic CRUD on junction tables)
 * 4. Deep column-level capability synthesis (pricing, stock, credentials, temporal validation, files)
 */
export function generateSmartMethods(table: TableInfo): string[] {
  const raw = table.name.toLowerCase().replace(/^(tbl_|cs_|cat_|t_)/, '');
  const cols = table.columns.map((c) => c.name.toLowerCase());

  const hasCol = (...names: string[]) => cols.some((c) => names.some((n) => c.includes(n)));

  // Structural indicators
  const pkCols = table.columns.filter((c) => c.isPk);
  const isCompositePk = pkCols.length > 1;
  const fkCount = table.foreignKeys.length;

  // Deletion & lifecycle characteristics
  const hasSoftDelete = hasCol('deleted_at', 'is_deleted', 'eliminado', 'fec_eli', 'borrado');
  const hasActiveFlag = hasCol('activo', 'is_active', 'enabled', 'habilitado', 'act_', 'status_act');
  const hasState = hasCol('estado', 'status', 'est_', 'state', 'situacion', 'condicion');

  // Column domain capabilities
  const hasMoneyOrTotal = hasCol('precio', 'total', 'monto', 'val_', 'subtotal', 'saldo', 'costo', 'tarifa', 'deuda', 'abono');
  const hasStockOrQty = hasCol('stock', 'existencia', 'cant', 'quantity', 'inventario');
  const hasCredentials = hasCol('pass', 'con_usu', 'pwd', 'password', 'clave', 'hash');
  const hasTimeRange = (hasCol('hora_ini', 'hora_inicio', 'start_time') && hasCol('hora_fin', 'end_time')) ||
                       (hasCol('fec_ini', 'fecha_inicio', 'start_date') && hasCol('fec_fin', 'fecha_fin', 'end_date'));
  const hasMediaFiles = hasCol('imagen', 'foto', 'archivo', 'url', 'avatar', 'adjunto', 'comprobante_img', 'pdf');
  const hasBarcodeOrSku = hasCol('barcode', 'sku', 'codigo_barra', 'qr');

  // 1. Logs, History, and Audit (Append-only / Immutable tracking)
  const isAuditOrLog =
    raw.includes('audit') ||
    raw.includes('log') ||
    raw.includes('historial') ||
    raw.includes('history') ||
    raw.includes('evento') ||
    raw.includes('track') ||
    raw.includes('bitacora') ||
    raw.includes('trazab');

  if (isAuditOrLog) {
    // Clinical history is a specialized veterinary medical document
    if (raw.includes('historial') && (raw.includes('clin') || hasCol('diag', 'tra_', 'pes_', 'tem_'))) {
      return [
        '+registrar()',
        '+actualizar()',
        '+consultar()',
        '+visualizar()',
        '+abrirEntrada()',
        '+prescribirTratamiento()',
        '+exportarResumenPDF()'
      ];
    }
    // Standard system/audit logs are strictly APPEND-ONLY: NO actualizar(), NO eliminar()
    return [
      '+registrar()',
      '+consultar()',
      '+filtrarPorUsuario()',
      '+filtrarPorRecurso()',
      '+exportarCSV()'
    ];
  }

  // 2. Order Details, Sale Lines, Appointment Details, Line Items
  const isLineItemDetail =
    raw.includes('detalle') ||
    raw.includes('detail') ||
    raw.includes('line') ||
    raw.includes('renglon') ||
    (raw.includes('item') && !raw.includes('invent') && !raw.includes('catalog')) ||
    (fkCount >= 2 && hasCol('cant', 'quantity', 'subtotal', 'pre_uni', 'precio_uni', 'sub_'));

  if (isLineItemDetail) {
    const methods = [
      '+registrar()',
      '+actualizar()',
      '+consultar()',
      '+agregar()',
      '+eliminar()',
      '+calcularSubtotal()'
    ];
    if (hasStockOrQty) {
      methods.push('+validarDisponibilidad()');
    }
    return methods;
  }

  // 3. Pivot / Pure Junction / Access-Mapping Tables
  const isJunctionTable =
    !isLineItemDetail &&
    (isCompositePk || (fkCount >= 2 && table.columns.length <= 5) || raw.includes('_has_') || (raw.includes('_') && fkCount >= 2)) &&
    !hasCol('cant', 'subtotal', 'precio', 'total', 'observacion', 'diagnostico');

  if (isJunctionTable) {
    // Pure junction tables link entities: they don't have autonomous CRUD
    return [
      '+asignar()',
      '+revocar()',
      '+verificarAcceso()',
      '+listar()'
    ];
  }

  // 4. Pets, Animals, Veterinary Patients
  if (
    raw.includes('mascota') ||
    raw.includes('pet') ||
    raw.includes('animal') ||
    raw.includes('paciente')
  ) {
    return [
      '+registrar()',
      '+actualizar()',
      '+consultar()',
      '+deshabilitar()',
      '+actualizarPeso()',
      '+listarPorPropietario()',
      '+obtenerCarnetCompleto()'
    ];
  }

  // 5. Vaccines, Immunizations, Medical Doses
  if (
    raw.includes('vacuna') ||
    raw.includes('vaccin') ||
    raw.includes('dosis') ||
    raw.includes('inmuniz')
  ) {
    return [
      '+registrar()',
      '+actualizar()',
      '+consultar()',
      '+aplicarDosis()',
      '+programarRefuerzo()',
      '+obtenerCarnetVacunacion()'
    ];
  }

  // 6. Appointments, Bookings, Scheduling (Workflow Aggregate)
  if (
    raw.includes('cita') ||
    raw.includes('reserva') ||
    raw.includes('booking') ||
    raw.includes('appointment')
  ) {
    // Appointments follow a state lifecycle: they are canceled or rescheduled, never hard deleted
    return [
      '+registrar()',
      '+actualizar()',
      '+consultar()',
      '+visualizar()',
      '+agendarCita()',
      '+reprogramar()',
      '+iniciarAtencion()',
      '+cancelarCita()',
      '+verificarDisponibilidad()'
    ];
  }

  // 7. User, Auth, Accounts, Profiles, Persons, Clients, Employees
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
    const methods = ['+registrar()', '+actualizar()', '+consultar()'];
    if (hasCredentials) {
      methods.push('+autenticar()');
      methods.push('+cambiarPassword()');
      if (hasCol('totp', '2fa', 'mfa')) {
        methods.push('+verificarTOTP()');
      }
    }
    // Users are deactivated to preserve foreign key referential integrity
    methods.push('+deshabilitar()');
    return methods;
  }

  // 8. Roles & Permissions
  if (raw.includes('rol') || raw.includes('role')) {
    return [
      '+registrar()',
      '+actualizar()',
      '+consultar()',
      '+obtenerPermisosRol()',
      '+sincronizarPermisosDefault()'
    ];
  }

  if (raw.includes('perm') || raw.includes('permission')) {
    return [
      '+registrar()',
      '+actualizar()',
      '+consultar()',
      '+eliminar()',
      '+asignarPermiso()',
      '+verificarPermiso()'
    ];
  }

  // 9. Services
  if (raw.includes('servicio') || raw.includes('service')) {
    return [
      '+registrar()',
      '+actualizar()',
      '+consultar()',
      '+agregar()',
      '+deshabilitar()',
      '+actualizarTarifa()',
      '+listarActivos()'
    ];
  }

  // 10. Products, Articles, Catalog, Physical Inventory
  if (
    raw.includes('prod') ||
    raw.includes('articulo') ||
    raw.includes('inventario') ||
    raw.includes('stock') ||
    raw.includes('menu') ||
    raw.includes('catalogo')
  ) {
    const methods = ['+registrar()', '+actualizar()', '+consultar()'];
    if (hasStockOrQty) {
      methods.push('+descontarStock()');
      methods.push('+reponerStock()');
      methods.push('+verificarStockBajo()');
    }
    if (hasMoneyOrTotal) methods.push('+actualizarPrecios()');
    if (hasBarcodeOrSku) methods.push('+buscarPorCodigo()');
    methods.push('+deshabilitar()');
    return methods;
  }

  // 11. Stock Movements & Kardex (Append-only: NO actualizar, NO eliminar)
  if (raw.includes('stock_mov') || raw.includes('mov_stm') || raw.includes('kardex')) {
    return [
      '+registrar()',
      '+consultar()',
      '+registrarEntrada()',
      '+registrarSalidaVenta()',
      '+registrarSalidaCita()',
      '+obtenerKardex()'
    ];
  }

  // 12. Invoicing, Payments, Orders, Sales, Checkout (Fiscal / Transactional Aggregate)
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
    raw.includes('cobro')
  ) {
    const isParkingFactura = hasCol('hor_ent', 'hor_sal', 'veh', 'entrada', 'salida');
    if (isParkingFactura) {
      return [
        '+registrarEntrada()',
        '+registrarSalida()',
        '+calcularTotal()',
        '+emitirComprobante()'
      ];
    }
    // Financial records are never deleted; they are annulled or credited
    return [
      '+registrar()',
      '+actualizar()',
      '+consultar()',
      '+visualizar()',
      '+calcularTotal()',
      '+finalizarVenta()',
      '+generarFacturaPDF()',
      '+anular()'
    ];
  }

  // 13. Attendance, Time Tracking, Shifts, Schedules
  if (
    raw.includes('asist') ||
    raw.includes('attendance') ||
    raw.includes('horario') ||
    raw.includes('schedule') ||
    raw.includes('turno') ||
    raw.includes('shift')
  ) {
    if (raw.includes('asist') || raw.includes('attendance')) {
      return [
        '+registrar()',
        '+actualizar()',
        '+consultar()',
        '+marcarEntradaQR()',
        '+marcarSalidaQR()',
        '+calcularHorasLaboradas()',
        '+justificarFalta()'
      ];
    }
    return [
      '+registrar()',
      '+actualizar()',
      '+consultar()',
      '+eliminar()',
      '+validarSinSolape()',
      '+excluirAlmuerzo()',
      '+obtenerHorasDisponibles()'
    ];
  }

  // 14. Payroll, Salaries, Labor Rates
  if (
    raw.includes('nomina') ||
    raw.includes('payroll') ||
    raw.includes('salario') ||
    raw.includes('sueldo') ||
    raw.includes('tarifa')
  ) {
    if (raw.includes('tarifa') || raw.includes('rate')) {
      return [
        '+registrar()',
        '+actualizar()',
        '+consultar()',
        '+definirTarifa()',
        '+obtenerTarifaVigente()'
      ];
    }
    return [
      '+registrar()',
      '+consultar()',
      '+visualizar()',
      '+liquidarPeriodo()',
      '+marcarComoPagado()',
      '+generarColillaPDF()'
    ];
  }

  // 15. Password Resets, Sessions, Tokens, API Keys, OAuth, Nonces, Rate Limits (Temporary Security)
  if (
    raw.includes('reset') ||
    raw.includes('token') ||
    raw.includes('session') ||
    raw.includes('api_key') ||
    raw.includes('oauth') ||
    raw.includes('nonce') ||
    raw.includes('rate_limit') ||
    raw.includes('qr_scan') ||
    raw.includes('idempot')
  ) {
    if (raw.includes('reset')) {
      return [
        '+registrar()',
        '+consultar()',
        '+solicitarReset()',
        '+validarToken()',
        '+consumirToken()',
        '+purgarExpirados()'
      ];
    }
    if (raw.includes('idempot')) {
      return [
        '+registrar()',
        '+consultar()',
        '+guardarRespuesta()',
        '+obtenerRespuesta()',
        '+purgarExpiradas()'
      ];
    }
    if (raw.includes('rate_limit')) {
      return [
        '+registrar()',
        '+consultar()',
        '+verificarBloqueo()',
        '+limpiarHistorial()'
      ];
    }
    if (raw.includes('nonce')) {
      return [
        '+registrar()',
        '+consultar()',
        '+validarYConsumirNonce()',
        '+purgarExpirados()'
      ];
    }
    if (raw.includes('qr')) {
      return [
        '+registrar()',
        '+consultar()',
        '+validarEscaneo()',
        '+detectarAnomalias()'
      ];
    }
    if (raw.includes('oauth')) {
      if (raw.includes('client')) {
        return [
          '+registrar()',
          '+actualizar()',
          '+consultar()',
          '+validarCredenciales()',
          '+validarRedirectUri()'
        ];
      }
      return [
        '+registrar()',
        '+consultar()',
        '+emitirCodigo()',
        '+canjearCodigo()',
        '+purgarCodigosExpirados()'
      ];
    }
    return [
      '+registrar()',
      '+consultar()',
      '+generarToken()',
      '+validarTokenHash()',
      '+revocarToken()',
      '+purgarExpirados()'
    ];
  }

  // 16. Translations / i18n
  if (
    raw.includes('traducc') ||
    raw.includes('translation') ||
    raw.includes('i18n')
  ) {
    return [
      '+registrar()',
      '+actualizar()',
      '+consultar()',
      '+eliminar()',
      '+guardarTraduccion()',
      '+obtenerTraduccion()'
    ];
  }

  // 17. Announcements, Ads, Banners, Posts
  if (
    raw.includes('anuncio') ||
    raw.includes('ad') ||
    raw.includes('banner') ||
    raw.includes('post') ||
    raw.includes('noticia')
  ) {
    return [
      '+registrar()',
      '+actualizar()',
      '+consultar()',
      '+deshabilitar()',
      '+publicarAnuncio()',
      '+cambiarVisibilidad()'
    ];
  }

  // 18. Physical spaces, parking bays, rooms, slots, assets
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

  // 19. Vehicles, Transport
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

  // 20. Rates, Tariffs, Pricing, Plans, Subscriptions
  if (
    raw.includes('tar') ||
    raw.includes('precio') ||
    raw.includes('price') ||
    raw.includes('plan') ||
    raw.includes('suscrip')
  ) {
    return [
      '+registrar()',
      '+actualizar()',
      '+consultar()',
      '+deshabilitar()',
      '+destacarPlan()'
    ];
  }

  // 21. Expenses, Costs, Finance, Budgets
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

  // 22. Parametric Lookup / Master Catalogs (razas, especies, departamentos, etc.)
  const isLookupCatalog =
    raw.startsWith('cat_') ||
    raw.startsWith('tipo_') ||
    raw.startsWith('tipos_') ||
    raw.includes('categoria') ||
    raw.includes('especie') ||
    raw.includes('raza') ||
    raw.includes('genero') ||
    raw.includes('pais') ||
    raw.includes('departamento') ||
    raw.includes('municipio') ||
    raw.includes('ciudad') ||
    raw.includes('moneda');

  if (isLookupCatalog) {
    const catalogMethods = ['+registrar()', '+actualizar()', '+consultar()', '+listarActivos()', '+buscarPorNombre()'];
    if (hasActiveFlag) catalogMethods.push('+deshabilitar()');
    return catalogMethods;
  }

  // 23. Intelligent Dynamic Behavioral Synthesis for ANY Unmatched / Custom Table
  // Rather than default static CRUD, it constructs methods based on actual table semantics & column usage:
  const methods: string[] = ['+registrar()', '+actualizar()', '+consultar()'];

  // Detail / Long-text inspection
  if (hasCol('desc', 'nota', 'obs', 'detalle', 'body', 'content', 'comentario', 'json')) {
    methods.push('+visualizar()');
  }

  // Financial / Subtotal calculations
  if (hasMoneyOrTotal) {
    methods.push('+calcularTotal()');
  }

  // Stock / Availability checks
  if (hasStockOrQty) {
    methods.push('+verificarDisponibilidad()');
  }

  // Temporal slot & scheduling validation
  if (hasTimeRange) {
    methods.push('+validarSinSolape()');
  }

  // Media / File attachment handling
  if (hasMediaFiles) {
    methods.push('+subirArchivo()');
  }

  // Search by code / barcode
  if (hasBarcodeOrSku) {
    methods.push('+buscarPorCodigo()');
  }

  // Deletion vs Inactivation vs State Machine (Deciding WHICH TO PUT OR NOT TO PUT):
  if (hasSoftDelete) {
    // Soft deletion pattern: never physically delete
    methods.push('+softDelete()');
    methods.push('+restaurar()');
  } else if (hasActiveFlag) {
    // Inactivation pattern: soft disable to protect referential integrity
    methods.push('+deshabilitar()');
  } else if (hasState) {
    // State machine pattern
    methods.push('+cambiarEstado()');
  } else {
    // Physical delete ONLY when no status or soft-delete safety exists
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
