export function IsNotEmptyMessage(
  field: string,
  translatedField: string,
): string {
  return `${field}<->${translatedField} não pode estar vazio`;
}

export function InvalidMessage(field: string, translatedField: string): string {
  return `${field}<->Insira um ${translatedField} válido`;
}

export function IsNotANumberMessage(
  field: string,
  translatedField: string,
): string {
  return `${field}<->${translatedField} deveria ser um número`;
}

export function InvalidPasswordMessage(field: string): string {
  return `${field}<->A senha deve conter pelo menos 8 caracteres, uma letra maiúscula, uma letra minúscula e um dígito.`;
}

export function InvalidEnumMessage(
  field: string,
  translatedField: string,
  options: Object,
): string {
  return `${field}<->${translatedField} deve ser uma das seguintes opções: ${Object.values(
    options,
  ).join(', ')}`;
}

export function FullNameMessage(
  field: string,
  translatedField: string,
): string {
  return `${field}<->Insira o ${translatedField} completo`;
}

export function GenericErrorMessage(
  field: string,
  translatedField: string,
): string {
  return `${field}<-> ${translatedField}`;
}
