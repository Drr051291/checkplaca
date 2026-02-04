
# Plano: Corrigir Dashboard de Métricas do CheckPlaca

## Problema Identificado

O dashboard não está exibindo corretamente os dados de consultas, vendas e origens porque está buscando informações das tabelas erradas:

| Métrica | Tabela Atual (Errada) | Tabela Correta | Dados Janeiro 2026 |
|---------|----------------------|----------------|-------------------|
| Consultas | `vehicle_reports` (0 registros) | `plate_queries` | 62 consultas |
| Vendas | `payments` (dados antigos 2025) | `orders` | 4 vendas |
| Receita | `payments.amount` | `orders.amount_cents` | R$ 71,60 |
| Visitantes | `plate_queries` | `plate_queries` | OK |

## Solução Proposta

### 1. Corrigir fonte de dados de Vendas e Receita

Alterar a busca de vendas de `payments` para `orders`:

```text
Antes:  payments WHERE status = 'paid'
Depois: orders WHERE payment_status = 'paid'
```

**Importante**: O campo de valor em `orders` é `amount_cents` (em centavos), então precisamos converter para reais dividindo por 100.

### 2. Corrigir fonte de dados de Consultas

Alterar a busca de consultas de `vehicle_reports` para `plate_queries`:

```text
Antes:  vehicle_reports (0 registros)
Depois: plate_queries (62 consultas em janeiro)
```

### 3. Manter Visitantes

A métrica de visitantes já usa `plate_queries` e está funcionando (mostra 62).

### 4. Ajustar Origens de Tráfego

Como a tabela `orders` não possui campos UTM e os dados em `customers` estão desatualizados, vamos:
- Manter busca de UTM da tabela `customers` para vendas antigas
- Adicionar fallback para mostrar "Direto" quando não houver dados de UTM

### 5. Ajustar Gráficos

Atualizar a função `prepareDailyChartData` para usar os dados corretos de `orders` e `plate_queries`.

## Alterações Técnicas

### Arquivo: `src/pages/AdminDashboard.tsx`

**Mudanças na função `fetchDashboardData`:**

1. **Consultas**: Mudar de `vehicle_reports` para `plate_queries`
2. **Vendas/Receita**: Mudar de `payments` para `orders`
3. **Cálculo de receita**: Converter `amount_cents` para reais (`/ 100`)
4. **Gráficos diários**: Usar dados de `plate_queries` e `orders`

```typescript
// ANTES - Vendas (errado)
const { data: payments } = await supabase
  .from('payments')
  .select('*')
  .eq('status', 'paid')

// DEPOIS - Vendas (correto)
const { data: orders } = await supabase
  .from('orders')
  .select('*')
  .eq('payment_status', 'paid')

// Cálculo de receita
const revenue = orders?.reduce((sum, o) => 
  sum + ((o.amount_cents || 0) / 100), 0) || 0;
```

## Resultado Esperado

Após a correção, o dashboard para "Mês passado" (Janeiro 2026) mostrará:

| Métrica | Antes | Depois |
|---------|-------|--------|
| Visitantes | 62 | 62 |
| Consultas | 0 | 62 |
| Vendas | 0 | 4 |
| Receita | R$ 0,00 | R$ 71,60 |
| Taxa Conversão | 0% | 6.5% |
| Ticket Médio | R$ 0,00 | R$ 17,90 |

## Arquivos a Modificar

1. **`src/pages/AdminDashboard.tsx`** - Corrigir fontes de dados e cálculos
