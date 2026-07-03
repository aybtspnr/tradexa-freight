/**
 * usePlan — Hook de plano/assinatura.
 * Retorna funções para verificar acesso a recursos premium.
 */
export function usePlan() {
  return {
    canAccess: (_feature: string): boolean => {
      // Stub: sempre retorna false (recursos premium bloqueados)
      // Substituir por lógica real de planos/assinaturas
      return false;
    },
  };
}
