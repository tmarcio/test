# 🍽️ Aliado Food — Web App de Encomendas

Website e sistema de encomendas completo do **Aliado Food** (Luanda, Angola): refeições, pizzas e bebidas com
levantamento no ponto de venda ou **entrega por motorizada**, com **taxa calculada automaticamente pelo município**
com base numa tabela de referência de taxas de entregas por motorizada.

Construído com **Next.js 14 + TypeScript + Tailwind CSS + SQLite**, com painel de administração completo e
possibilidade de carregar (upload) imagens no cardápio, parceiros e atividades.

---

## ✨ Funcionalidades

### Cliente
- **Hero profissional e interativo** — animações, cartões flutuantes e chamadas à ação.
- **Cardápio completo** com categorias (Refeições · Pizzas · Bebidas), pesquisa, destaque e preços em Kz.
- **Carrinho persistente** (localStorage) com gestão de quantidades.
- **Checkout em 4 passos**:
  1. Itens do carrinho
  2. Levantar no ponto de venda **ou** receber em casa
  3. Dados do cliente (nome, telefone, e-mail opcional, método de pagamento, notas)
  4. Revisão e selagem do pedido
- **Taxa de entrega instantânea por município** — ao selecionar o município, a taxa (tabela de referência de motorizadas)
  aparece de imediato. Bairro e rua são opcionais.
- **Referência de rastreio** (`AF-XXXXXX`) criada pelo sistema após o pedido.
- **Página de rastreamento** com linha do tempo do estado da encomenda.
- **Envio pelo WhatsApp** (+244 929 809 889) do pedido completo, para atendimento mais célere.
- **Secção de parceiros** (imagem + nome) e **secção de atividades/eventos**.
- **Secção "Trabalhe Connosco"** — formulário de candidatura enviado para o e-mail oficial.
- **Rodapé com Programa de Fidelidade ALIADO+** → redireciona para `https://aliadomais.lovable.app`.
- Todos os contactos oficiais: telefone/WhatsApp **+244 929 809 889**, e-mail **aliadofood@hotmail.com**,
  Instagram **@aliadofood** e Facebook **@aliadofood.ao**.

### Equipa (Admin — `/admin`)
- Login protegido por palavra-passe (cookie assinado).
- **Resumo** da operação (encomendas hoje, pendentes, receita, estafetas disponíveis).
- **Gestão de encomendas**: confirmar → preparar → pronto → entregue/cancelar, notas de historial.
- **Atribuição de estafetas disponíveis** + botão para **notificar o estafeta pelo WhatsApp**.
- **Cardápio**: criar/editar/eliminar produtos com **upload de imagem**.
- **Taxas / Municípios**: editar distância, taxa base, Kz/km, ajuste manual e ativação —
  a taxa exibida ao cliente é recalculada automaticamente.
- **Estafetas**: cadastro, zona, motorizada, classificação e estado disponível/indisponível.
- **Parceiros e Atividades**: gestão completa com **upload de imagens**.
- **Candidaturas**: lista, estados (nova / em análise / contactada / arquivada) e contacto por WhatsApp.
- **Uploads** guardados fora do código (diretório `storage/uploads`, ignorado pelo Git).

---

## 🚀 Como correr localmente

Requisitos: **Node.js 18+** (Node 22 recomendado) e npm.

```bash
npm install
npm run dev
```

Abre `http://localhost:3000`.

> Se o `better-sqlite3` tentar compilar do zero e não tiver acesso à internet para os headers do Node,
> instala com: `npm_config_nodedir=/usr/local npm install`.

### Produção

```bash
npm run build
npm start
```

### Repor a base de dados inicial

```bash
npm run seed   # apaga data/aliado-food.db; é recriada e populada no próximo arranque
```

---

## 🔐 Palavra-passe do administrador

Por defeito: **`aliado2024`** (acesso em `/admin`). **Muda obrigatoriamente em produção**:

```bash
# .env (copia de .env.example)
ADMIN_PASSWORD=uma-palavra-passe-forte
ADMIN_SECRET=uma-frase-secreta-longa-e-aleatoria
```

---

## 📧 E-mail (SMTP) — opcional

As encomendas e candidaturas são sempre registadas na base de dados e acessíveis no painel.
Para receber também no e-mail oficial `aliadofood@hotmail.com`, configura SMTP no `.env`:

