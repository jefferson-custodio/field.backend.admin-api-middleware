import { cnpj, cpf } from 'cpf-cnpj-validator';

export const isValidCpf = (n) => {
  return cpf.isValid(n);
};
export const isValidCnpj = (n) => {
  return cnpj.isValid(n);
};
