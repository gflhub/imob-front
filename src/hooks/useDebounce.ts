import { useState, useEffect } from 'react';

/**
 * Um hook customizado que atrasa a atualização de um valor. Útil para "amortecer"
 * eventos frequentes, como a digitação em um campo de busca.
 * @param value O valor a ser "atrasado" (ex: o termo de busca do input).
 * @param delay O tempo de atraso em milissegundos.
 * @returns O valor "atrasado", que só é atualizado após o delay sem novas alterações.
 */
export function useDebounce<T>(value: T, delay: number): T {
    // Estado para armazenar o valor "atrasado" (debounced)
    const [debouncedValue, setDebouncedValue] = useState<T>(value);

    useEffect(() => {
        // Configura um timer (setTimeout) que só vai atualizar o estado após o 'delay'
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        // Função de limpeza do useEffect:
        // Isso é crucial. Se o `value` (ou `delay`) mudar antes do timer terminar,
        // o timer anterior é cancelado e um novo é criado. Isso garante que a atualização
        // só aconteça quando o usuário parar de digitar pelo tempo do delay.
        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]); // O efeito só roda novamente se o `value` ou o `delay` mudarem

    // Retorna o valor debounced, que o seu componente usará para fazer a chamada à API.
    return debouncedValue;
}