-- SEC-AUXILIAR - manutenção de tabelas de preços
-- Banco: MySQL / MariaDB
-- Execute no banco u813951513_secauxiliar antes de publicar os PHPs.

CREATE TABLE tabelas_precos (
    IdTabela INT NOT NULL AUTO_INCREMENT,
    Descricao VARCHAR(100) NOT NULL,
    Ativo TINYINT(1) NOT NULL DEFAULT 1,
    CriadoEm TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    AtualizadoEm TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    PRIMARY KEY (IdTabela),
    UNIQUE KEY uk_tabelas_precos_descricao (Descricao)
) ENGINE=InnoDB;

CREATE TABLE precos (
    IdPreco INT NOT NULL AUTO_INCREMENT,
    IdTabela INT NOT NULL,
    FaixaDesc VARCHAR(2) DEFAULT NULL,
    Grupo INT DEFAULT NULL,
    Curso VARCHAR(100) DEFAULT NULL,
    PeriodoArea VARCHAR(100) DEFAULT NULL,
    Contratual DECIMAL(10,2) DEFAULT NULL,
    Valor DECIMAL(10,2) DEFAULT NULL,
    VrSab DECIMAL(10,2) DEFAULT NULL,
    TemDesc CHAR(1) NOT NULL DEFAULT 'S',
    Mostrar CHAR(1) NOT NULL DEFAULT 'S',
    F0 DECIMAL(10,2) DEFAULT NULL,
    Fa DECIMAL(10,2) DEFAULT NULL,
    Fb DECIMAL(10,2) DEFAULT NULL,
    Fc DECIMAL(10,2) DEFAULT NULL,
    Fd DECIMAL(10,2) DEFAULT NULL,
    Fe DECIMAL(10,2) DEFAULT NULL,
    F100 DECIMAL(10,2) DEFAULT NULL,
    Cc DECIMAL(10,2) DEFAULT NULL,
    Ea DECIMAL(10,2) DEFAULT NULL,
    ParDif INT DEFAULT NULL,
    Ativo CHAR(1) NOT NULL DEFAULT 'S',
    Opcional CHAR(1) NOT NULL DEFAULT 'N',
    CriadoEm TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    AtualizadoEm TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    PRIMARY KEY (IdPreco),
    KEY idx_precos_tabela (IdTabela),
    KEY idx_precos_curso (Curso),

    CONSTRAINT fk_precos_tabela
        FOREIGN KEY (IdTabela)
        REFERENCES tabelas_precos (IdTabela)
        ON UPDATE CASCADE
        ON DELETE RESTRICT
) ENGINE=InnoDB;

CREATE TABLE tabelas_precos_unidades (
    IdUnidade VARCHAR(20) NOT NULL,
    IdTabela INT NOT NULL,
    CriadoEm TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    -- A chave primária em IdUnidade garante uma única tabela por unidade.
    PRIMARY KEY (IdUnidade),
    KEY idx_tpu_tabela (IdTabela),

    CONSTRAINT fk_tpu_tabela
        FOREIGN KEY (IdTabela)
        REFERENCES tabelas_precos (IdTabela)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,

    CONSTRAINT fk_tpu_unidade
        FOREIGN KEY (IdUnidade)
        REFERENCES prt_unidades (idund)
        ON UPDATE CASCADE
        ON DELETE RESTRICT
) ENGINE=InnoDB;

-- Cadastros iniciais sugeridos. Podem ser alterados pela tela.
INSERT IGNORE INTO tabelas_precos (Descricao, Ativo) VALUES
    ('CAPITAL', 1),
    ('ABC', 1),
    ('RIBEIRÃO PRETO', 1);