```env
SMTP_HOST=smtp.office365.com     # Hotmail/Outlook: smtp.office365.com
SMTP_PORT=587
SMTP_USER=aliadofood@hotmail.com
SMTP_PASS=palavra-passe-de-aplicacao
SMTP_FROM=Aliado Food <aliadofood@hotmail.com>
```

> Nota: para o Hotmail/Outlook é recomendada uma "palavra-passe de aplicação".
> Sem SMTP, o servidor regista "mailer:sem SMTP" na consola — tudo o resto funciona.

---

## 🛵 Taxas de entrega (tabela de referência)

A taxa segue uma tabela de referência de entregas por motorizada em Luanda:

| Parâmetro | Valor |
|---|---|
| Taxa mínima | **Kz 292,50** (2,3 km incluídos) |
| + por km adicional | **Kz 51,30/km** |
| Arredondamento | múltiplos de 50 Kz |
| Validade da tabela de referência | até 08.09.2026 |

Cálculo aplicado (base de dados → `lib/db.ts` → `deliveryFeeByDistance`):

```
taxa = máximo(292,50 ; 292,50 + 51,30 × (distância estimada − 2,3))
taxa = arredonda_para_cima(50)  +  ajuste_manual
```

- Cada município tem a sua **distância estimada** a partir do ponto de venda e tempo estimado.
- Tudo é editável no painel (**Taxas / Municípios**), incluindo um **ajuste manual** (ex.: reforço em zonas
  mais distantes) e a possibilidade de desativar municípios.
- O cliente vê a taxa imediatamente ao escolher o município; bairro/rua são preenchimento opcional.

---

## 📦 Estrutura do projeto

```
app/
├── page.tsx                 # Página inicial (hero + cardápio + parceiros + atividades + emprego)
├── menu/page.tsx            # Cardápio dedicado
├── rastreio/page.tsx        # Rastreamento por referência
├── admin/page.tsx           # Painel da equipa
├── api/                     # Rotas (públicas + admin + uploads)
components/                  # UI (carrinho, checkout, secções, painel admin)
lib/
├── db.ts                    # SQLite + schema + seed
├── catalog.ts               # Dados oficiais iniciais (cardápio, municípios, parceiros…)
├── orders.ts                # Lógica de encomendas + taxa de entrega
├── whatsapp.ts              # Ligações/mensagens WhatsApp
├── mailer.ts                # E-mail (nodemailer)
└── types.ts                 # Tipos + contactos oficiais da marca
public/images/               # Imagens do cardápio e secções
storage/uploads/             # Imagens carregadas no admin (fora do Git)
data/                        # Base de dados SQLite (criada em runtime, fora do Git)
```

## 🎨 Cores oficiais

| Uso | Cor |
|---|---|
| Vermelho Aliado (logótipo) | `#C62E1F` (`brand-red`) |
| Vermelho escuro | `#9E1F16` (`brand-redDark`) |
| Dourado da colher | `#F0A12E` (`brand-gold`) |
| Dourado claro | `#F6B95C` (`brand-goldLight`) |
| Laranja do cabo | `#E8762C` (`brand-orange`) |
| Escuro premium | `#120E0C` (`brand-dark`) |
| Creme de fundo | `#FBF5EC` (`brand-cream`) |

Todos os tokens estão em `tailwind.config.ts`.

## 🖼️ Logótipo

O logótipo oficial está aplicado em todo o site (`public/logo.svg`, `app/icon.svg` e cabeçalho): círculo
vermelho `#C62E1F` com garfo branco e colher dourada/laranja, acompanhado pelo slogan **“Seu aliado na fome.”**

> Se tiveres o ficheiro PNG original do logótipo (o anexo não chegou ao ambiente de trabalho), basta
> substituir `public/logo.svg` por ele — ou envia-o e aplico já a versão raster oficial.

## ☁️ Deploy

- **VPS / Railway / Render / Docker** (funções de Node com disco) — recomendado, porque o projeto usa
  **SQLite** e dá uploads; basta `npm install && npm run build && npm start` com `data/` e `storage/`
  persistentes.
- **Vercel**: a base de dados SQLite e os uploads locais não persistem no serverless. Para a Vercel, usa
  um armazenamento externo (ex.: Turso/Neon/Supabase para a BD e blob storage para uploads) — a camada de
  dados está isolada em `lib/db.ts` / `lib/uploads.ts` para facilitar a migração.

---

© Aliado Food · Feito em Angola 🇦🇴
