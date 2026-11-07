-- ==========================================================
-- Plataforma SaaS E-Commerce Cloud (Esquema Normalizado)
-- 10 Tablas con convención de sufijo {atributo}_{sufijo}
-- ==========================================================

-- 1. Roles de usuario
CREATE TABLE IF NOT EXISTS roles (
    id_rol INT AUTO_INCREMENT PRIMARY KEY,
    nom_rol VARCHAR(50) NOT NULL UNIQUE,
    des_rol VARCHAR(255) NULL,
    act_rol BOOLEAN DEFAULT 1,
    cre_rol TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Organizaciones / Tenants
CREATE TABLE IF NOT EXISTS organizaciones (
    id_org INT AUTO_INCREMENT PRIMARY KEY,
    nom_org VARCHAR(100) NOT NULL,
    sub_org VARCHAR(50) NOT NULL UNIQUE,
    pla_org VARCHAR(50) DEFAULT 'FREE',
    act_org BOOLEAN DEFAULT 1,
    cre_org TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    upd_org TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 3. Usuarios de la plataforma
CREATE TABLE IF NOT EXISTS usuarios (
    id_usu INT AUTO_INCREMENT PRIMARY KEY,
    nom_usu VARCHAR(80) NOT NULL,
    ape_usu VARCHAR(80) NOT NULL,
    ema_usu VARCHAR(150) NOT NULL UNIQUE,
    pas_usu VARCHAR(255) NOT NULL,
    id_rol_usu INT NOT NULL,
    id_org_usu INT NOT NULL,
    act_usu BOOLEAN DEFAULT 1,
    cre_usu TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    upd_usu TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (id_rol_usu) REFERENCES roles (id_rol),
    FOREIGN KEY (id_org_usu) REFERENCES organizaciones (id_org)
);

-- 4. Planes de Suscripción
CREATE TABLE IF NOT EXISTS planes (
    id_pla INT AUTO_INCREMENT PRIMARY KEY,
    nom_pla VARCHAR(60) NOT NULL,
    cod_pla VARCHAR(30) NOT NULL UNIQUE,
    pre_men_pla DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    pre_anu_pla DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    lim_usu_pla INT DEFAULT 5,
    act_pla BOOLEAN DEFAULT 1,
    cre_pla TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. Suscripciones de Organizaciones
CREATE TABLE IF NOT EXISTS suscripciones (
    id_sus INT AUTO_INCREMENT PRIMARY KEY,
    id_org_sus INT NOT NULL,
    id_pla_sus INT NOT NULL,
    est_sus VARCHAR(30) DEFAULT 'ACTIVA',
    fec_ini_sus TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fec_ren_sus TIMESTAMP NOT NULL,
    cre_sus TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_org_sus) REFERENCES organizaciones (id_org),
    FOREIGN KEY (id_pla_sus) REFERENCES planes (id_pla)
);

-- 6. Categorías de Productos
CREATE TABLE IF NOT EXISTS categorias (
    id_cat INT AUTO_INCREMENT PRIMARY KEY,
    id_org_cat INT NOT NULL,
    nom_cat VARCHAR(80) NOT NULL,
    des_cat TEXT NULL,
    act_cat BOOLEAN DEFAULT 1,
    cre_cat TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_org_cat) REFERENCES organizaciones (id_org)
);

-- 7. Catálogo de Productos
CREATE TABLE IF NOT EXISTS productos (
    id_pro INT AUTO_INCREMENT PRIMARY KEY,
    id_org_pro INT NOT NULL,
    id_cat_pro INT NOT NULL,
    sku_pro VARCHAR(50) NOT NULL,
    nom_pro VARCHAR(120) NOT NULL,
    pre_pro DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    stk_pro INT NOT NULL DEFAULT 0,
    act_pro BOOLEAN DEFAULT 1,
    cre_pro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    upd_pro TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (id_org_pro) REFERENCES organizaciones (id_org),
    FOREIGN KEY (id_cat_pro) REFERENCES categorias (id_cat)
);

-- 8. Pedidos / Órdenes
CREATE TABLE IF NOT EXISTS pedidos (
    id_ped INT AUTO_INCREMENT PRIMARY KEY,
    id_org_ped INT NOT NULL,
    id_usu_ped INT NOT NULL,
    cod_ped VARCHAR(50) NOT NULL UNIQUE,
    est_ped VARCHAR(30) DEFAULT 'PENDIENTE',
    tot_ped DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    fec_ped TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    upd_ped TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (id_org_ped) REFERENCES organizaciones (id_org),
    FOREIGN KEY (id_usu_ped) REFERENCES usuarios (id_usu)
);

-- 9. Detalle de Pedidos
CREATE TABLE IF NOT EXISTS detalle_pedidos (
    id_dpe INT AUTO_INCREMENT PRIMARY KEY,
    id_ped_dpe INT NOT NULL,
    id_pro_dpe INT NOT NULL,
    cant_dpe INT NOT NULL DEFAULT 1,
    pre_uni_dpe DECIMAL(10,2) NOT NULL,
    sub_dpe DECIMAL(10,2) NOT NULL,
    cre_dpe TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_ped_dpe) REFERENCES pedidos (id_ped),
    FOREIGN KEY (id_pro_dpe) REFERENCES productos (id_pro)
);

-- 10. Transacciones de Pago
CREATE TABLE IF NOT EXISTS pagos (
    id_pag INT AUTO_INCREMENT PRIMARY KEY,
    id_ped_pag INT NOT NULL,
    ref_pag VARCHAR(100) NOT NULL UNIQUE,
    met_pag VARCHAR(50) NOT NULL,
    mon_pag DECIMAL(12,2) NOT NULL,
    est_pag VARCHAR(30) DEFAULT 'APROBADO',
    fec_pag TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_ped_pag) REFERENCES pedidos (id_ped)
);
