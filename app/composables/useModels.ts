import { MODELS } from '#shared/utils/models'

export function useModels() {
  const model = useCookie<string>('model', { default: () => 'minimax/m2.7' })

  return {
    models: MODELS,
    model
  }
}
