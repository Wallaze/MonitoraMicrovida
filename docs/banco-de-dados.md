Esse documento é especificamente sobre o modelo de dados.

Por exemplo, quando chegarmos ao modelo relacional planejado:

operadores
     │
     │
     ▼
lotes_cultura
     │
     │
     ▼
registros_diarios
     │
     └──────► mídias / Storage

Ele poderá documentar:

tabelas;
colunas;
tipos;
chaves primárias;
chaves estrangeiras;
relacionamentos;
índices;
constraints;
campos obrigatórios/opcionais;
histórico;
política de retenção;
relação entre banco PostgreSQL e Supabase Storage;
migrations;
seed;
evolução do esquema.

Esse documento será particularmente importante porque o banco atual do protótipo e o banco relacional que planejamos não são exatamente a mesma coisa.

Então não devemos fingir que aquilo que está planejado já está implementado.

Vamos documentar claramente:

Estado atual: ...

Modelo planejado: ...

Isso evita uma documentação tecnicamente bonita, mas falsa.
